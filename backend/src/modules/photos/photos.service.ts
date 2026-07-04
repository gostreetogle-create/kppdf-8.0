import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Photo, PhotoDocument } from './photo.schema';

export interface CreatePhotoDto {
  storageUrl: string;
  originalFilename?: string;
  variant?: 'original' | 'full' | 'medium' | 'thumb';
  mimeType?: string;
  sizeBytes?: number;
  widthPx?: number;
  heightPx?: number;
  alt?: string;
  parentPhotoId?: string;
}

@Injectable()
export class PhotosService {
  private readonly logger = new Logger(PhotosService.name);

  constructor(
    @InjectModel(Photo.name) private readonly model: Model<PhotoDocument>,
  ) {}

  async create(dto: CreatePhotoDto): Promise<PhotoDocument> {
    return this.model.create({
      ...dto,
      parentPhotoId: dto.parentPhotoId ? new Types.ObjectId(dto.parentPhotoId) : undefined,
    });
  }

  async findAll(): Promise<PhotoDocument[]> {
    return this.model.find().sort({ createdAt: -1 }).exec();
  }

  async findById(id: string): Promise<PhotoDocument> {
    if (!Types.ObjectId.isValid(id)) throw new NotFoundException(`Photo ${id} not found`);
    const doc = await this.model.findById(id).exec();
    if (!doc) throw new NotFoundException(`Photo ${id} not found`);
    return doc;
  }

  async findByIds(ids: string[]): Promise<PhotoDocument[]> {
    return this.model
      .find({ _id: { $in: ids.map((i) => new Types.ObjectId(i)) } })
      .exec();
  }

  async remove(id: string): Promise<void> {
    const doc = await this.findById(id);
    await doc.deleteOne();
    // TODO: also delete physical file from storage
  }
}
