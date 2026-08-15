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

  /** TZ-ORDERS-303 D18: ответственный за изделие в заказе. */
  @Prop({ type: Types.ObjectId, ref: 'User' })
  ownerUserId?: Types.ObjectId;

  /** TZ-ORDERS-303 D16: плановая дата отгрузки позиции. */
  @Prop()
  plannedShipDate?: Date;

  /** TZ-ORDERS-304 D8: line-level readiness gate. */
  @Prop({ default: false })
  readyForWork!: boolean;

  @Prop({ type: Date })
  readyAt?: Date;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  readyByUserId?: Types.ObjectId;

  /** TZ-DASHBOARD-400: статус позиции заказа для Канбана */
  @Prop({
    enum: ['pending', 'in_production', 'ready', 'shipped'],
    default: 'pending',
  })
  status!: 'pending' | 'in_production' | 'ready' | 'shipped';
}

const OrderItemSchema = SchemaFactory.createForClass(OrderItem);

/**
 * TZ-PRODUCTION-309 — per-order Gantt duration override (not WorkType catalog).
 * Composite key: (orderItemIndex, moduleId, workTypeId).
 */
@Schema({ _id: false })
export class EstimateDayOverride {
  @Prop({ required: true, min: 0 })
  orderItemIndex!: number;

  @Prop({ type: Types.ObjectId, ref: 'ProductModule', required: true })
  moduleId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'WorkType', required: true })
  workTypeId!: Types.ObjectId;

  /** Calendar days ≥ 1 for this order line / module / work type. */
  @Prop({ required: true, min: 1 })
  days!: number;
}

const EstimateDayOverrideSchema = SchemaFactory.createForClass(EstimateDayOverride);

/**
 * TZ-PRODUCTION-316 — per-bar start offset from order visualAnchor (parallel Gantt).
 * Composite key: (orderItemIndex, moduleId, workTypeId).
 */
@Schema({ _id: false })
export class EstimateStartOffset {
  @Prop({ required: true, min: 0 })
  orderItemIndex!: number;

  @Prop({ type: Types.ObjectId, ref: 'ProductModule', required: true })
  moduleId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'WorkType', required: true })
  workTypeId!: Types.ObjectId;

  /** Calendar days ≥ 0 from order visualAnchor (plannedDate ?? date ?? today). */
  @Prop({ required: true, min: 0 })
  offsetDays!: number;
}

const EstimateStartOffsetSchema = SchemaFactory.createForClass(EstimateStartOffset);

export type OrderStatus = 'draft' | 'confirmed' | 'in_production' | 'ready' | 'shipped' | 'delivered' | 'cancelled';
export type OrderPriority = 'low' | 'normal' | 'high' | 'urgent';
export type OrderDocument = HydratedDocument<Order>;

@Schema({ collection: 'orders', timestamps: true })
export class Order {
  @Prop({ required: true, unique: true, index: true })
  number!: string;

  @Prop({ type: Types.ObjectId, ref: 'Counterparty', required: true, index: true })
  counterpartyId!: Types.ObjectId;

  /** TZ-ORDERS-303 D20: площадка/объект заказчика. */
  @Prop({ type: Types.ObjectId, ref: 'Site', required: true, index: true })
  siteId!: Types.ObjectId;

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


  /** TZ-ORDERS-305 D19: source of materials for the order. */
  @Prop({ enum: ['own', 'customer'], default: 'own', index: true })
  materialsSource!: 'own' | 'customer';

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

  /** TZ-PRODUCTION-309: order-level estimate days (Gantt); catalog WorkType.days is fallback. */
  @Prop({ type: [EstimateDayOverrideSchema], default: [] })
  estimateDayOverrides!: EstimateDayOverride[];

  /** TZ-PRODUCTION-316: per-bar start offset from visualAnchor (parallel OK). */
  @Prop({ type: [EstimateStartOffsetSchema], default: [] })
  estimateStartOffsets!: EstimateStartOffset[];
}

export const OrderSchema = SchemaFactory.createForClass(Order);
OrderSchema.index({ counterpartyId: 1, date: -1 });
OrderSchema.index({ siteId: 1, date: -1 });
OrderSchema.index({ status: 1, date: -1 });
OrderSchema.index({ managerId: 1, status: 1 });
