/**
 * TZ-199 Migration Script: Proposal \u21c4 Quotation single-source-of-truth.
 *
 * Renames `proposalId` field to `quotationId` in `contracts` and `productionorders` collections.
 * Per AGENTS.md TZF-00 + TZ-199 AC #6 (rollback script paired).
 *
 * Idempotent: skip if `proposalId` already absent.
 * Pre/post-count assertions verify migration applied correctly.
 *
 * Usage:
 *   pnpm exec ts-node backend/scripts/migrate-proposal-to-quotation.ts
 */
import mongoose from 'mongoose';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';

async function migrate(): Promise<void> {
  await NestFactory.createApplicationContext(AppModule);

  const db = mongoose.connection.db;
  if (!db) {
    throw new Error('Mongoose connection db unavailable');
  }

  const collections = ['contracts', 'productionorders'] as const;

  // PRE-MIGRATION COUNT ASSERTION (per TZ-199 AC #5)
  const preCounts: Record<string, number> = {};
  for (const c of collections) {
    preCounts[c] = await db.collection(c).countDocuments({ proposalId: { $exists: true } });
  }
  console.log('[migrate] Pre-migration proposalId counts:', preCounts);

  // Sandwich-check: if any collection has BOTH fields, abort (data integrity issue)
  for (const c of collections) {
    const both = await db.collection(c).countDocuments({
      proposalId: { $exists: true },
      quotationId: { $exists: true },
    });
    if (both > 0) {
      throw new Error(`[migrate] ABORT: collection '${c}' has ${both} docs with both proposalId AND quotationId. Manual data cleanup required before rename.`);
    }
  }

  // Idempotency check
  if (preCounts.contracts === 0 && preCounts.productionorders === 0) {
    console.log('[migrate] No proposalId fields found \u2014 already migrated. No-op exit.');
    await mongoose.disconnect();
    return;
  }

  // ATOMIC RENAME via $rename operator (idempotent on no-op)
  const results: Record<string, number> = {};
  for (const c of collections) {
    const r = await db.collection(c).updateMany(
      { proposalId: { $exists: true } },
      { $rename: { proposalId: 'quotationId' } },
    );
    results[c] = r.modifiedCount;
  }
  console.log('[migrate] Rename results:', results);

  // POST-MIGRATION VERIFICATION
  for (const c of collections) {
    const postProposal = await db.collection(c).countDocuments({ proposalId: { $exists: true } });
    const postQuotation = await db.collection(c).countDocuments({ quotationId: { $exists: true } });
    if (postProposal !== 0) {
      throw new Error(`[migrate] FAILED: collection '${c}' still has ${postProposal} docs with proposalId after rename.`);
    }
    if (postQuotation !== preCounts[c]) {
      throw new Error(`[migrate] FAILED: collection '${c}' quotationId count ${postQuotation} != pre-proposalId count ${preCounts[c]}.`);
    }
  }

  console.log('[migrate] Migration complete. All proposalId references renamed to quotationId.');
  await mongoose.disconnect();
}

migrate()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('[migrate] ERROR:', err);
    process.exit(1);
  });
