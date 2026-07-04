import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type ReservationStatus = 'active' | 'released' | 'fulfilled' | 'cancelled';
export type ReservationDocument = HydratedDocument<Reservation>;

@Schema({ collection: 'reservations', timestamps: true })
export class Reservation {
  @Prop({ required: true, index: true })
  orderId!: string;

  @Prop({ type: Types.ObjectId, ref: 'Product', required: true, index: true })
  productId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Warehouse', required: true, index: true })
  warehouseId!: Types.ObjectId;

  @Prop({ required: true, default: 0 })
  qty!: number;

  @Prop({ default: true, index: true })
  isActive!: boolean;

  @Prop({ enum: ['active', 'released', 'fulfilled', 'cancelled'], default: 'active', index: true })
  status!: ReservationStatus;

  @Prop()
  zoneName?: string;

  @Prop()
  notes?: string;

  @Prop()
  expiresAt?: Date;
}

export const ReservationSchema = SchemaFactory.createForClass(Reservation);
ReservationSchema.index({ orderId: 1, status: 1 });
