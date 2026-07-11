import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ProductModule, ProductModuleDocument } from './product-module.schema';
import { Product, ProductDocument } from '../product/product.schema';

/**
 * TZ-83 Фаза A.5: ref-based материалы + override subdoc.
 * Старый snapshot `name: string` удалён — данные тянутся через populate.
 */
export interface MaterialInModuleDto {
  materialId: string;
  quantity?: number;
  unit?: string;
  isPurchased?: boolean;
  overrideDimensions?: {
    length?: number;
    width?: number;
    height?: number;
    unit?: string;
  };
  sortOrder?: number;
}

export interface WorkTypeInModuleDto {
  workTypeId: string;
  estimatedHours?: number;
  sortOrder?: number;
}

export interface UpsertProductModuleDto {
  name: string;
  article?: string;
  dimensions?: { width?: number; height?: number; depth?: number; unit?: string };
  weight?: number;
  sortOrder?: number;
  workTypes?: WorkTypeInModuleDto[];
  materials?: MaterialInModuleDto[];
}

@Injectable()
export class ProductModuleService {
  constructor(
    @InjectModel(ProductModule.name)
    private readonly model: Model<ProductModuleDocument>,
    @InjectModel(Product.name)
    private readonly productModel: Model<ProductDocument>,
  ) {}

  async create(dto: UpsertProductModuleDto): Promise<ProductModuleDocument> {
    return this.model.create({
      ...dto,
      workTypes: (dto.workTypes ?? []).map((w) => ({
        workTypeId: new Types.ObjectId(w.workTypeId),
        estimatedHours: w.estimatedHours ?? 0,
        sortOrder: w.sortOrder ?? 0,
      })),
      materials: (dto.materials ?? []).map((m) => ({
        materialId: new Types.ObjectId(m.materialId),
        quantity: m.quantity ?? 1,
        unit: m.unit ?? 'шт',
        isPurchased: m.isPurchased ?? true,
        overrideDimensions: m.overrideDimensions,
        sortOrder: m.sortOrder ?? 0,
      })),
    });
  }

  /**
   * TZ-83 Фаза A.3 + A.5: list with optional productId filter.
   * При `productId` — reverse-lookup через `Product.productModuleIds[]`
   * (M:N связь не имеет productId на самом модуле).
   */
  async findAll(productId?: string): Promise<ProductModuleDocument[]> {
    if (productId) {
      if (!Types.ObjectId.isValid(productId)) return [];
      const product = await this.productModel
        .findById(productId)
        .select('productModuleIds')
        .lean();
      if (!product || product.productModuleIds.length === 0) return [];
      return this.model
        .find({ _id: { $in: product.productModuleIds } })
        .populate('workTypes.workTypeId')
        .populate({ path: 'materials.materialId', select: 'name photoIds unit' })
        .sort({ sortOrder: 1 })
        .exec();
    }
    return this.model
      .find()
      .populate('workTypes.workTypeId')
      .populate({ path: 'materials.materialId', select: 'name photoIds unit' })
      .sort({ sortOrder: 1 })
      .exec();
  }

  async findById(id: string): Promise<ProductModuleDocument> {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException(`ProductModule ${id} not found`);
    }
    const doc = await this.model
      .findById(id)
      .populate('workTypes.workTypeId')
      .populate({ path: 'materials.materialId', select: 'name photoIds unit' })
      .exec();
    if (!doc) throw new NotFoundException(`ProductModule ${id} not found`);
    return doc;
  }

  async update(
    id: string,
    dto: Partial<UpsertProductModuleDto>,
  ): Promise<ProductModuleDocument> {
    const doc = await this.findById(id);
    if (dto.name !== undefined) doc.name = dto.name;
    if (dto.article !== undefined) doc.article = dto.article;
    if (dto.dimensions !== undefined) doc.dimensions = dto.dimensions;
    if (dto.weight !== undefined) doc.weight = dto.weight;
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
        materialId: new Types.ObjectId(m.materialId),
        quantity: m.quantity ?? 1,
        unit: m.unit ?? 'шт',
        isPurchased: m.isPurchased ?? true,
        overrideDimensions: m.overrideDimensions,
        sortOrder: m.sortOrder ?? 0,
      }));
    }
    return doc.save();
  }

  async remove(id: string): Promise<void> {
    const doc = await this.findById(id);
    await doc.deleteOne();
  }
}
