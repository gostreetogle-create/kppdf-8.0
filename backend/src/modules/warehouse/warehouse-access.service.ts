import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  WarehouseAccess,
  WarehouseAccessDocument,
  WarehouseAccessPermission,
} from './warehouse-access.schema';
import { CreateWarehouseAccessDto } from './dto/create-warehouse-access.dto';

@Injectable()
export class WarehouseAccessService {
  constructor(
    @InjectModel(WarehouseAccess.name)
    private readonly model: Model<WarehouseAccessDocument>,
  ) {}

  /**
   * Reverse-populate: list all ACTIVE grants for a warehouse.
   * Filters out revoked (`revokedAt` set) AND expired (`expiresAt < now`) entries.
   */
  async findByWarehouseId(warehouseId: string): Promise<WarehouseAccessDocument[]> {
    if (!Types.ObjectId.isValid(warehouseId)) return [];
    return this.model
      .find({
        warehouseId: new Types.ObjectId(warehouseId),
        revokedAt: { $exists: false },
        $or: [
          { expiresAt: { $exists: false } },
          { expiresAt: { $gt: new Date() } },
        ],
      })
      .populate('roleId')
      .sort({ permission: 1, grantedAt: 1 })
      .exec();
  }

  /**
   * Reverse-populate: list all ACTIVE grants for a role (so RBAC guards can
   * query "which warehouses does this role have access to").
   */
  async findByRoleId(roleId: string): Promise<WarehouseAccessDocument[]> {
    if (!Types.ObjectId.isValid(roleId)) return [];
    return this.model
      .find({
        roleId: new Types.ObjectId(roleId),
        revokedAt: { $exists: false },
        $or: [
          { expiresAt: { $exists: false } },
          { expiresAt: { $gt: new Date() } },
        ],
      })
      .populate('warehouseId')
      .sort({ grantedAt: 1 })
      .exec();
  }

  async findOne(id: string): Promise<WarehouseAccessDocument> {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException(`WarehouseAccess ${id} not found`);
    }
    const doc = await this.model.findById(id).exec();
    if (!doc) throw new NotFoundException(`WarehouseAccess ${id} not found`);
    return doc;
  }

  /**
   * Grant access — idempotent on (warehouseId+roleId+permission) for non-revoked pairs.
   * Explicit `grantedAt: new Date()` ensures determinism across Mongoose defaults.
   * Throws ConflictException if an active grant already exists for the pair
   * (caller must revoke/reactivate first to change).
   */
  async grant(dto: CreateWarehouseAccessDto, grantedBy?: string): Promise<WarehouseAccessDocument> {
    const existing = await this.model.findOne({
      warehouseId: new Types.ObjectId(dto.warehouseId),
      roleId: new Types.ObjectId(dto.roleId),
      permission: (dto.permission ?? 'read') as WarehouseAccessPermission,
      revokedAt: { $exists: false },
    });
    if (existing) {
      throw new ConflictException(
        `Active grant already exists (id=${existing._id}). Revoke first to re-grant.`,
      );
    }
    return this.model.create({
      warehouseId: new Types.ObjectId(dto.warehouseId),
      roleId: new Types.ObjectId(dto.roleId),
      permission: (dto.permission ?? 'read') as WarehouseAccessPermission,
      grantedAt: new Date(),
      expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : undefined,
      grantedBy: grantedBy ? new Types.ObjectId(grantedBy) : undefined,
      notes: dto.notes,
    });
  }

  /**
   * Revoke a grant by ID — sets `revokedAt` timestamp (soft-delete pattern).
   * Idempotent: re-revoking an already-revoked grant is a no-op.
   */
  async revoke(id: string): Promise<WarehouseAccessDocument> {
    const doc = await this.findOne(id);
    if (doc.revokedAt) return doc;
    doc.revokedAt = new Date();
    return doc.save();
  }

  /**
   * Reactivate a previously revoked grant — clears `revokedAt`.
   * Sets `grantedAt` to the reactivation time (audit semantics: re-grant).
   */
  async reactivate(id: string): Promise<WarehouseAccessDocument> {
    const doc = await this.findOne(id);
    doc.revokedAt = undefined as unknown as Date;
    doc.grantedAt = new Date();
    return doc.save();
  }

  /**
   * Hard delete — only for admin-level cleanup (e.g., orphan grants on
   * warehouse deletion). Distinct from soft revoke.
   */
  async hardDelete(id: string): Promise<void> {
    const doc = await this.findOne(id);
    await this.model.deleteOne({ _id: doc._id }).exec();
  }
}
