import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema } from 'mongoose';

export type SettingDocument = HydratedDocument<Setting>;

@Schema({ collection: 'settings', timestamps: true, softDelete: false })
export class Setting {
  @Prop({ required: true, unique: true, index: true })
  key!: string;

  /** Arbitrary JSON-serializable value. */
  @Prop({ type: MongooseSchema.Types.Mixed })
  value!: unknown;

  @Prop({ required: true, index: true })
  group!: string;

  @Prop()
  description?: string;
}

export const SettingSchema = SchemaFactory.createForClass(Setting);
