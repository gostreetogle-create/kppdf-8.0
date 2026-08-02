import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ProductModule, ProductModuleDocument } from './product-module.schema';
import { Product, ProductDocument } from '../product/product.schema';
import { Material, MaterialDocument } from '../material/material.schema';

/** TZ-83 + TZ-MATERIALS-309: ref-based materials and immutable override enforcement. */
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

type DimensionKey = 'length' | 'width' | 'height';

@Injectable()
export class ProductModuleService {
  constructor(
    @InjectModel(ProductModule.name)
    private readonly model: Model<ProductModuleDocument>,
    @InjectModel(Product.name)
    private readonly productModel: Model<ProductDocument>,
    @InjectModel(Material.name)
    private readonly materialModel: Model<MaterialDocument>,
  ) {}

  async create(dto: UpsertProductModuleDto): Promise<ProductModuleDocument> {
    const materials = dto.materials ?? [];
    await this.assertMaterialsAndOverridesAllowed(materials);
    return this.model.create(this.toPersistence(dto, materials));
  }

  /** TZ-83: list with optional productId reverse lookup. */
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
        .populate({ path: 'materials.materialId', select: 'name photoIds unit dimensions' })
        .sort({ sortOrder: 1 })
        .exec();
    }
    return this.model
      .find()
      .populate('workTypes.workTypeId')
      .populate({ path: 'materials.materialId', select: 'name photoIds unit dimensions' })
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
      .populate({ path: 'materials.materialId', select: 'name photoIds unit dimensions' })
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
      await this.assertMaterialsAndOverridesAllowed(dto.materials);
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

  /** Validate every referenced material before any ObjectId conversion or write. */
  private async assertMaterialsAndOverridesAllowed(materials: MaterialInModuleDto[]): Promise<void> {
    for (const row of materials) {
      if (!Types.ObjectId.isValid(row.materialId)) {
        throw new BadRequestException(`Некорректный materialId: ${row.materialId}`);
      }
    }

    const ids = [...new Set(materials.map((m) => m.materialId))];
    if (ids.length === 0) return;
    const docs = await this.materialModel
      .find({ _id: { $in: ids.map((id) => new Types.ObjectId(id)) } })
      .select('name dimensions')
      .lean()
      .exec();
    const byId = new Map(docs.map((material) => [String(material._id), material]));

    for (const row of materials) {
      const material = byId.get(row.materialId);
      if (!material) {
        throw new BadRequestException(`Материал ${row.materialId} не найден`);
      }
      const immutable = new Set(
        (material.dimensions ?? [])
          .filter((dimension) => dimension.isImmutable)
          .map((dimension) => dimension.type),
      );
      for (const key of ['length', 'width', 'height'] as DimensionKey[]) {
        if (row.overrideDimensions?.[key] !== undefined && immutable.has(key)) {
          throw new BadRequestException(
            `Размер «${key}» материала «${material.name}» неизменяем и не может быть переопределён в модуле`,
          );
        }
      }
    }
  }

  private toPersistence(dto: UpsertProductModuleDto, materials: MaterialInModuleDto[]) {
    return {
      ...dto,
      workTypes: (dto.workTypes ?? []).map((w) => ({
        workTypeId: new Types.ObjectId(w.workTypeId),
        estimatedHours: w.estimatedHours ?? 0,
        sortOrder: w.sortOrder ?? 0,
      })),
      materials: materials.map((m) => ({
        materialId: new Types.ObjectId(m.materialId),
        quantity: m.quantity ?? 1,
        unit: m.unit ?? 'шт',
        isPurchased: m.isPurchased ?? true,
        overrideDimensions: m.overrideDimensions,
        sortOrder: m.sortOrder ?? 0,
      })),
    };
  }
}
