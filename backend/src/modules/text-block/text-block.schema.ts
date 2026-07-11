import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

/**
 * TZ-86 Phase A.1 — TextBlock.
 *
 * Reusable free-text chunks composable into document templates via the
 * constructor canvas. Stored as CommonMark markdown; frontend parser renders
 * to HTML at consumption time (Phase C frontend).
 *
 * Soft-delete via project plugin (autofilter `deletedAt: null`). Slug is the
 * canonical lookup key exposed to the frontend picker (used internally AND
 * as URL-stable id), so the unique index is critical. Category + sortOrder
 * are picker-listing ordering; tags are free-form kebab-cased strings.
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
    enum: TEXT_BLOCK_CATEGORIES,
    required: true,
    index: true,
  })
  category!: TextBlockCategory;

  @Prop({ type: [String], default: [] })
  tags!: string[];

  /** CommonMark markdown — render via marked.js or markdown-it at consumption. Max 10000 chars. */
  @Prop({ required: true, maxlength: 10000 })
  content!: string;

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
