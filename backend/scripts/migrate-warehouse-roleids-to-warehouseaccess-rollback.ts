/**
 * TZ-200.C Rollback Script: WarehouseAccess → Warehouse.roleIds (inverse).
 *
 * Reverses the main migration if applied in error. Idempotent.
 *
 * Scans `warehouseaccesses` for admin-permission grants (the only ones
 * originally migrated from `roleIds[]`), groups by warehouseId, $sets
 * `roleIds` back on each warehouse, and deletes the migrated WA docs.
 *
 * NOTE: This rollback ONLY restores admin-permission grants. Read/write
 * grants added AFTER migration (via API endpoints) are NOT touched.
 *
 * Usage:
 *   pnpm exec ts-node backend/scripts/migrate-warehouse-roleids-to-warehouseaccess-rollback.ts
 */
import mongoose from 'mongoose';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';

async function rollback(): Promise<void> {
  await NestFactory.createApplicationContext(AppModule);

  const db = mongoose.connection.db;
  if (!db) {
    throw new Error('[rollback] Mongoose connection db unavailable');
  }

  // PRE-ROLLBACK COUNT: how many admin WA grants we'll move back
  const preCount = await db
    .collection('warehouseaccesses')
    .countDocuments({ permission: 'admin' });
  console.log(`[rollback] Pre-rollback admin WA doc count: ${preCount}`);

  if (preCount === 0) {
    console.log('[rollback] No admin WA docs found — migration not applied or already rolled back. No-op.');
    await mongoose.disconnect();
    return;
  }

  // Sandwich-check: abort if warehouse already has roleIds (would cause duplicates)
  const warehousesWithRoleIds = await db
    .collection('warehouses')
    .countDocuments({ roleIds: { $exists: true, $ne: [] } });
  if (warehousesWithRoleIds > 0) {
    throw new Error(
      `[rollback] ABORT: ${warehousesWithRoleIds} warehouses already have roleIds. Manual cleanup required.`,
    );
  }

  // GROUP WA admin docs by warehouseId → array of roleIds
  const grouped = await db
    .collection('warehouseaccesses')
    .aggregate<{ _id: mongoose.Types.ObjectId; roleIds: mongoose.Types.ObjectId[] }>([
      { $match: { permission: 'admin' } },
      { $group: { _id: '$warehouseId', roleIds: { $push: '$roleId' } } },
    ])
    .toArray();

  console.log(`[rollback] Found ${grouped.length} warehouses to restore roleIds on`);

  // $set warehouse.roleIds for each warehouse
  for (const w of grouped) {
    await db.collection('warehouses').updateOne(
      { _id: w._id },
      { $set: { roleIds: w.roleIds } },
    );
  }

  // DELETE migrated WA docs (admin only — preserves any read/write grants made post-migration)
  const deleteResult = await db
    .collection('warehouseaccesses')
    .deleteMany({ permission: 'admin' });
  console.log(`[rollback] Deleted ${deleteResult.deletedCount} admin WA docs`);

  // POST-VERIFY
  const postWACount = await db
    .collection('warehouseaccesses')
    .countDocuments({ permission: 'admin' });
  if (postWACount !== 0) {
    throw new Error(
      `[rollback] FAIL: ${postWACount} admin WA docs still present after deletion`,
    );
  }
  const restoredWarehouses = await db
    .collection('warehouses')
    .countDocuments({ roleIds: { $exists: true, $ne: [] } });
  if (restoredWarehouses !== grouped.length) {
    throw new Error(
      `[rollback] FAIL: ${restoredWarehouses} warehouses have roleIds, expected ${grouped.length}`,
    );
  }

  console.log(`[rollback] Rollback complete. Restored roleIds on ${grouped.length} warehouses, deleted ${deleteResult.deletedCount} admin WA docs.`);
  await mongoose.disconnect();
}

rollback()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('[rollback] ERROR:', err);
    process.exit(1);
  });
