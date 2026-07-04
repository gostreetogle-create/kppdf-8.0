import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type CategoryDocument = HydratedDocument<Category>;

@Schema({ collection: 'categories', timestamps: true })
export class Category {
  @Prop({ required: true, index: true })
  name!: string;

  @Prop({ required: true, index: true })
  slug!: string;

  @Prop({ required: true, enum: ['material', 'product', 'general'], index: true })
  type!: 'material' | 'product' | 'general';

  @Prop({ type: Types.ObjectId, ref: 'Category', index: true })
  parentId?: Types.ObjectId;

  /** Materialized path: "Materials/Metals/Steel". For fast tree queries. */
  @Prop({ index: true })
  fullPath?: string;

  @Prop({ required: true, unique: true })
  skuPrefix!: string; // for SKU auto-generation

  @Prop({ default: 0 })
  sortOrder!: number;

  @Prop({ default: true })
  isActive!: boolean;

  @Prop()
  description?: string;
}

export const CategorySchema = SchemaFactory.createForClass(Category);
CategorySchema.index({ type: 1, slug: 1 }, { unique: true });
