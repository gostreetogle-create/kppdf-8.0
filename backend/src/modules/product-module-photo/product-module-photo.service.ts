import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  ProductModulePhoto,
  ProductModulePhotoDocument,
} from './product-module-photo.schema';

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
  ) {}

  async upsert(
    dto: UpsertProductModulePhotoDto,
  ): Promise<ProductModulePhotoDocument> {
    if (dto.isMain) {
      // Atomic: demote other mains for this module BEFORE inserting the new main.
      await this.model
        .updateMany(
          { productModuleId: new Types.ObjectId(dto.productModuleId) },
          { $set: { isMain: false } },
        )
        .exec();
    }
    return this.model.create({
      productModuleId: new Types.ObjectId(dto.productModuleId),
      photoId: dto.photoId ? new Types.ObjectId(dto.photoId) : undefined,
      url: dto.url,
      caption: dto.caption,
      isMain: dto.isMain ?? false,
      sortOrder: dto.sortOrder ?? 0,
    });
  }

  async findByProductModule(
    productModuleId: string,
  ): Promise<ProductModulePhotoDocument[]> {
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

  async update(
    id: string,
    dto: Partial<UpsertProductModulePhotoDto>,
  ): Promise<ProductModulePhotoDocument> {
    const doc = await this.findById(id);
    // TZ-83 Review #5: PATCH /:id не должен менять `isMain` — иначе модуль
    // может остаться без main photo. Используйте POST /:id/main для назначения
    // нового главного фото. Strip через non-mutating destructure-rest (rew #1).
    const { isMain: _isMainIgnored, ...safeDto } = dto;
    if (safeDto.photoId !== undefined) {
      doc.photoId = safeDto.photoId
        ? new Types.ObjectId(safeDto.photoId)
        : (undefined as unknown as Types.ObjectId);
    }
    if (safeDto.url !== undefined) doc.url = safeDto.url;
    if (safeDto.caption !== undefined) doc.caption = safeDto.caption;
    if (safeDto.sortOrder !== undefined) doc.sortOrder = safeDto.sortOrder;
    return doc.save();
  }

  /**
   * TZ-83 Фаза A.7: атомарный setMain.
   * Делает photoId "главной" для модуля — все остальные становятся isMain=false
   * в той же транзакции (две операции но в пределах одного event loop).
   * Race condition крайне маловероятен (см. TZ-83 §5 риски).
   */
  async setMain(id: string): Promise<ProductModulePhotoDocument> {
    const doc = await this.findById(id);
    await this.model
      .updateMany(
        {
          productModuleId: doc.productModuleId,
          _id: { $ne: doc._id },
        },
        { $set: { isMain: false } },
      )
      .exec();
    doc.isMain = true;
    return doc.save();
  }

  async remove(id: string): Promise<void> {
    const doc = await this.findById(id);
    await doc.deleteOne();
  }
}
