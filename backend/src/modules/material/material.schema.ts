import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type MaterialDocument = HydratedDocument<Material>;

@Schema({ _id: false })
class DimensionsSchema {
  @Prop() length?: number;
  @Prop() width?: number;
  @Prop() height?: number;
  @Prop() thickness?: number;
  @Prop() diameter?: number;
  @Prop() unit?: string;
}

const DimensionsSchemaFactory = SchemaFactory.createForClass(DimensionsSchema);

@Schema({ collection: 'materials', timestamps: true })
export class Material {
  @Prop({ required: true, index: true })
  name!: string;

  @Prop({ index: true })
  article?: string;

  @Prop({ unique: true, sparse: true, index: true })
  sku?: string;

  @Prop({ required: true })
  unit!: string; // 'm2', 'm3', 'kg', 'sheet', 'pcs', etc.

  @Prop({ type: Types.ObjectId, ref: 'Category', index: true })
  categoryId?: Types.ObjectId;

  @Prop()
  description?: string;

  @Prop()
  pricePerUnit?: number;

  @Prop({ default: 'RUB' })
  priceCurrency?: string;

  @Prop({ default: 0 })
  stockQty?: number;

  @Prop({ type: DimensionsSchemaFactory })
  dimensions?: {
    length?: number;
    width?: number;
    height?: number;
    thickness?: number;
    diameter?: number;
    unit?: string;
  };

  @Prop({ default: false })
  fixedDimensions?: boolean;

  @Prop()
  image?: string;

  @Prop({ type: [Types.ObjectId], ref: 'Photo', default: [] })
  photoIds!: Types.ObjectId[];

  @Prop({ type: Types.ObjectId, ref: 'Organization' })
  supplierId?: Types.ObjectId;

  @Prop()
  notes?: string;
}

export const MaterialSchema = SchemaFactory.createForClass(Material);
