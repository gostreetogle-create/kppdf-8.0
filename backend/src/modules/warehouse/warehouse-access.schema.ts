import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type WarehouseAccessPermission = 'read' | 'write' | 'admin';
export type WarehouseAccessDocument = HydratedDocument<WarehouseAccess>;

/**
 * TZ-200.C — Canonical M2M join entity for `Warehouse ⇄ Role` access control.
 *
 * Replaces legacy `Warehouse.roleIds[]` array on `Warehouse` schema with
 * a dedicated link collection, enabling: per-pair permission grading
 * (read/write/admin), grant/revoke timestamp tracking, time-bounded grants
 * (expiresAt for temporary admin/contractor access), and reverse-populate
 * via `WarehouseAccessService.findByRoleId(roleId)`.
 *
 * Lifecycle: `grantedAt` defaults to grant-time; `revokedAt` timestamp marks
 * deactivation (soft-delete); `expiresAt` marks time-bound grants (e.g.,
 * 90-day contractor read access). Unique compound index
 * `{warehouseId+roleId+permission}` with partial filter on `revokedAt`
 * guarantees idempotent grants + scoped revocation.
 */
@Schema({ collection: 'warehouseaccesses', timestamps: true })
export class WarehouseAccess {
  @Prop({ type: Types.ObjectId, ref: 'Warehouse', required: true, index: true })
  warehouseId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Role', required: true, index: true })
  roleId!: Types.ObjectId;

  @Prop({
    enum: ['read', 'write', 'admin'],
    default: 'read',
    required: true,
  })
  permission!: WarehouseAccessPermission;

  @Prop({ default: () => new Date(), index: true })
  grantedAt!: Date;

  @Prop({ sparse: true, index: true })
  revokedAt?: Date;

  /**
   * Optional time-bound grant. When `expiresAt` is in the past, the grant
   * is logically inactive (queries should filter `expiresAt: { $gt: now }`
   * OR `expiresAt: undefined`). Sparse index for query perf.
   */
  @Prop({ sparse: true, index: true })
  expiresAt?: Date;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  grantedBy?: Types.ObjectId;

  @Prop()
  notes?: string;
}

export const WarehouseAccessSchema = SchemaFactory.createForClass(WarehouseAccess);

// Compound uniqueness: a (warehouse + role + permission) pair can only be
// granted once (revoked pairs can be re-granted via update since the doc exists).
WarehouseAccessSchema.index(
  { warehouseId: 1, roleId: 1, permission: 1 },
  { unique: true, partialFilterExpression: { revokedAt: { $exists: false } } },
);

// Reverse-populate support
WarehouseAccessSchema.index({ roleId: 1, revokedAt: 1 });
