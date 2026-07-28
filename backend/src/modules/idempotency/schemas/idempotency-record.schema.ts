import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type IdempotencyRecordDocument = HydratedDocument<IdempotencyRecord>;

export type IdempotencyStatus = 'IN_PROGRESS' | 'COMPLETED';

@Schema({
  collection: 'idempotency_records',
  timestamps: { createdAt: true, updatedAt: false },
  softDelete: false,
})
export class IdempotencyRecord {
  /** UUID from `Idempotency-Key` header. Required. */
  @Prop({ required: true, index: true })
  key!: string;

  /** User-scoped: prevents cross-user key collisions. */
  @Prop({ type: Types.ObjectId, required: false, index: true })
  userId?: Types.ObjectId;

  /** HTTP method + endpoint identifier, e.g. "POST /api/products". */
  @Prop({ required: true })
  endpoint!: string;

  /** SHA-256 of JSON.stringify({ body, query }) — for conflict detection. */
  @Prop({ required: true })
  payloadHash!: string;

  /** IN_PROGRESS while handler runs; COMPLETED after response captured. */
  @Prop({ required: true, enum: ['IN_PROGRESS', 'COMPLETED'] })
  status!: IdempotencyStatus;

  /** Captured response statusCode (set when status=COMPLETED). */
  @Prop()
  statusCode?: number;

  /** Captured response body (omitted if >5MB; replay returns 200 + cached status only). */
  @Prop({ type: Object })
  responseBody?: Record<string, unknown> | unknown[];

  /**
   * `createdAt` is auto-managed by `timestamps: { createdAt: true }` above.
   * TTL index on `createdAt` evicts records after `IDEMPOTENCY_TTL_SECONDS`.
   * Default: 300 seconds (5 min) — matches frontend `ok:true` cache TTL (TZ-232.N).
   */
  createdAt?: Date;
}

export const IdempotencyRecordSchema = SchemaFactory.createForClass(IdempotencyRecord);

// Unique compound: prevents same (key, userId) collision. Race-condition guard.
IdempotencyRecordSchema.index({ key: 1, userId: 1 }, { unique: true });

// TTL index: MongoDB evicts documents whose `createdAt` is older than `expireAfterSeconds`.
// NOTE: TTL index must be declared WITHOUT a default in @Prop — Mongoose indexes are
// created/updated via `SchemaFactory.createForClass()` + explicit `Schema.index()` calls.
// Default `IDEMPOTENCY_TTL_SECONDS=300` is applied at module init (see idempotency.module.ts).
IdempotencyRecordSchema.index(
  { createdAt: 1 },
  { expireAfterSeconds: 300, name: 'idempotency_ttl' },
);