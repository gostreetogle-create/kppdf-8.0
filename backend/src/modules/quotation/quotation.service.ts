import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Quotation, QuotationDocument, QuotationItem } from './quotation.schema';
import { CreateQuotationDto } from './dto/create-quotation.dto';
import { UpdateQuotationDto } from './dto/update-quotation.dto';
import { CounterService } from '../counter/counter.service';
import { ContractService } from '../contract/contract.service';
import { OrderService } from '../order/order.service';

@Injectable()
export class QuotationService {
  constructor(
    @InjectModel(Quotation.name)
    private readonly model: Model<QuotationDocument>,
    private readonly counter: CounterService,
    private readonly contractService: ContractService,
    private readonly orderService: OrderService,
  ) {}

  async create(dto: CreateQuotationDto): Promise<QuotationDocument> {
    const number = dto.number ?? (await this.counter.next('Quotation', 'QTN'));
    const items: QuotationItem[] = dto.items.map((i) => {
      const total = (i.quantity ?? 0) * (i.unitPrice ?? 0);
      return {
        productId: new Types.ObjectId(i.productId),
        productName: i.productName,
        productSku: i.productSku,
        sourceItemId: i.sourceItemId,
        quantity: i.quantity,
        unit: i.unit,
        unitPrice: i.unitPrice,
        markupPercent: i.markupPercent ?? 0,
        total,
        sortOrder: i.sortOrder ?? 0,
      };
    });
    const subtotal = items.reduce((s, i) => s + i.total, 0);
    let total = subtotal;
    if (dto.discountType === 'percent') {
      total = subtotal * (1 - (dto.discountPercent ?? 0) / 100);
    } else if (dto.discountType === 'amount') {
      total = subtotal - (dto.discountAmount ?? 0);
    }
    return this.model.create({
      number,
      organizationId: new Types.ObjectId(dto.organizationId),
      counterpartyId: new Types.ObjectId(dto.counterpartyId),
      tenderId: dto.tenderId ? new Types.ObjectId(dto.tenderId) : undefined,
      date: dto.date ? new Date(dto.date) : new Date(),
      validUntil: dto.validUntil ? new Date(dto.validUntil) : undefined,
      status: dto.status ?? 'draft',
      total,
      discountType: dto.discountType ?? 'none',
      discountPercent: dto.discountPercent ?? 0,
      discountAmount: dto.discountAmount ?? 0,
      notes: dto.notes,
      templateId: dto.templateId ? new Types.ObjectId(dto.templateId) : undefined,
      designSnapshot: dto.designSnapshot,
      templateSnapshot: dto.templateSnapshot,
      items,
    });
  }

  async findAll(
    counterpartyId?: string,
    status?: string,
    from?: Date,
    to?: Date,
  ): Promise<QuotationDocument[]> {
    const filter: Record<string, unknown> = {};
    if (counterpartyId) {
      if (!Types.ObjectId.isValid(counterpartyId)) return [];
      filter.counterpartyId = new Types.ObjectId(counterpartyId);
    }
    if (status) filter.status = status;
    if (from || to) {
      const range: Record<string, Date> = {};
      if (from) range.$gte = from;
      if (to) range.$lte = to;
      filter.date = range;
    }
    return this.model
      .find(filter)
      .populate('counterpartyId')
      .populate('organizationId')
      .populate('items.productId')
      .sort({ date: -1 })
      .exec();
  }

  async findById(id: string): Promise<QuotationDocument> {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException(`Quotation ${id} not found`);
    }
    const doc = await this.model
      .findById(id)
      .populate('counterpartyId')
      .populate('organizationId')
      .populate('items.productId')
      .exec();
    if (!doc) throw new NotFoundException(`Quotation ${id} not found`);
    return doc;
  }

  async update(id: string, dto: UpdateQuotationDto): Promise<QuotationDocument> {
    const doc = await this.findById(id);
    if (dto.notes !== undefined) doc.notes = dto.notes;
    if (dto.status !== undefined) doc.status = dto.status;
    if (dto.validUntil !== undefined) doc.validUntil = new Date(dto.validUntil);
    if (dto.title !== undefined) doc.title = dto.title;
    if (dto.discountType !== undefined) doc.discountType = dto.discountType;
    if (dto.discountPercent !== undefined) doc.discountPercent = dto.discountPercent;
    if (dto.discountAmount !== undefined) doc.discountAmount = dto.discountAmount;
    if (dto.items !== undefined) {
      doc.items = dto.items.map((i) => ({
        productId: new Types.ObjectId(i.productId),
        productName: i.productName,
        productSku: i.productSku,
        sourceItemId: i.sourceItemId,
        quantity: i.quantity,
        unit: i.unit,
        unitPrice: i.unitPrice,
        markupPercent: i.markupPercent ?? 0,
        total: (i.quantity ?? 0) * (i.unitPrice ?? 0),
        sortOrder: i.sortOrder ?? 0,
      }));
    }
    // Recompute total from items + current discount
    const subtotal = (doc.items ?? []).reduce((s, i) => s + (i.total ?? 0), 0);
    if (doc.discountType === 'percent') {
      doc.total = subtotal * (1 - (doc.discountPercent ?? 0) / 100);
    } else if (doc.discountType === 'amount') {
      doc.total = subtotal - (doc.discountAmount ?? 0);
    } else {
      doc.total = subtotal;
    }
    return doc.save();
  }

  async duplicate(id: string): Promise<QuotationDocument> {
    const src = await this.findById(id);
    const number = await this.counter.next('Quotation', 'QTN');
    return this.model.create({
      number,
      organizationId: src.organizationId,
      counterpartyId: src.counterpartyId,
      tenderId: src.tenderId,
      date: new Date(),
      validUntil: src.validUntil,
      status: 'draft',
      total: src.total,
      discountType: src.discountType,
      discountPercent: src.discountPercent,
      discountAmount: src.discountAmount,
      notes: `Дубликат ${src.number}`,
      templateId: src.templateId,
      designSnapshot: src.designSnapshot,
      templateSnapshot: src.templateSnapshot,
      items: src.items.map((i) => ({
        productId: i.productId,
        productName: i.productName,
        productSku: i.productSku,
        sourceItemId: i.sourceItemId,
        quantity: i.quantity,
        unit: i.unit,
        unitPrice: i.unitPrice,
        markupPercent: i.markupPercent,
        total: i.total,
        sortOrder: i.sortOrder,
      })),
    });
  }

  /** Find by ID without populate — returns raw ObjectIds for refs. */
  private async findByIdRaw(id: string): Promise<QuotationDocument> {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException(`Quotation ${id} not found`);
    }
    const doc = await this.model.findById(id).exec();
    if (!doc) throw new NotFoundException(`Quotation ${id} not found`);
    return doc;
  }

  async convertToContract(
    id: string,
    title?: string,
  ): Promise<{ quotation: QuotationDocument; contractId: string }> {
    // Use unpopulated query so organizationId / counterpartyId are raw
    // ObjectIds (populate can set them to null if the ref was deleted).
    const q = await this.findByIdRaw(id);
    if (q.status === 'converted') {
      throw new NotFoundException(`Quotation already converted`);
    }
    const contract = await this.contractService.create({
      title: title ?? q.title ?? `Договор по КП ${q.number}`,
      proposalId: q._id.toString(),
      organizationId: q.organizationId.toString(),
      customerId: q.counterpartyId.toString(),
      status: 'draft',
      notes: q.notes,
      items: q.items.map((i) => ({
        productId: i.productId.toString(),
        productName: i.productName,
        quantity: i.quantity,
        unit: i.unit,
        unitPrice: i.unitPrice,
      })),
    });
    q.status = 'converted';
    q.convertedContractId = contract._id.toString();
    await q.save();
    return { quotation: q, contractId: contract._id.toString() };
  }

  async convertToOrder(
    id: string,
    deliveryAddress?: string,
    managerId?: string,
  ): Promise<{ quotation: QuotationDocument; orderId: string }> {
    // Use unpopulated query so counterpartyId is a raw ObjectId.
    const q = await this.findByIdRaw(id);
    if (q.status === 'converted') {
      throw new NotFoundException(`Quotation already converted`);
    }
    const order = await this.orderService.create({
      counterpartyId: q.counterpartyId.toString(),
      quotationId: q._id.toString(),
      status: 'draft',
      deliveryAddress,
      managerId,
      items: q.items.map((i) => ({
        productId: i.productId.toString(),
        productName: i.productName,
        productSku: i.productSku,
        quantity: i.quantity,
        unit: i.unit,
        unitPrice: i.unitPrice,
      })),
    });
    q.status = 'converted';
    q.convertedOrderId = order._id.toString();
    await q.save();
    return { quotation: q, orderId: order._id.toString() };
  }

  async remove(id: string): Promise<void> {
    const doc = await this.findById(id);
    await this.model
      .updateOne({ _id: doc._id }, { $set: { deletedAt: new Date() } })
      .exec();
  }
}
