import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type WorkTypeDocument = HydratedDocument<WorkType>;

@Schema({ collection: 'worktypes', timestamps: true })
export class WorkType {
  @Prop({ required: true, index: true })
  name!: string;

  @Prop()
  section?: string;

  @Prop()
  description?: string;

  @Prop({ default: true, index: true })
  isActive!: boolean;

  @Prop()
  department?: string;

  @Prop({ default: 0 })
  defaultDurationHours?: number;

  @Prop({ type: Types.ObjectId, ref: 'WorkCenter', index: true })
  workCenterId?: Types.ObjectId;

  @Prop({ default: 0 })
  hourlyRate?: number;
}

export const WorkTypeSchema = SchemaFactory.createForClass(WorkType);
