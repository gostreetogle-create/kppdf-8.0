import { ConflictException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreateMaterialDto } from './dto/create-material.dto';
import { UpdateMaterialDto } from './dto/update-material.dto';
import { Material, MaterialDocument } from './material.schema';

@Injectable()
export class MaterialService {
  private readonly logger = new Logger(MaterialService.name);

  constructor(
    @InjectModel(Material.name) private readonly model: Model<MaterialDocument>,
  ) {}

  async create(dto: CreateMaterialDto): Promise<MaterialDocument> {
    try {
      return await this.model.create(dto);
    } catch (err) {
      this.rethrowDuplicateSku(err);
    }
  }

  async findAll(q: { page?: number; limit?: number; search?: string; categoryId?: string; supplierId?: string } = {}) {
    const page = Math.max(1, q.page ?? 1);
    const limit = Math.min(100, Math.max(1, q.limit ?? 20));
    const filter: Record<string, unknown> = {};
    if (q.search) {
      const escaped = q.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const re = new RegExp(escaped, 'i');
      filter.$or = [{ name: re }, { article: re }, { sku: re }];
    }
    if (q.categoryId) filter.categoryId = new Types.ObjectId(q.categoryId);
    if (q.supplierId) filter.supplierId = new Types.ObjectId(q.supplierId);
    const [items, total] = await Promise.all([
      this.model.find(filter)
        .populate('categoryId')
        .populate('photoIds')
        .populate('mainPhotoId')
        .populate('supplierId')
        .sort({ name: 1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean()
        .exec(),
      this.model.countDocuments(filter).exec(),
    ]);
    return { items, total, page, limit };
  }

  async findById(id: string): Promise<MaterialDocument> {
    if (!Types.ObjectId.isValid(id)) throw new NotFoundException(`Material ${id} not found`);
    const doc = await this.model.findById(id)
      .populate('categoryId')
      .populate('photoIds')
      .populate('mainPhotoId')
      .populate('supplierId')
      .exec();
    if (!doc) throw new NotFoundException(`Material ${id} not found`);
    return doc;
  }

  async update(id: string, dto: UpdateMaterialDto): Promise<MaterialDocument> {
    if (!Types.ObjectId.isValid(id)) throw new NotFoundException(`Material ${id} not found`);
    const doc = await this.model.findById(id).exec();
    if (!doc) throw new NotFoundException(`Material ${id} not found`);
    Object.assign(doc, dto);
    try {
      return await doc.save();
    } catch (err) {
      this.rethrowDuplicateSku(err);
    }
  }

  /**
   * Map a Mongo duplicate-key (E11000) error to a 409 Conflict so a SKU
   * collision is reported to the client instead of a raw 500. The unique
   * sparse index on `sku` is the server-side uniqueness guarantee
   * (TZ-MATERIALS-303); the client never generates codes.
   */
  private rethrowDuplicateSku(err: unknown): never {
    const code = (err as { code?: number })?.code;
    if (code === 11000) {
      throw new ConflictException('Материал с таким внутренним кодом уже существует');
    }
    throw err;
  }

  async remove(id: string): Promise<void> {
    if (!Types.ObjectId.isValid(id)) throw new NotFoundException(`Material ${id} not found`);
    const doc = await this.model.findById(id).exec();
    if (!doc) throw new NotFoundException(`Material ${id} not found`);
    await this.model
      .updateOne({ _id: doc._id }, { $set: { deletedAt: new Date() } })
      .exec();
  }
}
