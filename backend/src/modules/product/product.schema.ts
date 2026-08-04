import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { optimisticLockPlugin } from '../../common/mongoose';
import { CompositionLine, CompositionLineSchema } from '../catalog/composition-line.schema';

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
  @Prop({ required: true, index: true }) name!: string;
  @Prop({ unique: true, sparse: true, index: true }) sku?: string;
  @Prop({ required: true, enum: ['good', 'service', 'work'], default: 'good' }) kind!: ProductKind;
  @Prop({ required: true, default: 'шт' }) unit!: string;
  @Prop({ type: Types.ObjectId, ref: 'Category', index: true }) categoryId?: Types.ObjectId;
  @Prop() subcategory?: string;
  @Prop({ enum: ['new', 'active', 'archived', 'draft'], default: 'new' }) status?: ProductStatus;
  @Prop({ default: 0 }) listPrice?: number;
  @Prop({ default: 0 }) basePrice?: number;
  @Prop({ default: 0 }) costPrice?: number;
  @Prop({ default: 30 }) defaultMarkupPercent?: number;
  @Prop({ default: 0 }) stockQty?: number;
  @Prop() description?: string;
  @Prop() notes?: string;
  @Prop({ type: [Types.ObjectId], ref: 'Photo', default: [] }) photoIds!: Types.ObjectId[];
  @Prop({ type: ProdDimensionsSchemaFactory }) dimensions?: { length?: number; width?: number; height?: number; unit?: string };
  @Prop({ default: 0 }) weightKg?: number;
  @Prop() ralCode?: string;
  @Prop({ default: false }) hasPassport?: boolean;
  @Prop({ default: false }) hasDrawing?: boolean;
  @Prop({ type: Types.ObjectId, ref: 'Product' }) copiedFromProductId?: Types.ObjectId;

  /** Legacy M:N module links retained for TZ-CATALOG-302 dual-read and TZ-CATALOG-304 migration. */
  @Prop({ type: [Types.ObjectId], ref: 'ProductModule', default: [] })
  productModuleIds!: Types.ObjectId[];

  /** TZ-CATALOG-302: canonical composition write source; product lines arrive in TZ-CATALOG-305. */
  @Prop({ type: [CompositionLineSchema], default: [] })
  composition!: CompositionLine[];

  @Prop({ default: true }) isActive!: boolean;
  @Prop() purpose?: string;
  @Prop() installation?: string;
  @Prop({ required: false, sparse: true, index: true }) organizationId?: Types.ObjectId;
  @Prop({ default: false }) isSystem?: boolean;
}

export const ProductSchema = SchemaFactory.createForClass(Product);
ProductSchema.plugin(optimisticLockPlugin);
ProductSchema.index({ status: 1, isActive: 1 });
