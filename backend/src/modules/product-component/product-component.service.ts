import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ProductComponent, ProductComponentDocument } from './product-component.schema';

export interface UpsertProductComponentDto {
  productId: string;
  name: string;
  quantityPerProduct?: number;
  unit: string;
  description?: string;
  drawingUrl?: string;
  materials?: string[];
  material?: string;
  workTypeId?: string;
  sortOrder?: number;
}

@Injectable()
export class ProductComponentService {
  constructor(
    @InjectModel(ProductComponent.name) private readonly model: Model<ProductComponentDocument>,
  ) {}

  async create(dto: UpsertProductComponentDto): Promise<ProductComponentDocument> {
    return this.model.create({
      ...dto,
      productId: new Types.ObjectId(dto.productId),
      materials: (dto.materials ?? []).map((s) => new Types.ObjectId(s)),
      material: dto.material ? new Types.ObjectId(dto.material) : undefined,
      workTypeId: dto.workTypeId ? new Types.ObjectId(dto.workTypeId) : undefined,
    });
  }

  async findByProduct(productId: string): Promise<ProductComponentDocument[]> {
    return this.model
      .find({ productId: new Types.ObjectId(productId) })
      .populate('material')
      .populate('materials')
      .populate('workTypeId')
      .sort({ sortOrder: 1 })
      .exec();
  }

  async findById(id: string): Promise<ProductComponentDocument> {
    if (!Types.ObjectId.isValid(id)) throw new NotFoundException(`ProductComponent ${id} not found`);
    const doc = await this.model.findById(id).exec();
    if (!doc) throw new NotFoundException(`ProductComponent ${id} not found`);
    return doc;
  }

  async update(id: string, dto: Partial<UpsertProductComponentDto>): Promise<ProductComponentDocument> {
    const doc = await this.findById(id);
    if (dto.materials) {
      doc.materials = dto.materials.map((s) => new Types.ObjectId(s));
    }
    if (dto.material !== undefined) {
      doc.material = dto.material ? new Types.ObjectId(dto.material) : undefined;
    }
    if (dto.workTypeId !== undefined) {
      doc.workTypeId = dto.workTypeId ? new Types.ObjectId(dto.workTypeId) : undefined;
    }
    if (dto.name !== undefined) doc.name = dto.name;
    if (dto.quantityPerProduct !== undefined) doc.quantityPerProduct = dto.quantityPerProduct;
    if (dto.unit !== undefined) doc.unit = dto.unit;
    if (dto.description !== undefined) doc.description = dto.description;
    if (dto.drawingUrl !== undefined) doc.drawingUrl = dto.drawingUrl;
    if (dto.sortOrder !== undefined) doc.sortOrder = dto.sortOrder;
    return doc.save();
  }

  async remove(id: string): Promise<void> {
    const doc = await this.findById(id);
    await doc.deleteOne();
  }
}
