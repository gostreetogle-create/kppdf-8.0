import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type StorageItemDocument = HydratedDocument<StorageItem>;

@Schema({ collection: 'storageitems', timestamps: true })
export class StorageItem {
  @Prop({ type: Types.ObjectId, ref: 'Warehouse', required: true, index: true })
  warehouseId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Product', required: true, index: true })
  productId!: Types.ObjectId;

  @Prop()
  zoneName?: string;

  @Prop()
  name?: string;

  @Prop()
  description?: string;

  @Prop({ type: [String], default: [] })
  photos!: string[];

  @Prop()
  weightKg?: number;

  @Prop()
  dimensions?: { length?: number; width?: number; height?: number; unit?: string };

  @Prop({ default: true, index: true })
  isActive!: boolean;

  @Prop({ default: 0 })
  quantity!: number;

  @Prop({ default: 0 })
  reservedQty!: number;

  @Prop({ default: 0 })
  minQuantity!: number;
}

export const StorageItemSchema = SchemaFactory.createForClass(StorageItem);
StorageItemSchema.index(
  { warehouseId: 1, productId: 1, zoneName: 1 },
  { unique: true, partialFilterExpression: { zoneName: { $type: 'string' } } },
);
StorageItemSchema.index(
  { warehouseId: 1, productId: 1 },
  { unique: true, partialFilterExpression: { zoneName: { $exists: false } } },
);
