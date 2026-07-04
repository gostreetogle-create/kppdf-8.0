import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

@Schema({ _id: false })
export class QuotationItem {
  @Prop({ type: Types.ObjectId, ref: 'Product', required: true })
  productId!: Types.ObjectId;

  @Prop()
  productName?: string;

  @Prop()
  productSku?: string;

  @Prop()
  sourceItemId?: string;

  @Prop({ required: true, default: 0 })
  quantity!: number;

  @Prop()
  unit?: string;

  @Prop({ required: true, default: 0 })
  unitPrice!: number;

  @Prop({ default: 0 })
  markupPercent!: number;

  @Prop({ required: true, default: 0 })
  total!: number;

  @Prop({ default: 0 })
  sortOrder!: number;
}

const QuotationItemSchema = SchemaFactory.createForClass(QuotationItem);

export type QuotationStatus = 'draft' | 'sent' | 'accepted' | 'rejected' | 'converted' | 'cancelled';
export type DiscountType = 'none' | 'percent' | 'amount';
export type QuotationDocument = HydratedDocument<Quotation>;

@Schema({ collection: 'quotations', timestamps: true })
export class Quotation {
  @Prop({ required: true, unique: true, index: true })
  number!: string;

  @Prop({ type: Types.ObjectId, ref: 'Organization', required: true, index: true })
  organizationId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Counterparty', required: true, index: true })
  counterpartyId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Tender', index: true })
  tenderId?: Types.ObjectId;

  @Prop()
  title?: string;

  @Prop({ required: true, default: () => new Date() })
  date!: Date;

  @Prop()
  validUntil?: Date;

  @Prop({ type: Types.ObjectId, ref: 'EntityStatus' })
  statusId?: Types.ObjectId;

  @Prop({
    enum: ['draft', 'sent', 'accepted', 'rejected', 'converted', 'cancelled'],
    default: 'draft',
    index: true,
  })
  status!: QuotationStatus;

  @Prop({ required: true, default: 0 })
  total!: number;

  @Prop({ enum: ['none', 'percent', 'amount'], default: 'none' })
  discountType!: DiscountType;

  @Prop({ default: 0 })
  discountPercent!: number;

  @Prop({ default: 0 })
  discountAmount!: number;

  @Prop()
  notes?: string;

  @Prop({ default: true, index: true })
  isActive!: boolean;

  @Prop({ type: Types.ObjectId, ref: 'DocumentTemplate' })
  templateId?: Types.ObjectId;

  @Prop({ type: Object })
  designSnapshot?: Record<string, unknown>;

  @Prop({ type: Object })
  templateSnapshot?: Record<string, unknown>;

  @Prop({ type: [QuotationItemSchema], default: [] })
  items!: QuotationItem[];

  @Prop()
  convertedContractId?: string;

  @Prop()
  convertedOrderId?: string;
}

export const QuotationSchema = SchemaFactory.createForClass(Quotation);
QuotationSchema.index({ counterpartyId: 1, date: -1 });
QuotationSchema.index({ status: 1, date: -1 });
