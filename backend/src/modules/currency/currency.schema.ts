import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type CurrencyDocument = HydratedDocument<Currency>;

/**
 * Catalog of currencies (ISO-style codes).
 *
 * `code` is the canonical 3-letter key (RUB / USD / EUR / CNY / …) used
 * in `Material.priceCurrency`, `Order.currency`, etc. `label` /
 * `symbol` are display-only. `isSystem` again protects seeded codes
 * from accidental deletion.
 */
@Schema({ collection: 'currencies', timestamps: true })
export class Currency {
  @Prop({ required: true, unique: true, index: true })
  code!: string;

  @Prop({ required: true })
  label!: string;

  @Prop()
  symbol?: string;

  @Prop({ default: true, index: true })
  isActive!: boolean;

  @Prop({ default: false })
  isSystem!: boolean;

  @Prop({ default: 0 })
  sortOrder!: number;
}

export const CurrencySchema = SchemaFactory.createForClass(Currency);

// Compound index for the dropdown-companion query.
CurrencySchema.index({ isActive: 1, sortOrder: 1, code: 1 });
