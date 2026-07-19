import { Injectable, Logger, NotFoundException } from '@nestjs/common';
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
    return this.model.create(dto);
  }

  async findAll(q: { page?: number; limit?: number; search?: string; categoryId?: string; supplierId?: string } = {}) {
    const page = Math.max(1, q.page ?? 1);
    const limit = Math.min(100, Math.max(1, q.limit ?? 20));
    const filter: Record<string, unknown> = {};
    if (q.search) {
      const re = new RegExp(q.search, 'i');
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
    return doc.save();
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
