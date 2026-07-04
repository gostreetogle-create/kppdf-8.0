import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type StockMovementType = 'in' | 'out' | 'transfer' | 'adjust';
export type StockMovementDocument = HydratedDocument<StockMovement>;

@Schema({ collection: 'stockmovements', timestamps: true })
export class StockMovement {
  @Prop({ required: true, enum: ['in', 'out', 'transfer', 'adjust'], index: true })
  type!: StockMovementType;

  @Prop({ required: true, default: () => new Date(), index: true })
  date!: Date;

  @Prop({ type: Types.ObjectId, ref: 'Product', required: true, index: true })
  productId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Warehouse', required: true, index: true })
  warehouseId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Warehouse', index: true })
  toWarehouseId?: Types.ObjectId;

  @Prop()
  zoneName?: string;

  @Prop()
  toZoneName?: string;

  @Prop({ required: true })
  qty!: number;

  @Prop({ default: 0 })
  cost?: number;

  @Prop()
  orderId?: string;

  @Prop()
  documentRef?: string;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  createdBy?: Types.ObjectId;
}

export const StockMovementSchema = SchemaFactory.createForClass(StockMovement);
StockMovementSchema.index({ warehouseId: 1, date: -1 });
StockMovementSchema.index({ productId: 1, date: -1 });
