import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ProductModule, ProductModuleDocument } from './product-module.schema';

export interface UpsertProductModuleDto {
  name: string;
  article?: string;
  productId?: string;
  dimensions?: { width?: number; height?: number; depth?: number; unit?: string };
  weight?: number;
  image?: string;
  sortOrder?: number;
  workTypes?: { workTypeId: string; estimatedHours?: number; sortOrder?: number }[];
  materials?: { name: string; quantity?: number; unit?: string; isPurchased?: boolean }[];
}

@Injectable()
export class ProductModuleService {
  constructor(
    @InjectModel(ProductModule.name) private readonly model: Model<ProductModuleDocument>,
  ) {}

  async create(dto: UpsertProductModuleDto): Promise<ProductModuleDocument> {
    return this.model.create({
      ...dto,
      productId: dto.productId ? new Types.ObjectId(dto.productId) : undefined,
      workTypes: (dto.workTypes ?? []).map((w) => ({
        workTypeId: new Types.ObjectId(w.workTypeId),
        estimatedHours: w.estimatedHours ?? 0,
        sortOrder: w.sortOrder ?? 0,
      })),
      materials: dto.materials ?? [],
    });
  }

  async findAll(productId?: string): Promise<ProductModuleDocument[]> {
    const filter = productId ? { productId: new Types.ObjectId(productId) } : {};
    return this.model.find(filter)
      .populate('workTypes.workTypeId')
      .sort({ productId: 1, sortOrder: 1 })
      .exec();
  }

  async findById(id: string): Promise<ProductModuleDocument> {
    if (!Types.ObjectId.isValid(id)) throw new NotFoundException(`ProductModule ${id} not found`);
    const doc = await this.model.findById(id).populate('workTypes.workTypeId').exec();
    if (!doc) throw new NotFoundException(`ProductModule ${id} not found`);
    return doc;
  }

  async update(id: string, dto: Partial<UpsertProductModuleDto>): Promise<ProductModuleDocument> {
    const doc = await this.findById(id);
    if (dto.name !== undefined) doc.name = dto.name;
    if (dto.article !== undefined) doc.article = dto.article;
    if (dto.dimensions !== undefined) doc.dimensions = dto.dimensions;
    if (dto.weight !== undefined) doc.weight = dto.weight;
    if (dto.image !== undefined) doc.image = dto.image;
    if (dto.sortOrder !== undefined) doc.sortOrder = dto.sortOrder;
    if (dto.workTypes) {
      doc.workTypes = dto.workTypes.map((w) => ({
        workTypeId: new Types.ObjectId(w.workTypeId),
        estimatedHours: w.estimatedHours ?? 0,
        sortOrder: w.sortOrder ?? 0,
      }));
    }
    if (dto.materials) {
      doc.materials = dto.materials.map((m) => ({
        name: m.name,
        quantity: m.quantity ?? 1,
        unit: m.unit ?? 'шт',
        isPurchased: m.isPurchased ?? true,
      }));
    }
    return doc.save();
  }

  async remove(id: string): Promise<void> {
    const doc = await this.findById(id);
    await doc.deleteOne();
  }
}
