/**
 * TZ-200.C Migration Script: Warehouse.roleIds[] → WarehouseAccess join-entity.
 *
 * Reads each warehouse's `roleIds` array, creates one `WarehouseAccess` doc
 * per (warehouseId, roleId) pair with `permission='admin'` (preserves original
 * privilege level — extensions go through dedicated service endpoints), then
 * `$unset` `roleIds` on the source documents.
 *
 * Per AGENTS.md TZF-00 idempotency contract:
 *   - NestFactory context for production DI
 *   - Pre/pair-count assertions via $unwind aggregation
 *   - Sandwich-check (no entries with both `roleIds` and existing WA doc)
 *   - Idempotent (no-op if roleIds already absent)
 *   - Explicit `grantedAt: new Date()` (not relying on Mongoose defaults during bulk insert)
 *
 * Usage:
 *   pnpm exec ts-node backend/scripts/migrate-warehouse-roleids-to-warehouseaccess.ts
 */
import mongoose from 'mongoose';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';

async function migrate(): Promise<void> {
  await NestFactory.createApplicationContext(AppModule);

  const db = mongoose.connection.db;
  if (!db) {
    throw new Error('[migrate] Mongoose connection db unavailable');
  }

  // PRE-COUNT: exact number of (warehouseId, roleId) pairs via $unwind.
  // Per thinker Q3 — aggregation gives ground-truth, not guesswork.
  const aggregateResult = await db
    .collection('warehouses')
    .aggregate<{ total: number }>([
      { $match: { roleIds: { $exists: true, $ne: [] } } },
      { $unwind: '$roleIds' },
      { $count: 'total' },
    ])
    .toArray();
  const expectedPairs = aggregateResult[0]?.total ?? 0;
  console.log(`[migrate] Pre-migration roleIds pairs across all warehouses: ${expectedPairs}`);

  // Idempotent exit
  if (expectedPairs === 0) {
    console.log('[migrate] No roleIds fields found — already migrated. No-op exit.');
    await mongoose.disconnect();
    return;
  }

  // Sandwich check: abort if legacy + new co-exist (data integrity issue)
  const legacyCount = await db
    .collection('warehouses')
    .countDocuments({ roleIds: { $exists: true, $ne: [] } });
  if (legacyCount === 0) {
    console.log('[migrate] Mid-flight: legacy roleIds already cleared. Aborting to prevent duplicate WA inserts.');
    await mongoose.disconnect();
    throw new Error('[migrate] ABORT: countDocuments returned 0 after aggregation returned >0. Race condition detected.');
  }

  // BUILD WA DOCUMENTS via aggregation pipeline (explicit grantedAt, not Mongoose default)
  const pairs = await db
    .collection('warehouses')
    .aggregate<{ _id: mongoose.Types.ObjectId; roleId: mongoose.Types.ObjectId }>([
      { $match: { roleIds: { $exists: true, $ne: [] } } },
      { $unwind: '$roleIds' },
      {
        $project: {
          warehouseId: '$_id',
          roleId: '$roleIds',
          permission: { $literal: 'admin' },
          // Explicit grantedAt at run-time (per thinker Q1)
          grantedAt: { $literal: new Date() },
        },
      },
    ])
    .toArray();

  if (pairs.length !== expectedPairs) {
    throw new Error(
      `[migrate] FAIL: aggregation returned ${pairs.length} pairs, expected ${expectedPairs}. Refusing to insert.`,
    );
  }

  // INSERT in batches of 500 (Mongoose bulkWrite limit safety)
  const batchSize = 500;
  let inserted = 0;
  for (let i = 0; i < pairs.length; i += batchSize) {
    const batch = pairs.slice(i, i + batchSize);
    await db.collection('warehouseaccesses').insertMany(batch, { ordered: false });
    inserted += batch.length;
    console.log(`[migrate] Inserted ${inserted}/${pairs.length} WarehouseAccess docs...`);
  }

  // $unset roleIds on all warehouses (only those with non-empty arrays)
  const unsetResult = await db
    .collection('warehouses')
    .updateMany(
      { roleIds: { $exists: true, $ne: [] } },
      { $unset: { roleIds: '' } },
    );
  console.log(
    `[migrate] $unset roleIds on ${unsetResult.modifiedCount} warehouse docs (modifiedCount=${unsetResult.modifiedCount})`,
  );

  // POST-COUNT VERIFICATION
  const postLegacyCount = await db
    .collection('warehouses')
    .countDocuments({ roleIds: { $exists: true, $ne: [] } });
  if (postLegacyCount !== 0) {
    throw new Error(
      `[migrate] FAIL: ${postLegacyCount} warehouses still have roleIds after $unset`,
    );
  }
  const postWACount = await db.collection('warehouseaccesses').countDocuments({ permission: 'admin' });
  if (postWACount !== expectedPairs) {
    throw new Error(
      `[migrate] FAIL: WA admin-doc count ${postWACount} != expected pre-pair count ${expectedPairs}`,
    );
  }

  console.log(`[migrate] Migration complete. All ${expectedPairs} roleIds pairs moved to WarehouseAccess (admin permission).`);
  await mongoose.disconnect();
}

migrate()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('[migrate] ERROR:', err);
    process.exit(1);
  });
