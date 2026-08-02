import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type ColorReferenceDocument = HydratedDocument<ColorReference>;

/**
 * TZ-PRODUCTS-301 — справочная сущность «Цвет» (RAL + hex).
 *
 * Зеркалит TZ-DOC-307/315 (document-template-category / text-block-category):
 *   - `slug` — стабильный ключ (kebab-lowercase). Уникальность скоупирована
 *     областью: compound unique индекс `{ organizationId, slug }`.
 *   - `organizationId` set → цвет области; undefined → SYSTEM scope
 *     (isSystem: true, seed-managed, виден всем организациям).
 *   - `hex` — swatch-значение `#RRGGBB` (валидируется в DTO).
 *   - `deletedAt` — soft delete (counterparty-паттерн): findAll/findById
 *     исключают удалённые.
 *   - `isDefault` — серверный default для форм товара (resolveDefault /
 *     assertDefaultId по паттерну TZ-DOC-307).
 */
@Schema({ collection: 'color_references', timestamps: true })
export class ColorReference {
  /** Стабильный ключ: kebab-lowercase (сервер генерирует из name при отсутствии). */
  @Prop({ required: true, index: true })
  slug!: string;

  @Prop({ required: true, index: true })
  name!: string;

  /** Swatch `#RRGGBB` — валидируется `@Matches(/^#[0-9a-fA-F]{6}$/)` в DTO. */
  @Prop({ required: true })
  hex!: string;

  @Prop()
  description?: string;

  @Prop({ default: true, index: true })
  isActive!: boolean;

  /** True только для seed-созданных системных цветов (глобальный scope). */
  @Prop({ default: false, index: true })
  isSystem?: boolean;

  /** True для цвета, используемого сервером как default для форм товара. */
  @Prop({ default: false, index: true })
  isDefault?: boolean;

  @Prop({ default: 0 })
  sortOrder!: number;

  /** TZ-240 convention: undefined/null = system (global) record. */
  @Prop({ required: false, sparse: true, index: true })
  organizationId?: Types.ObjectId;

  /** Soft delete (counterparty-паттерн). */
  @Prop()
  deletedAt?: Date;
}

export const ColorReferenceSchema = SchemaFactory.createForClass(ColorReference);

// Uniqueness scoped to the ownership area. Missing organizationId indexes
// as null, so system colors share one slug namespace and each organization
// gets its own — exactly the ownership-scoped contract (TZ-DOC-307/315).
ColorReferenceSchema.index({ organizationId: 1, slug: 1 }, { unique: true, sparse: true });
