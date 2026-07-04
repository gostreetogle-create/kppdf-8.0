import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

@Schema({ _id: false })
class ProdDimensionsSchema {
  @Prop() length?: number;
  @Prop() width?: number;
  @Prop() height?: number;
  @Prop() unit?: string;
}

const ProdDimensionsSchemaFactory = SchemaFactory.createForClass(ProdDimensionsSchema);

export type ProductDocument = HydratedDocument<Product>;
export type ProductKind = 'good' | 'service' | 'work';
export type ProductStatus = 'new' | 'active' | 'archived' | 'draft';

@Schema({ collection: 'products', timestamps: true })
export class Product {
  @Prop({ required: true, index: true })
  name!: string;

  @Prop({ unique: true, sparse: true, index: true })
  sku?: string;

  @Prop({ required: true, enum: ['good', 'service', 'work'], default: 'good' })
  kind!: ProductKind;

  @Prop({ required: true, default: 'шт' })
  unit!: string;

  @Prop({ type: Types.ObjectId, ref: 'Category', index: true })
  categoryId?: Types.ObjectId;

  @Prop()
  subcategory?: string;

  @Prop({ enum: ['new', 'active', 'archived', 'draft'], default: 'new' })
  status?: ProductStatus;

  @Prop({ default: 0 })
  listPrice?: number;

  @Prop({ default: 0 })
  basePrice?: number;

  @Prop({ default: 0 })
  costPrice?: number;

  @Prop({ default: 30 })
  defaultMarkupPercent?: number;

  @Prop({ default: 0 })
  stockQty?: number;

  @Prop()
  description?: string;

  @Prop()
  notes?: string;

  @Prop({ type: [Types.ObjectId], ref: 'Photo', default: [] })
  photoIds!: Types.ObjectId[];

  @Prop({ type: ProdDimensionsSchemaFactory })
  dimensions?: { length?: number; width?: number; height?: number; unit?: string };

  @Prop({ default: 0 })
  weightKg?: number;

  @Prop()
  ralCode?: string;

  @Prop({ default: false })
  hasPassport?: boolean;

  @Prop({ default: false })
  hasDrawing?: boolean;

  @Prop({ type: Types.ObjectId, ref: 'Product' })
  copiedFromProductId?: Types.ObjectId;

  @Prop({ type: [Types.ObjectId], ref: 'ProductModule', default: [] })
  productModuleIds!: Types.ObjectId[];

  @Prop({ default: true })
  isActive!: boolean;

  @Prop()
  purpose?: string;

  @Prop()
  installation?: string;
}

export const ProductSchema = SchemaFactory.createForClass(Product);
ProductSchema.index({ status: 1, isActive: 1 });
