import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type StudioDocumentStatus = 'draft' | 'frozen' | 'final';

export type StudioDocumentDocument = HydratedDocument<StudioDocument>;

@Schema({ collection: 'studio_documents', timestamps: true })
export class StudioDocument {
  @Prop({ required: true, index: true })
  name!: string;

  @Prop({ type: Types.ObjectId, ref: 'Organization', required: true, index: true })
  organizationId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'DocType', index: true })
  docTypeId?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'DocumentTemplate', index: true })
  sourceTemplateId?: Types.ObjectId;

  @Prop({ enum: ['A3', 'A4', 'A5'], default: 'A4' })
  pageSize!: string;

  @Prop({ enum: ['portrait', 'landscape'], default: 'portrait' })
  orientation!: 'portrait' | 'landscape';

  @Prop({ type: [String], default: [] })
  backgroundImage!: string[];

  @Prop({ default: -1 })
  defaultBackgroundIndex!: number;

  @Prop({ default: 0.3 })
  backgroundOpacity!: number;

  @Prop({ default: false })
  pageNumbering!: boolean;

  @Prop({ default: 1, min: 1 })
  manualPageCount!: number;

  @Prop({ type: Object, default: {} })
  context!: Record<string, unknown>;

  @Prop({ type: [Object], default: [] })
  dataAnchors!: Record<string, unknown>[];

  @Prop({ type: [Object], default: [] })
  dataSets!: Record<string, unknown>[];

  @Prop({
    type: String,
    enum: ['draft', 'frozen', 'final'],
    default: 'draft',
    index: true,
  })
  status!: StudioDocumentStatus;

  @Prop({ default: 1, min: 1 })
  revision!: number;

  @Prop({ default: 1 })
  schemaVersion!: number;

  @Prop({ type: Types.ObjectId, ref: 'User', index: true })
  createdBy?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', index: true })
  updatedBy?: Types.ObjectId;

  @Prop({ type: Date, default: null, index: true })
  deletedAt?: Date | null;
}

export const StudioDocumentSchema = SchemaFactory.createForClass(StudioDocument);
StudioDocumentSchema.index({ organizationId: 1, status: 1 });
StudioDocumentSchema.index({ organizationId: 1, updatedAt: -1 });
