/**
 * TZ-199 Rollback Script: Inverse rename quotationId \u2192 proposalId.
 *
 * Reverses the main migration if applied in error. Idempotent.
 *
 * Usage:
 *   pnpm exec ts-node backend/scripts/migrate-proposal-to-quotation-rollback.ts
 */
import mongoose from 'mongoose';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';

async function rollback(): Promise<void> {
  await NestFactory.createApplicationContext(AppModule);

  const db = mongoose.connection.db;
  if (!db) {
    throw new Error('Mongoose connection db unavailable');
  }

  const collections = ['contracts', 'productionorders'] as const;

  // PRE-ROLLBACK COUNT
  const preQuotation: Record<string, number> = {};
  for (const c of collections) {
    preQuotation[c] = await db.collection(c).countDocuments({ quotationId: { $exists: true } });
  }
  console.log('[rollback] Pre-rollback quotationId counts:', preQuotation);

  // Sandwich-check: if any collection has BOTH fields, abort
  for (const c of collections) {
    const both = await db.collection(c).countDocuments({
      proposalId: { $exists: true },
      quotationId: { $exists: true },
    });
    if (both > 0) {
      throw new Error(`[rollback] ABORT: collection '${c}' has ${both} docs with both proposalId AND quotationId. Manual cleanup required.`);
    }
  }

  // Idempotency check
  if (preQuotation.contracts === 0 && preQuotation.productionorders === 0) {
    console.log('[rollback] No quotationId fields found \u2014 not migrated yet, no-op.');
    await mongoose.disconnect();
    return;
  }

  // ATOMIC ROLLBACK via $rename
  const results: Record<string, number> = {};
  for (const c of collections) {
    const r = await db.collection(c).updateMany(
      { quotationId: { $exists: true } },
      { $rename: { quotationId: 'proposalId' } },
    );
    results[c] = r.modifiedCount;
  }
  console.log('[rollback] Rename results (quotationId \u2192 proposalId):', results);

  // POST-ROLLBACK VERIFICATION
  for (const c of collections) {
    const postProposal = await db.collection(c).countDocuments({ proposalId: { $exists: true } });
    const postQuotation = await db.collection(c).countDocuments({ quotationId: { $exists: true } });
    if (postQuotation !== 0) {
      throw new Error(`[rollback] FAILED: collection '${c}' still has ${postQuotation} docs with quotationId after rollback.`);
    }
    if (postProposal !== preQuotation[c]) {
      throw new Error(`[rollback] FAILED: collection '${c}' proposalId count ${postProposal} != pre-quotationId count ${preQuotation[c]}.`);
    }
  }

  console.log('[rollback] Rollback complete. All quotationId fields reverted to proposalId.');
  await mongoose.disconnect();
}

rollback()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('[rollback] ERROR:', err);
    process.exit(1);
  });
