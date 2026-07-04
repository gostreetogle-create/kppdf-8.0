import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type PhotoDocument = HydratedDocument<Photo>;
export type PhotoVariant = 'original' | 'full' | 'medium' | 'thumb';

@Schema({ collection: 'photos', timestamps: true })
export class Photo {
  @Prop({ required: true })
  storageUrl!: string;

  @Prop()
  originalFilename?: string;

  @Prop({ required: true, enum: ['original', 'full', 'medium', 'thumb'], default: 'original', index: true })
  variant!: PhotoVariant;

  @Prop()
  mimeType?: string;

  @Prop()
  sizeBytes?: number;

  @Prop()
  widthPx?: number;

  @Prop()
  heightPx?: number;

  @Prop({ type: Types.ObjectId, ref: 'Photo' })
  parentPhotoId?: Types.ObjectId;

  /** Optional: link to a Photo where this is a variant. */
  @Prop({ type: Types.ObjectId, ref: 'Photo' })
  linkedPhotoId?: Types.ObjectId;

  @Prop()
  alt?: string;

  /**
   * NOTE: file upload via multer + sharp variant generation is a TODO.
   * For now, this module stores metadata only — clients POST pre-uploaded
   * URLs (e.g. from S3 / external CDN).
   */
}

export const PhotoSchema = SchemaFactory.createForClass(Photo);
