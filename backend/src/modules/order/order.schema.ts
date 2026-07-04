import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

@Schema({ _id: false })
export class OrderItem {
  @Prop({ type: Types.ObjectId, ref: 'Product', required: true })
  productId!: Types.ObjectId;

  @Prop()
  productName?: string;

  @Prop()
  productSku?: string;

  @Prop({ required: true, default: 0 })
  quantity!: number;

  @Prop()
  unit?: string;

  @Prop({ required: true, default: 0 })
  unitPrice!: number;

  @Prop({ required: true, default: 0 })
  total!: number;
}

const OrderItemSchema = SchemaFactory.createForClass(OrderItem);

export type OrderStatus = 'draft' | 'confirmed' | 'in_production' | 'ready' | 'shipped' | 'delivered' | 'cancelled';
export type OrderPriority = 'low' | 'normal' | 'high' | 'urgent';
export type OrderDocument = HydratedDocument<Order>;

@Schema({ collection: 'orders', timestamps: true })
export class Order {
  @Prop({ required: true, unique: true, index: true })
  number!: string;

  @Prop({ type: Types.ObjectId, ref: 'Counterparty', required: true, index: true })
  counterpartyId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Quotation', index: true })
  quotationId?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Contract', index: true })
  contractId?: Types.ObjectId;

  @Prop({ required: true, default: () => new Date() })
  date!: Date;

  @Prop()
  plannedDate?: Date;

  @Prop({ type: Types.ObjectId, ref: 'EntityStatus' })
  statusId?: Types.ObjectId;

  @Prop({
    enum: ['draft', 'confirmed', 'in_production', 'ready', 'shipped', 'delivered', 'cancelled'],
    default: 'draft',
    index: true,
  })
  status!: OrderStatus;

  @Prop({ required: true, default: 0 })
  total!: number;

  @Prop()
  notes?: string;

  @Prop({ default: true, index: true })
  isActive!: boolean;

  @Prop({ type: [OrderItemSchema], default: [] })
  items!: OrderItem[];

  @Prop()
  deliveryAddress?: string;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  managerId?: Types.ObjectId;

  @Prop({ enum: ['low', 'normal', 'high', 'urgent'], default: 'normal', index: true })
  priority!: OrderPriority;

  @Prop({ type: [Types.ObjectId], ref: 'Shipment', default: [] })
  shipmentIds!: Types.ObjectId[];

  @Prop({ type: [Types.ObjectId], ref: 'Reservation', default: [] })
  reservationIds!: Types.ObjectId[];
}

export const OrderSchema = SchemaFactory.createForClass(Order);
OrderSchema.index({ counterpartyId: 1, date: -1 });
OrderSchema.index({ status: 1, date: -1 });
OrderSchema.index({ managerId: 1, status: 1 });
