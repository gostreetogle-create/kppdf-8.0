import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type BlockType = 'header' | 'text' | 'table' | 'image' | 'signature';

/**
 * TZ-86 Phase A.3 — DataBinding subdoc.
 *
 * Optional binding for live data resolution at render time. Source specifies
 * which entity to look up; field is the canonical attribute name on that
 * entity (e.g. 'name' / 'inn' / 'address' / 'legalAddress'); value only applies
 * when `source === 'static'` (literal text) — used for inline placeholders.
 *
 * `_id: false` because subdocs in Mongoose auto-generate _id by default —
 * we don't need it here since a TemplateBlock can hold at most one binding.
 */
export type DataBindingSource =
  | 'organization'
  | 'counterparty'
  | 'product'
  | 'material'
  | 'work-type'
  | 'order'
  | 'contract'
  | 'cost-calculation'
  | 'static';

export type DataBindingFormat = 'text' | 'date' | 'currency' | 'number';

@Schema({ _id: false })
export class DataBinding {
  @Prop({
    type: String,
    enum: [
      'organization',
      'counterparty',
      'product',
      'material',
      'work-type',
      'order',
      'contract',
      'cost-calculation',
      'static',
    ],
    required: true,
  })
  source!: DataBindingSource;

  /** Canonical attribute name on the source entity (e.g. 'name', 'inn'). */
  @Prop()
  field?: string;

  /** Literal value — only meaningful when source === 'static'. */
  @Prop()
  value?: string;

  /** Rendering hint for the frontend; null/max-length display logic. */
  @Prop({ type: String, enum: ['text', 'date', 'currency', 'number'] })
  format?: DataBindingFormat;
}

export const DataBindingSchema = SchemaFactory.createForClass(DataBinding);

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

  /**
   * TZ-86 Phase A.3 — Optional live-data binding. Absent for static-template
   * blocks (Phase D canvas treats null binding as «render literal content»).
   */
  @Prop({ type: DataBindingSchema })
  dataBinding?: DataBinding;

  @Prop({ default: true })
  isActive!: boolean;
}

export const TemplateBlockSchema = SchemaFactory.createForClass(TemplateBlock);
TemplateBlockSchema.index({ templateId: 1, order: 1 });
