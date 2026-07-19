import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type DocumentTemplateDocument = HydratedDocument<DocumentTemplate>;

@Schema({ collection: 'document_templates', timestamps: true })
export class DocumentTemplate {
  @Prop({ required: true, index: true })
  name!: string;

  @Prop()
  description?: string;

  @Prop({ type: [String], default: [] })
  tags!: string[];

  @Prop({ type: Types.ObjectId, ref: 'Organization', required: true, index: true })
  organizationId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'DocType', required: true, index: true })
  docTypeId!: Types.ObjectId;

  @Prop({ default: false, index: true })
  isDefault!: boolean;

  @Prop({ default: true, index: true })
  isActive!: boolean;

  @Prop({ enum: ['A4', 'A5', 'Letter', 'Legal'], default: 'A4' })
  pageSize!: string;

  @Prop({ type: [String], default: [] })
  backgroundImage!: string[];

  @Prop({ default: -1 })
  defaultBackgroundIndex!: number;

  @Prop({ default: 0.3 })
  backgroundOpacity!: number;

  @Prop({ enum: ['portrait', 'landscape'], default: 'portrait' })
  orientation!: 'portrait' | 'landscape';

  @Prop({ default: 1 })
  version!: number;

  @Prop()
  notes?: string;
}

export const DocumentTemplateSchema = SchemaFactory.createForClass(DocumentTemplate);
DocumentTemplateSchema.index({ organizationId: 1, docTypeId: 1, isDefault: 1 });
