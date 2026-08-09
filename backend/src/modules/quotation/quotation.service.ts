import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Quotation, QuotationDocument, QuotationItem } from './quotation.schema';
import { CreateQuotationDto } from './dto/create-quotation.dto';
import { UpdateQuotationDto } from './dto/update-quotation.dto';
import { AttachOrganizationsDto } from './dto/attach-organizations.dto';
import { CounterService } from '../counter/counter.service';
import { ContractService } from '../contract/contract.service';
import { OrderService } from '../order/order.service';
import { SiteService } from '../site/site.service';

/** Thin family summary for GET /:id/family (D21 / SALES-303). */
export interface QuotationFamilyMemberSummary {
  id: string;
  number: string;
  organizationId: string;
  familyRole: string;
  familyVersion: number;
  orgMarkupPercent?: number;
  total: number;
  status: string;
}

export interface QuotationFamilyResponse {
  master: QuotationFamilyMemberSummary;
  variants: QuotationFamilyMemberSummary[];
  familyVersion: number;
}

@Injectable()
export class QuotationService {
  constructor(
    @InjectModel(Quotation.name)
    private readonly model: Model<QuotationDocument>,
    private readonly counter: CounterService,
    private readonly contractService: ContractService,
    private readonly orderService: OrderService,
    private readonly sites: SiteService,
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
      counterpartyId: dto.counterpartyId
        ? new Types.ObjectId(dto.counterpartyId)
        : undefined,
      tenderId: dto.tenderId ? new Types.ObjectId(dto.tenderId) : undefined,
      date: dto.date ? new Date(dto.date) : new Date(),
      validUntil: dto.validUntil ? new Date(dto.validUntil) : undefined,
      status: dto.status ?? 'draft',
      total,
      discountType: dto.discountType ?? 'none',
      discountPercent: dto.discountPercent ?? 0,
      discountAmount: dto.discountAmount ?? 0,
      notes: dto.notes,
      orgMarkupPercent: dto.orgMarkupPercent,
      templateId: dto.templateId ? new Types.ObjectId(dto.templateId) : undefined,
      designSnapshot: dto.designSnapshot,
      templateSnapshot: dto.templateSnapshot,
      items,
      familyRole: 'solo',
      familyVersion: 1,
    });
  }

  async findAll(
    counterpartyId?: string,
    status?: string,
    from?: Date,
    to?: Date,
  ): Promise<QuotationDocument[]> {
    const filter: Record<string, unknown> = { deletedAt: null };
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
    if (!doc || doc.deletedAt) throw new NotFoundException(`Quotation ${id} not found`);
    return doc;
  }

  async update(id: string, dto: UpdateQuotationDto): Promise<QuotationDocument> {
    const doc = await this.findById(id);
    if (dto.organizationId !== undefined) {
      doc.organizationId = new Types.ObjectId(dto.organizationId);
    }
    if (dto.counterpartyId !== undefined) {
      doc.counterpartyId = new Types.ObjectId(dto.counterpartyId);
    }
    if (dto.orgMarkupPercent !== undefined) doc.orgMarkupPercent = dto.orgMarkupPercent;
    if (dto.templateId !== undefined) {
      doc.templateId = dto.templateId ? new Types.ObjectId(dto.templateId) : undefined;
    }
    if (dto.templateSnapshot !== undefined) doc.templateSnapshot = dto.templateSnapshot;
    if (dto.designSnapshot !== undefined) doc.designSnapshot = dto.designSnapshot;
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

  /**
   * Freeze the current editable quotation into an embedded immutable snapshot.
   * Ordinary PATCH operations never address `versions`, so later line edits
   * cannot mutate a snapshot already sent to a customer.
   */
  async freeze(id: string, frozenBy?: string): Promise<QuotationDocument> {
    const maxAttempts = 5;
    for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
      const doc = await this.findByIdRaw(id);
      const existingMax = (doc.versions ?? []).reduce(
        (max, snapshot) => Math.max(max, snapshot.version),
        0,
      );
      const version = Math.max(doc.currentVersion ?? 0, existingMax) + 1;
      const frozenAt = new Date();
      const payload: Record<string, unknown> = {
        number: doc.number,
        organizationId: doc.organizationId.toString(),
        ...(doc.counterpartyId ? { counterpartyId: doc.counterpartyId.toString() } : {}),
        tenderId: doc.tenderId?.toString(),
        title: doc.title,
        date: doc.date,
        validUntil: doc.validUntil,
        status: doc.status,
        total: doc.total,
        discountType: doc.discountType,
        discountPercent: doc.discountPercent,
        discountAmount: doc.discountAmount,
        notes: doc.notes,
        familyRole: doc.familyRole,
        masterId: doc.masterId?.toString(),
        familyVersion: doc.familyVersion,
        orgMarkupPercent: doc.orgMarkupPercent,
        isActive: doc.isActive,
        convertedContractId: doc.convertedContractId,
        convertedOrderId: doc.convertedOrderId,
        templateId: doc.templateId?.toString(),
        designSnapshot: doc.designSnapshot,
        templateSnapshot: doc.templateSnapshot,
        items: this.cloneItems(doc.items).map((item) => ({
          ...item,
          productId: item.productId.toString(),
        })),
      };
      const snapshot = {
        version,
        frozenAt,
        frozenBy:
          frozenBy && Types.ObjectId.isValid(frozenBy)
            ? new Types.ObjectId(frozenBy)
            : undefined,
        payload,
      };
      const currentVersion = doc.currentVersion ?? 0;
      const versionFilter =
        doc.currentVersion == null
          ? { _id: doc._id, currentVersion: { $exists: false } }
          : { _id: doc._id, currentVersion };
      const result = await this.model
        .updateOne(
          versionFilter,
          {
            $set: { currentVersion: version },
            $push: { versions: snapshot },
          },
        )
        .exec();
      if (result.matchedCount === 1) {
        doc.currentVersion = version;
        doc.versions = [...(doc.versions ?? []), snapshot];
        return doc;
      }
    }
    throw new ConflictException('Quotation changed while freezing; please retry');
  }

  async listVersions(
    id: string,
  ): Promise<Array<{ version: number; frozenAt: Date; frozenBy?: Types.ObjectId }>> {
    const doc = await this.findByIdRaw(id);
    return (doc.versions ?? []).map(({ version, frozenAt, frozenBy }) => ({
      version,
      frozenAt,
      frozenBy,
    }));
  }

  async getVersion(
    id: string,
    version: number,
  ): Promise<{
    version: number;
    frozenAt: Date;
    frozenBy?: Types.ObjectId;
    payload: Record<string, unknown>;
  }> {
    const doc = await this.findByIdRaw(id);
    const snapshot = (doc.versions ?? []).find((item) => item.version === version);
    if (!snapshot) {
      throw new NotFoundException(`Quotation ${id} version ${version} not found`);
    }
    return snapshot;
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
    if (!doc || doc.deletedAt) throw new NotFoundException(`Quotation ${id} not found`);
    return doc;
  }

  private cloneItems(items: QuotationItem[]): QuotationItem[] {
    return (items ?? []).map((i) => ({
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
    }));
  }

  private toFamilySummary(doc: QuotationDocument): QuotationFamilyMemberSummary {
    return {
      id: doc._id.toString(),
      number: doc.number,
      organizationId: doc.organizationId.toString(),
      familyRole: doc.familyRole ?? 'solo',
      familyVersion: doc.familyVersion ?? 1,
      orgMarkupPercent: doc.orgMarkupPercent,
      total: doc.total ?? 0,
      status: doc.status,
    };
  }

  /** Resolve master for any family member (solo/master → self; variant → master). */
  private async resolveMaster(doc: QuotationDocument): Promise<QuotationDocument> {
    const role = doc.familyRole ?? 'solo';
    if (role !== 'variant') return doc;
    if (!doc.masterId) {
      throw new BadRequestException(
        `Quotation ${doc._id} is a variant without masterId`,
      );
    }
    const master = await this.model.findById(doc.masterId).exec();
    if (!master) {
      throw new NotFoundException(`Master quotation ${doc.masterId} not found`);
    }
    return master;
  }

  private assertConvertibleFamilyRole(q: QuotationDocument): void {
    if ((q.familyRole ?? 'solo') === 'variant') {
      throw new BadRequestException(
        'Cannot convert a family variant — convert the master (or solo) quotation instead',
      );
    }
  }

  /**
   * Attach organizations as variants of this КП family (idempotent per org).
   * solo → master; creates one variant per org with copied lines.
   */
  async attachOrganizations(
    id: string,
    dto: AttachOrganizationsDto,
  ): Promise<QuotationFamilyResponse> {
    const root = await this.findByIdRaw(id);
    const master = await this.resolveMaster(root);

    if ((master.familyRole ?? 'solo') === 'solo') {
      master.familyRole = 'master';
      if (master.familyVersion == null) master.familyVersion = 1;
      await master.save();
    }

    const masterOrg = master.organizationId.toString();
    const version = master.familyVersion ?? 1;

    for (const item of dto.items) {
      if (!Types.ObjectId.isValid(item.organizationId)) {
        throw new BadRequestException(`Invalid organizationId: ${item.organizationId}`);
      }
      // Master's own org is already the blank root — skip (idempotent).
      if (item.organizationId === masterOrg) {
        if (item.orgMarkupPercent !== undefined) {
          master.orgMarkupPercent = item.orgMarkupPercent;
          await master.save();
        }
        continue;
      }

      const orgOid = new Types.ObjectId(item.organizationId);
      const existing = await this.model
        .findOne({ masterId: master._id, organizationId: orgOid })
        .exec();

      if (existing) {
        if (item.orgMarkupPercent !== undefined) {
          existing.orgMarkupPercent = item.orgMarkupPercent;
          await existing.save();
        }
        continue;
      }

      const number = await this.counter.next('Quotation', 'QTN');
      try {
        await this.model.create({
          number,
          organizationId: orgOid,
          counterpartyId: master.counterpartyId,
          tenderId: master.tenderId,
          title: master.title,
          date: new Date(),
          validUntil: master.validUntil,
          status: 'draft',
          total: master.total,
          discountType: master.discountType,
          discountPercent: master.discountPercent,
          discountAmount: master.discountAmount,
          notes: master.notes,
          templateId: master.templateId,
          designSnapshot: master.designSnapshot,
          templateSnapshot: master.templateSnapshot,
          items: this.cloneItems(master.items),
          familyRole: 'variant',
          masterId: master._id,
          familyVersion: version,
          orgMarkupPercent: item.orgMarkupPercent,
          isActive: true,
        });
      } catch (err) {
        if ((err as { code?: number })?.code === 11000) {
          throw new ConflictException(
            `Variant for organization ${item.organizationId} already exists in this family`,
          );
        }
        throw err;
      }
    }

    return this.getFamily(master._id.toString());
  }

  /** Copy master lines → all variants; bump familyVersion. */
  async syncFromMaster(id: string): Promise<QuotationFamilyResponse> {
    const root = await this.findByIdRaw(id);
    const master = await this.resolveMaster(root);

    if ((master.familyRole ?? 'solo') === 'solo') {
      // No family yet — nothing to sync; keep solo intact.
      return this.getFamily(master._id.toString());
    }

    master.familyVersion = (master.familyVersion ?? 1) + 1;
    await master.save();

    const variants = await this.model.find({ masterId: master._id }).exec();
    const items = this.cloneItems(master.items);
    for (const v of variants) {
      v.items = items;
      v.total = master.total;
      v.discountType = master.discountType;
      v.discountPercent = master.discountPercent;
      v.discountAmount = master.discountAmount;
      v.familyVersion = master.familyVersion;
      await v.save();
    }

    return this.getFamily(master._id.toString());
  }

  async getFamily(id: string): Promise<QuotationFamilyResponse> {
    const root = await this.findByIdRaw(id);
    const master = await this.resolveMaster(root);
    const variants = await this.model
      .find({ masterId: master._id })
      .sort({ organizationId: 1 })
      .exec();

    return {
      master: this.toFamilySummary(master),
      variants: variants.map((v) => this.toFamilySummary(v)),
      familyVersion: master.familyVersion ?? 1,
    };
  }

  async convertToContract(
    id: string,
    title?: string,
  ): Promise<{ quotation: QuotationDocument; contractId: string }> {
    // Use unpopulated query so organizationId / counterpartyId are raw
    // ObjectIds (populate can set them to null if the ref was deleted).
    const q = await this.findByIdRaw(id);
    this.assertConvertibleFamilyRole(q);
    if (q.status === 'converted') {
      throw new NotFoundException(`Quotation already converted`);
    }
    if (!q.counterpartyId) {
      throw new BadRequestException('Нельзя открыть договор без клиента в КП');
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
    this.assertConvertibleFamilyRole(q);
    if (q.status === 'converted') {
      throw new NotFoundException(`Quotation already converted`);
    }
    // TZ-ORDERS-301 §strip-commerce: an order may only be created from an
    // ACCEPTED proposal — draft/sent/rejected/cancelled are not convertible.
    if (q.status !== 'accepted') {
      throw new BadRequestException(
        `Cannot convert quotation in status "${q.status}" to an order — only "accepted" is convertible`,
      );
    }
    if (!q.counterpartyId) {
      throw new BadRequestException('Нельзя создать заказ без клиента в КП');
    }
    const site = await this.sites.ensureDefaultForCounterparty(
      q.counterpartyId.toString(),
      deliveryAddress,
    );
    const order = await this.orderService.create({
      counterpartyId: q.counterpartyId.toString(),
      siteId: site._id.toString(),
      quotationId: q._id.toString(),
      status: 'draft',
      deliveryAddress,
      managerId,
      items: q.items.map((i) => ({
        // COPY: FK is immutable. SNAPSHOT: name/sku survive catalog renames.
        productId: i.productId.toString(),
        productName: i.productName,
        productSku: i.productSku,
        quantity: i.quantity,
        unit: i.unit,
        // DROP: commerce (unitPrice/total/discount) is NOT copied — the
        // order carries quantity + FK + inline snapshot only. Order.total
        // stays 0 (stripped) per the strip-commerce manifest.
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
