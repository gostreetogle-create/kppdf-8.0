import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type WorkerDocument = HydratedDocument<Worker>;

@Schema({ collection: 'workers', timestamps: true })
export class Worker {
  @Prop({ required: true, index: true })
  lastName!: string;

  @Prop({ required: true })
  firstName!: string;

  @Prop()
  patronymic?: string;

  @Prop()
  grade?: string;

  @Prop({ default: 0 })
  ratePerHour?: number;

  @Prop({ type: [Types.ObjectId], ref: 'WorkType', default: [], index: true })
  workTypeIds!: Types.ObjectId[];

  @Prop({ default: true, index: true })
  isActive!: boolean;

  @Prop()
  phone?: string;

  @Prop({ type: Types.ObjectId, ref: 'Person', index: true })
  personId?: Types.ObjectId;

  @Prop()
  department?: string;
}

export const WorkerSchema = SchemaFactory.createForClass(Worker);
WorkerSchema.index({ lastName: 1, firstName: 1 });
