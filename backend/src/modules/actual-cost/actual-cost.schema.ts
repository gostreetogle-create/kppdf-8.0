import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type ActualCostType = 'material' | 'labor' | 'overhead' | 'other';
export type ActualCostDocument = HydratedDocument<ActualCost>;

@Schema({ collection: 'actualcosts', timestamps: true })
export class ActualCost {
  @Prop({ type: Types.ObjectId, ref: 'ProductionOrder', required: true, index: true })
  orderId!: Types.ObjectId;

  @Prop({ required: true, enum: ['material', 'labor', 'overhead', 'other'] })
  type!: ActualCostType;

  @Prop({ required: true, default: 0 })
  amount!: number;

  @Prop()
  description?: string;

  @Prop()
  sourceRef?: string;

  @Prop()
  date?: Date;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  createdBy?: Types.ObjectId;
}

export const ActualCostSchema = SchemaFactory.createForClass(ActualCost);
ActualCostSchema.index({ orderId: 1, type: 1 });
