import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type GeneratedDocumentSourceType = 'order' | 'contract' | 'manual';
export type GeneratedDocumentStatus = 'draft' | 'final';

export type GeneratedDocumentDocument = HydratedDocument<GeneratedDocument>;

@Schema({ collection: 'generated_documents', timestamps: true })
export class GeneratedDocument {
  @Prop({ required: true, unique: true, index: true })
  number!: string;

  @Prop({ required: true })
  name!: string;

  @Prop({ type: Types.ObjectId, ref: 'DocumentTemplate', required: true, index: true })
  templateId!: Types.ObjectId;

  @Prop()
  templateName?: string;

  @Prop({ type: String, enum: ['order', 'contract', 'manual'], default: 'manual' })
  sourceType!: GeneratedDocumentSourceType;

  @Prop({ type: Types.ObjectId })
  sourceId?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Organization', index: true })
  organizationId?: Types.ObjectId;

  /** Rendered HTML snapshot at generation time. */
  @Prop({ required: true })
  html!: string;

  @Prop({ type: Object })
  buildPayload?: Record<string, unknown>;

  @Prop({ type: String, enum: ['draft', 'final'], default: 'draft', index: true })
  status!: GeneratedDocumentStatus;

  @Prop({ default: true, index: true })
  isActive!: boolean;
}

export const GeneratedDocumentSchema = SchemaFactory.createForClass(GeneratedDocument);
GeneratedDocumentSchema.index({ templateId: 1, createdAt: -1 });
GeneratedDocumentSchema.index({ sourceType: 1, sourceId: 1 });
