import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  ProductModulePhoto,
  ProductModulePhotoDocument,
} from './product-module-photo.schema';
import { ProductModule, ProductModuleDocument } from '../product-module/product-module.schema';

export interface UpsertProductModulePhotoDto {
  productModuleId: string;
  photoId?: string;
  url?: string;
  caption?: string;
  isMain?: boolean;
  sortOrder?: number;
}

@Injectable()
export class ProductModulePhotoService {
  constructor(
    @InjectModel(ProductModulePhoto.name)
    private readonly model: Model<ProductModulePhotoDocument>,
    @InjectModel(ProductModule.name)
    private readonly moduleModel: Model<ProductModuleDocument>,
  ) {}

  async upsert(dto: UpsertProductModulePhotoDto): Promise<ProductModulePhotoDocument> {
    if (!dto.url && !dto.photoId) {
      throw new BadRequestException('At least one of url or photoId is required');
    }
    const productModuleId = this.toObjectId(dto.productModuleId, 'Invalid productModuleId');
    await this.assertModuleExists(productModuleId);
    const photoId = dto.photoId ? this.toObjectId(dto.photoId, 'Invalid photoId') : undefined;
    if (dto.isMain) {
      await this.model.updateMany({ productModuleId }, { $set: { isMain: false } }).exec();
    }
    const created = await this.model.create({
      productModuleId,
      photoId,
      url: dto.url,
      caption: dto.caption,
      isMain: dto.isMain ?? false,
      sortOrder: dto.sortOrder ?? 0,
    });
    if (photoId) {
      await this.moduleModel.updateOne(
        { _id: productModuleId },
        {
          $addToSet: { photoIds: photoId },
          ...(dto.isMain ? { $set: { mainPhotoId: photoId } } : {}),
        },
      ).exec();
    }
    return created;
  }

  async findByProductModule(productModuleId: string): Promise<ProductModulePhotoDocument[]> {
    if (!Types.ObjectId.isValid(productModuleId)) return [];
    return this.model
      .find({ productModuleId: new Types.ObjectId(productModuleId) })
      .populate('photoId')
      .sort({ isMain: -1, sortOrder: 1 })
      .exec();
  }

  async findById(id: string): Promise<ProductModulePhotoDocument> {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException(`ProductModulePhoto ${id} not found`);
    }
    const doc = await this.model.findById(id).populate('photoId').exec();
    if (!doc) throw new NotFoundException(`ProductModulePhoto ${id} not found`);
    return doc;
  }

  async update(id: string, dto: Partial<UpsertProductModulePhotoDto>): Promise<ProductModulePhotoDocument> {
    const doc = await this.findById(id);
    const safeDto = { ...dto };
    delete safeDto.isMain;
    let nextPhotoId = this.asObjectId(doc.photoId);
    if (safeDto.photoId !== undefined) {
      nextPhotoId = safeDto.photoId ? this.toObjectId(safeDto.photoId, 'Invalid photoId') : undefined;
      doc.photoId = nextPhotoId;
    }
    if (safeDto.url !== undefined) doc.url = safeDto.url;
    if (safeDto.caption !== undefined) doc.caption = safeDto.caption;
    if (safeDto.sortOrder !== undefined) doc.sortOrder = safeDto.sortOrder;
    const saved = await doc.save();
    // Compatibility-first: never pull a canonical reference automatically. It may
    // be shared by another legacy row or have been added by the canonical API.
    if (nextPhotoId) {
      await this.moduleModel.updateOne(
        { _id: doc.productModuleId },
        { $addToSet: { photoIds: nextPhotoId } },
      ).exec();
    }
    return saved;
  }

  async setMain(id: string): Promise<ProductModulePhotoDocument> {
    const doc = await this.findById(id);
    await this.model.updateMany(
      { productModuleId: doc.productModuleId, _id: { $ne: doc._id } },
      { $set: { isMain: false } },
    ).exec();
    doc.isMain = true;
    const saved = await doc.save();
    const photoId = this.asObjectId(saved.photoId);
    if (photoId) {
      await this.moduleModel.updateOne(
        { _id: saved.productModuleId },
        { $set: { mainPhotoId: photoId }, $addToSet: { photoIds: photoId } },
      ).exec();
    }
    // URL-only legacy main photos remain represented by the legacy row; the
    // canonical Photo reference is intentionally left unchanged.
    return saved;
  }

  async remove(id: string): Promise<void> {
    const doc = await this.findById(id);
    // Do not pull photoIds: a canonical reference may be shared with another
    // legacy row or may have been explicitly selected by the canonical API.
    await doc.deleteOne();
  }

  private async assertModuleExists(id: Types.ObjectId): Promise<void> {
    const module = await this.moduleModel.findById(id).select('_id').exec();
    if (!module) throw new NotFoundException(`ProductModule ${id} not found`);
  }

  private toObjectId(value: string, message: string): Types.ObjectId {
    if (!Types.ObjectId.isValid(value)) throw new BadRequestException(message);
    return new Types.ObjectId(value);
  }

  private asObjectId(value: unknown): Types.ObjectId | undefined {
    if (!value) return undefined;
    if (value instanceof Types.ObjectId) return value;
    if (typeof value === 'string' && Types.ObjectId.isValid(value)) return new Types.ObjectId(value);
    if (typeof value === 'object' && value && '_id' in value) {
      const id = String((value as { _id: unknown })._id);
      return Types.ObjectId.isValid(id) ? new Types.ObjectId(id) : undefined;
    }
    return undefined;
  }
}
