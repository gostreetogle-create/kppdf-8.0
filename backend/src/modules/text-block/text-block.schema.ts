import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

/**
 * TZ-86 Phase A.1 — TextBlock (extended for visual constructor).
 *
 * Reusable text chunks composable into document templates. Now supports
 * both:
 *   - **Simple** (legacy): `content` as HTML string
 *   - **Multi-column** (new): `columns[]` array, each with its own HTML content
 *
 * `slug` is auto-generated from name if omitted. `category`, `tags`,
 * `sortOrder` are optional (the simplified UI no longer exposes them).
 */

export type TextBlockCategory =
  | 'legal'
  | 'intro'
  | 'outro'
  | 'custom';

export const TEXT_BLOCK_CATEGORIES: TextBlockCategory[] = [
  'legal',
  'intro',
  'outro',
  'custom',
];

export interface TextBlockColumn {
  id: string;
  content: string;
  width: number;
}

export type TextBlockDocument = HydratedDocument<TextBlock>;

@Schema({ collection: 'text_blocks', timestamps: true })
export class TextBlock {
  @Prop({ required: true, maxlength: 200 })
  name!: string;

  /** Unique slug — auto-generated from name (kebab-case + transliteration) if caller omits. */
  @Prop({ required: true, unique: true, index: true, maxlength: 100 })
  slug!: string;

  @Prop({
    type: String,
    enum: [...TEXT_BLOCK_CATEGORIES],
    default: 'custom',
    index: true,
  })
  category!: TextBlockCategory;

  @Prop({ type: [String], default: [] })
  tags!: string[];

  /**
   * Content for simple blocks (HTML, previously CommonMark markdown).
   * Optional — multi-column blocks use `columns` instead.
   */
  @Prop({ maxlength: 50000 })
  content?: string;

  /**
   * Multi-column layout. Each column has id, HTML content, and width ratio.
   * When non-empty, `content` should be ignored in favor of rendering columns.
   */
  @Prop({
    type: [{
      id: { type: String, required: true },
      content: { type: String, default: '' },
      width: { type: Number, default: 1 },
    }],
    default: [],
    _id: false,
  })
  columns?: TextBlockColumn[];

  @Prop({ default: true, index: true })
  isActive!: boolean;

  /** Manual reordering in picker (low → high). */
  @Prop({ default: 0 })
  sortOrder!: number;
}

export const TextBlockSchema = SchemaFactory.createForClass(TextBlock);

/**
 * Compound indexes:
 *  - (category, sortOrder) → primary picker listing query (TZ-86C.1).
 *  - (category, isActive) → fast active-only lookup for canvas render.
 */
TextBlockSchema.index({ category: 1, sortOrder: 1 });
TextBlockSchema.index({ category: 1, isActive: 1 });
