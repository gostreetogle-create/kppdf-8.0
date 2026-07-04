import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type BlockType = 'header' | 'text' | 'table' | 'image' | 'signature';
export type TemplateBlockDocument = HydratedDocument<TemplateBlock>;

@Schema({ collection: 'template_blocks', timestamps: true })
export class TemplateBlock {
  @Prop({ type: Types.ObjectId, ref: 'DocumentTemplate', required: true, index: true })
  templateId!: Types.ObjectId;

  @Prop({ enum: ['header', 'text', 'table', 'image', 'signature'], required: true })
  type!: BlockType;

  @Prop({ required: true, default: 0 })
  order!: number;

  @Prop()
  title?: string;

  @Prop()
  content?: string;

  @Prop()
  height?: number;

  @Prop({ default: false })
  showLine!: boolean;

  @Prop({ type: Object })
  settings?: Record<string, unknown>;

  @Prop({ default: true })
  isActive!: boolean;
}

export const TemplateBlockSchema = SchemaFactory.createForClass(TemplateBlock);
TemplateBlockSchema.index({ templateId: 1, order: 1 });
