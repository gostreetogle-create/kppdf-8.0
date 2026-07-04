import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type ProductComponentDocument = HydratedDocument<ProductComponent>;

@Schema({ collection: 'productcomponents', timestamps: true })
export class ProductComponent {
  @Prop({ type: Types.ObjectId, ref: 'Product', required: true, index: true })
  productId!: Types.ObjectId;

  @Prop({ required: true })
  name!: string;

  @Prop({ default: 1 })
  quantityPerProduct!: number;

  @Prop({ required: true })
  unit!: string;

  @Prop()
  description?: string;

  @Prop()
  drawingUrl?: string;

  @Prop({ type: [Types.ObjectId], ref: 'Material', default: [] })
  materials!: Types.ObjectId[];

  @Prop({ type: Types.ObjectId, ref: 'Material' })
  material?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'WorkType' })
  workTypeId?: Types.ObjectId;

  @Prop({ default: 0 })
  sortOrder!: number;
}

export const ProductComponentSchema = SchemaFactory.createForClass(ProductComponent);
ProductComponentSchema.index({ productId: 1, sortOrder: 1 });
