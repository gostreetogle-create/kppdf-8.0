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

/** Immutable payload captured when a quotation is frozen/sent (SALES-302). */
@Schema({ _id: false })
export class QuotationVersion {
  @Prop({ required: true })
  version!: number;

  @Prop({ required: true })
  frozenAt!: Date;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  frozenBy?: Types.ObjectId;

  @Prop({ type: Object, required: true })
  payload!: Record<string, unknown>;
}

const QuotationVersionSchema = SchemaFactory.createForClass(QuotationVersion);

export type QuotationStatus =
  'draft' | 'sent' | 'accepted' | 'rejected' | 'converted' | 'cancelled';
export type DiscountType = 'none' | 'percent' | 'amount';
/** D21 / SALES-303: solo = standalone; master = family root; variant = org clone. */
export type QuotationFamilyRole = 'solo' | 'master' | 'variant';
export type QuotationDocument = HydratedDocument<Quotation>;

@Schema({ collection: 'quotations', timestamps: true })
export class Quotation {
  @Prop({ required: true, unique: true, index: true })
  number!: string;

  @Prop({
    type: Types.ObjectId,
    ref: 'Organization',
    required: true,
    index: true,
  })
  organizationId!: Types.ObjectId;

  /** Family role (default solo — existing docs stay valid without migration). */
  @Prop({
    enum: ['solo', 'master', 'variant'],
    default: 'solo',
    index: true,
  })
  familyRole!: QuotationFamilyRole;

  /** Set only on variant — points at the master quotation. */
  @Prop({ type: Types.ObjectId, ref: 'Quotation', index: true })
  masterId?: Types.ObjectId;

  /** Bumped on master when sync-from-master copies lines to variants. */
  @Prop({ required: true, default: 1 })
  familyVersion!: number;

  /** Per-KP org markup override (%). Default applied later from Organization. */
  @Prop({ default: undefined })
  orgMarkupPercent?: number;

  @Prop({ default: 20, min: 0, max: 100 })
  vatPercent!: number;

  @Prop({ default: 0, min: 0, max: 100 })
  prepaymentPercent!: number;

  @Prop({ default: 0, min: 0 })
  productionDays!: number;

  @Prop({ default: 0, min: 0 })
  deliveryDays!: number;

  /** Drafts may exist before the Create КП client picker is completed. */
  @Prop({ type: Types.ObjectId, ref: 'Counterparty', index: true })
  counterpartyId?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Person', index: true })
  contactPersonId?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Site', index: true })
  siteId?: Types.ObjectId;

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

  @Prop({ index: true })
  deletedAt?: Date;

  @Prop({ type: Types.ObjectId, ref: 'DocumentTemplate' })
  templateId?: Types.ObjectId;

  @Prop({ type: Object })
  designSnapshot?: Record<string, unknown>;

  @Prop({ type: Object })
  templateSnapshot?: Record<string, unknown>;

  @Prop({ type: [QuotationItemSchema], default: [] })
  items!: QuotationItem[];

  /** Last immutable snapshot number; legacy quotations start at zero. */
  @Prop({ required: true, default: 0 })
  currentVersion!: number;

  /** Embedded snapshots are never edited by ordinary quotation PATCH calls. */
  @Prop({ type: [QuotationVersionSchema], default: [] })
  versions!: QuotationVersion[];

  @Prop()
  convertedContractId?: string;

  @Prop()
  convertedOrderId?: string;

  /**
   * TZ-ORDERS-306: КП-заглушка, созданная из прямого заказа (без цен менеджера).
   * Флаг нужен, чтобы такой черновик не выглядел в списке как настоящее КП,
   * которое кто-то посчитал и отправил клиенту.
   */
  @Prop({ default: false, index: true })
  isStub!: boolean;

  /** Заказ, из которого выросла заглушка (обратная связь к `Order.quotationId`). */
  @Prop({ type: Types.ObjectId, ref: 'Order', index: true, sparse: true })
  sourceOrderId?: Types.ObjectId;
}

export const QuotationSchema = SchemaFactory.createForClass(Quotation);
QuotationSchema.index({ counterpartyId: 1, date: -1 });
QuotationSchema.index({ status: 1, date: -1 });
/** One variant per org inside a family (sparse: solo/master have no masterId). */
QuotationSchema.index(
  { masterId: 1, organizationId: 1 },
  { unique: true, sparse: true },
);
