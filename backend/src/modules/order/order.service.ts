import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { randomUUID } from 'node:crypto';
import { ClientSession, Model, Types } from 'mongoose';
import {
  BoardLane,
  EstimateDayOverride,
  EstimateStartOffset,
  Order,
  OrderDocument,
  OrderItem,
} from './order.schema';
import { Shipment, ShipmentDocument } from '../shipment/shipment.schema';
import { Quotation, QuotationDocument } from '../quotation/quotation.schema';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { PatchEstimateDaysDto } from './dto/patch-estimate-days.dto';
import { PatchEstimateStartDto } from './dto/patch-estimate-start.dto';
import { CounterService } from '../counter/counter.service';
import { ReservationService } from '../reservation/reservation.service';
import { ShipmentService } from '../shipment/shipment.service';
import { SessionRunner } from '../../common/db/session-runner';
import { SiteService } from '../site/site.service';
import { OrganizationService } from '../organization/organization.service';

/** TZ-ORDERS-306: JWT-актор — нужен, чтобы понять, чья фирма выставляет КП. */
export interface OrderActor {
  organizationId?: string | null;
  role?: string;
}

const PLAN_UPDATE_KEYS = new Set(['plannedDate', 'priority', 'materialsSource']);
const PLAN_EDITABLE_FROZEN = new Set(['in_production', 'ready']);
const HARD_FROZEN = new Set(['shipped', 'delivered', 'cancelled']);
/** TZ-OPS-315 — статусы, в которых заказ МОЖЕТ быть создан (всегда через workflow). */
const CREATE_ALLOWED_STATUSES = new Set(['draft', 'confirmed']);
const ORDER_STATUS_RU: Record<string, string> = {
  draft: 'Черновик',
  confirmed: 'Подтверждён',
  in_production: 'В производстве',
  ready: 'Готов',
  shipped: 'Отгружен',
  delivered: 'Доставлен',
  cancelled: 'Отменён',
};
const MISSING_SITE_RU =
  'У заказа нет площадки (siteId) — создайте объект у контрагента';

/** TZ-COMBINE-402 — legacy OrderItem.status → boardLane (backfill only). */
const STATUS_TO_BOARD_LANE: Record<
  NonNullable<OrderItem['status']>,
  BoardLane
> = {
  pending: 'prep',
  in_production: 'shop',
  ready: 'to_ship',
  shipped: 'shipped',
};

/** TZ-COMBINE-403 — boardLane → OrderItem.status (SoT lane). */
const BOARD_LANE_TO_STATUS: Record<BoardLane, NonNullable<OrderItem['status']>> = {
  prep: 'pending',
  design: 'pending',
  shop: 'in_production',
  to_ship: 'ready',
  shipped: 'shipped',
};

const LINE_DELETE_BLOCKED_RU =
  'Нельзя удалить изделие вне колонки «Комплектация»';
const LANE_SHIPPED_PATCH_RU =
  'Колонку «Отгружены» нельзя выставить вручную — используйте действие «Отгрузить» (POST /orders/:id/ship)';

@Injectable()
export class OrderService {
  private readonly logger = new Logger(OrderService.name);

  constructor(
    @InjectModel(Order.name)
    private readonly model: Model<OrderDocument>,
    @InjectModel(Shipment.name)
    private readonly shipmentModel: Model<ShipmentDocument>,
    private readonly counter: CounterService,
    private readonly reservationService: ReservationService,
    private readonly shipmentService: ShipmentService,
    private readonly sessionRunner: SessionRunner,
    private readonly sites: SiteService,
    @InjectModel(Quotation.name)
    private readonly quotationModel: Model<QuotationDocument>,
    private readonly organizations: OrganizationService,
  ) {}

  private boardLaneFromStatus(status?: OrderItem['status']): BoardLane {
    return STATUS_TO_BOARD_LANE[status ?? 'pending'] ?? 'prep';
  }

  private statusFromBoardLane(lane: BoardLane): NonNullable<OrderItem['status']> {
    return BOARD_LANE_TO_STATUS[lane];
  }

  /**
   * TZ-COMBINE-403 / COUPLING-MAP §2 — Order.status rollup from item boardLane.
   * Never writes `shipped` (only POST ship). Monotonic: do not return to `draft`
   * after the order has left it.
   */
  rollupOrderStatus(order: OrderDocument): void {
    if (HARD_FROZEN.has(order.status)) return;
    const lanes = (order.items ?? []).map((item) => item.boardLane ?? 'prep');
    if (lanes.length === 0) return;

    if (lanes.some((lane) => lane === 'shop')) {
      order.status = 'in_production';
      return;
    }

    if (lanes.every((lane) => lane === 'to_ship')) {
      order.status = 'ready';
      return;
    }

    if (lanes.every((lane) => lane === 'prep')) {
      if (order.status === 'draft') return;
      // Monotonic: once left draft, all-prep does not go back to draft.
      order.status = 'confirmed';
      return;
    }

    // First leave prep (design / mix / partial to_ship) → confirmed.
    order.status = 'confirmed';
  }

  /** TZ-COMBINE-403 — drop trailing lines only while they remain in prep. */
  private assertTrailingLinesDeletable(
    previous: OrderItem[],
    nextLength: number,
  ): void {
    for (let index = nextLength; index < previous.length; index++) {
      const lane = previous[index]?.boardLane ?? 'prep';
      if (lane !== 'prep') {
        throw new BadRequestException(LINE_DELETE_BLOCKED_RU);
      }
    }
  }

  /**
   * TZ-COMBINE-402 — fill missing lineId / boardLane on legacy items.
   * Stable lineId: `legacy-{index}-{orderId}` (or uuid on create via mapItems).
   * Returns true if mutated.
   */
  private ensureLineBoardFields(doc: OrderDocument): boolean {
    let dirty = false;
    const orderId = doc._id?.toString() ?? 'unknown';
    const items = doc.items ?? [];
    for (let index = 0; index < items.length; index++) {
      const item = items[index];
      if (!item.lineId) {
        item.lineId = `legacy-${index}-${orderId}`;
        dirty = true;
      }
      if (!item.boardLane) {
        item.boardLane = this.boardLaneFromStatus(item.status);
        dirty = true;
      }
    }
    return dirty;
  }

  private async persistLineBoardFieldsIfNeeded(doc: OrderDocument): Promise<void> {
    if (!this.ensureLineBoardFields(doc)) return;
    doc.markModified('items');
    await doc.save();
  }

  private mapItems(
    dtoItems: CreateOrderDto['items'],
    previousItems: OrderItem[] = [],
  ): OrderItem[] {
    return dtoItems.map((i, index) => {
      const prev = previousItems[index];
      return {
        lineId: prev?.lineId ?? randomUUID(),
        boardLane: prev?.boardLane ?? 'prep',
        productId: new Types.ObjectId(i.productId),
        productName: i.productName,
        productSku: i.productSku,
        quantity: i.quantity,
        unit: i.unit,
        unitPrice: i.unitPrice ?? 0,
        total: (i.quantity ?? 0) * (i.unitPrice ?? 0),
        ownerUserId: i.ownerUserId ? new Types.ObjectId(i.ownerUserId) : undefined,
        plannedShipDate: i.plannedShipDate ? new Date(i.plannedShipDate) : undefined,
        readyForWork: i.readyForWork ?? prev?.readyForWork ?? false,
        readyAt:
          i.readyForWork === undefined
            ? prev?.readyAt
            : i.readyForWork
              ? prev?.readyAt
              : undefined,
        readyByUserId:
          i.readyForWork === undefined
            ? prev?.readyByUserId
            : i.readyForWork
              ? prev?.readyByUserId
              : undefined,
        status: prev?.status ?? 'pending',
      };
    });
  }

  async create(dto: CreateOrderDto, session?: ClientSession): Promise<OrderDocument> {
    if (dto.status !== undefined && !CREATE_ALLOWED_STATUSES.has(dto.status)) {
      const label = ORDER_STATUS_RU[dto.status] ?? dto.status;
      throw new BadRequestException(
        `Заказ нельзя создать сразу в статусе «${label}» — используйте PATCH или действия «Отгрузить»/«Отменить»`,
      );
    }
    if (!dto.siteId) {
      throw new BadRequestException('siteId is required');
    }
    await this.sites.assertBelongsTo(dto.siteId, dto.counterpartyId);

    const number = dto.number ?? (await this.counter.next('Order', 'ORD'));
    const items = this.mapItems(dto.items);
    const total = items.reduce((s, i) => s + i.total, 0);
    const doc = new this.model({
      number,
      counterpartyId: new Types.ObjectId(dto.counterpartyId),
      siteId: new Types.ObjectId(dto.siteId),
      quotationId: dto.quotationId ? new Types.ObjectId(dto.quotationId) : undefined,
      contractId: dto.contractId ? new Types.ObjectId(dto.contractId) : undefined,
      date: dto.date ? new Date(dto.date) : new Date(),
      plannedDate: dto.plannedDate ? new Date(dto.plannedDate) : undefined,
      status: dto.status ?? 'draft',
      total,
      notes: dto.notes,
      materialsSource: dto.materialsSource ?? 'own',
      deliveryAddress: dto.deliveryAddress,
      managerId: dto.managerId ? new Types.ObjectId(dto.managerId) : undefined,
      priority: dto.priority ?? 'normal',
      items,
    });
    if (session) {
      await doc.save({ session });
    } else {
      await doc.save();
    }
    return doc;
  }

  async findAll(
    counterpartyId?: string,
    status?: string,
    managerId?: string,
  ): Promise<OrderDocument[]> {
    const filter: Record<string, unknown> = {};
    if (counterpartyId) {
      if (!Types.ObjectId.isValid(counterpartyId)) return [];
      filter.counterpartyId = new Types.ObjectId(counterpartyId);
    }
    if (status) filter.status = status;
    if (managerId) {
      if (!Types.ObjectId.isValid(managerId)) return [];
      filter.managerId = new Types.ObjectId(managerId);
    }
    const docs = await this.model
      .find(filter)
      .populate('counterpartyId')
      .populate('siteId')
      .populate('quotationId')
      .populate('contractId')
      .sort({ date: -1 })
      .exec();
    for (const doc of docs) {
      await this.persistLineBoardFieldsIfNeeded(doc);
    }
    return docs;
  }

  async findById(id: string): Promise<OrderDocument> {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException(`Order ${id} not found`);
    }
    const doc = await this.model
      .findById(id)
      .populate('counterpartyId')
      .populate('siteId')
      .populate('quotationId')
      .populate('contractId')
      .populate('items.ownerUserId', 'displayName username fullName')
      .exec();
    if (!doc) throw new NotFoundException(`Order ${id} not found`);
    await this.persistLineBoardFieldsIfNeeded(doc);
    return doc;
  }

  private async findByIdRaw(id: string): Promise<OrderDocument> {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException(`Order ${id} not found`);
    }
    const doc = await this.model.findById(id).exec();
    if (!doc) throw new NotFoundException(`Order ${id} not found`);
    this.ensureLineBoardFields(doc);
    return doc;
  }

  /**
   * TZ-ORDERS-306 — КП-заглушка для прямого заказа.
   *
   * Прямой заказ (создан без КП) не имеет `quotationId`, поэтому документы и
   * печать, которым нужна ссылка на КП, для него недостижимы. Метод создаёт
   * черновик КП из позиций заказа и связывает его в обе стороны:
   * `Order.quotationId` ↔ `Quotation.sourceOrderId`.
   *
   * Идемпотентен: если у заказа уже есть КП (настоящее или заглушка), метод
   * возвращает его с `created: false` и ничего не создаёт — повторное нажатие
   * кнопки не должно плодить КП. Статус остаётся `draft`, а не `converted`:
   * никакой конвертации не было, менеджер ещё не считал цены.
   */
  async ensureStubProposal(
    id: string,
    user?: OrderActor,
  ): Promise<{ quotation: QuotationDocument; created: boolean }> {
    const order = await this.findByIdRaw(id);

    if (order.quotationId) {
      const existing = await this.quotationModel.findById(order.quotationId).exec();
      if (existing) return { quotation: existing, created: false };
      this.logger.warn(
        `Order ${order.number}: quotationId ${order.quotationId.toString()} ссылается на удалённое КП — создаю заглушку заново`,
      );
    }

    if (order.status === 'cancelled') {
      throw new BadRequestException('Отменённому заказу КП не нужно.');
    }
    if (order.items.length === 0) {
      throw new BadRequestException(
        'В заказе нет позиций — КП будет пустым. Добавьте изделия и повторите.',
      );
    }

    // Кому выставляем: организация из JWT → «наша фирма» → единственная (PARTY-301).
    const organization = await this.organizations.findCurrent(user);
    const number = await this.counter.next('Quotation', 'QTN');
    const items = order.items.map((item, index) => ({
      productId: item.productId,
      productName: item.productName,
      productSku: item.productSku,
      quantity: item.quantity,
      unit: item.unit,
      unitPrice: item.unitPrice ?? 0,
      markupPercent: 0,
      total: (item.quantity ?? 0) * (item.unitPrice ?? 0),
      sortOrder: index,
    }));
    const quotation = await this.quotationModel.create({
      number,
      organizationId: organization._id,
      counterpartyId: order.counterpartyId,
      title: `Черновик КП к заказу №${order.number}`,
      date: new Date(),
      status: 'draft',
      isStub: true,
      sourceOrderId: order._id,
      total: items.reduce((sum, i) => sum + i.total, 0),
      notes: `Заглушка: заказ №${order.number} оформлен без КП. Проверьте цены до отправки клиенту.`,
      items,
    });

    order.quotationId = quotation._id;
    await order.save();
    this.logger.log(`Order ${order.number}: создана КП-заглушка ${quotation.number}`);
    return { quotation, created: true };
  }

  async setLineReady(
    id: string,
    lineIndex: string,
    readyForWork: boolean,
    userId: string,
  ): Promise<OrderDocument> {
    const doc = await this.findByIdRaw(id);
    if (!['draft', 'confirmed'].includes(doc.status)) {
      throw new BadRequestException(`Order in status \"${doc.status}\" cannot change line readiness`);
    }
    const index = Number(lineIndex);
    if (!Number.isInteger(index) || index < 0 || index >= doc.items.length) {
      throw new NotFoundException(`Order line ${lineIndex} not found`);
    }
    if (!Types.ObjectId.isValid(userId)) {
      throw new BadRequestException('Invalid userId for line readiness');
    }
    const line = doc.items[index];
    line.readyForWork = readyForWork;
    line.readyAt = readyForWork ? new Date() : undefined;
    line.readyByUserId = readyForWork ? new Types.ObjectId(userId) : undefined;
    await doc.save();
    return this.findById(id);
  }

  /** TZ-DASHBOARD-400: изменение статуса отдельной позиции заказа */
  async setItemStatus(
    id: string,
    itemId: string,
    status: 'pending' | 'in_production' | 'ready' | 'shipped',
  ): Promise<OrderDocument> {
    const doc = await this.findByIdRaw(id);
    const index = Number(itemId);
    if (!Number.isInteger(index) || index < 0 || index >= doc.items.length) {
      throw new NotFoundException(`Order line ${itemId} not found`);
    }
    // TZ-SWEEP-401: изделие нельзя отметить отгруженным, пока заказ не отгружен
    // (ship() проставляет статусы всех линий сам). Старые линии без поля просто
    // получают реальное значение при первой записи.
    if (status === 'shipped' && doc.status !== 'shipped' && doc.status !== 'delivered') {
      throw new BadRequestException(
        'Нельзя отметить изделие отгруженным — заказ ещё не отгружен',
      );
    }
    const line = doc.items[index];
    line.status = status;
    line.boardLane = this.boardLaneFromStatus(status);
    this.rollupOrderStatus(doc);
    doc.markModified('items');
    await doc.save();
    return this.findById(id);
  }

  /**
   * TZ-COMBINE-403 — PATCH boardLane by stable lineId; derive item.status; rollup Order.status.
   */
  async patchLineBoardLane(
    id: string,
    lineId: string,
    lane: BoardLane,
  ): Promise<OrderDocument> {
    if (lane === 'shipped') {
      throw new BadRequestException(LANE_SHIPPED_PATCH_RU);
    }
    const doc = await this.findByIdRaw(id);
    if (HARD_FROZEN.has(doc.status)) {
      const label = ORDER_STATUS_RU[doc.status] ?? doc.status;
      throw new BadRequestException(`Заказ в статусе «${label}» нельзя менять`);
    }
    const line = (doc.items ?? []).find((item) => item.lineId === lineId);
    if (!line) {
      throw new NotFoundException(`Order line ${lineId} not found`);
    }
    line.boardLane = lane;
    line.status = this.statusFromBoardLane(lane);
    this.rollupOrderStatus(doc);
    doc.markModified('items');
    await doc.save();
    return this.findById(id);
  }

  /**
   * TZ-PRODUCTION-309 — upsert or clear order-level estimate days.
   * Composite key: (orderItemIndex, moduleId, workTypeId).
   * `days: null` removes the override (catalog WorkType.days applies).
   */
  async patchEstimateDays(id: string, dto: PatchEstimateDaysDto): Promise<OrderDocument> {
    const doc = await this.findByIdRaw(id);
    if (!Types.ObjectId.isValid(dto.moduleId) || !Types.ObjectId.isValid(dto.workTypeId)) {
      throw new BadRequestException('moduleId and workTypeId must be valid ObjectIds');
    }
    if (!Number.isInteger(dto.orderItemIndex) || dto.orderItemIndex < 0) {
      throw new BadRequestException('orderItemIndex must be an integer ≥ 0');
    }
    if (dto.orderItemIndex >= doc.items.length) {
      throw new NotFoundException(`Order line ${dto.orderItemIndex} not found`);
    }

    const moduleId = new Types.ObjectId(dto.moduleId);
    const workTypeId = new Types.ObjectId(dto.workTypeId);
    const overrides: EstimateDayOverride[] = [...(doc.estimateDayOverrides ?? [])];
    const matchIndex = overrides.findIndex(
      (row) =>
        row.orderItemIndex === dto.orderItemIndex &&
        row.moduleId.equals(moduleId) &&
        row.workTypeId.equals(workTypeId),
    );

    if (dto.days === null) {
      if (matchIndex >= 0) {
        overrides.splice(matchIndex, 1);
      }
    } else {
      if (!Number.isInteger(dto.days) || dto.days < 1) {
        throw new BadRequestException('days must be an integer ≥ 1, or null to clear');
      }
      const next: EstimateDayOverride = {
        orderItemIndex: dto.orderItemIndex,
        moduleId,
        workTypeId,
        days: dto.days,
      };
      if (matchIndex >= 0) {
        overrides[matchIndex] = next;
      } else {
        overrides.push(next);
      }
    }

    doc.estimateDayOverrides = overrides;
    await this.healMissingSiteId(doc);
    await doc.save();
    return this.findById(id);
  }

  /**
   * TZ-PRODUCTION-316 — upsert or clear per-bar start offset from visualAnchor.
   * Composite key: (orderItemIndex, moduleId, workTypeId).
   * `offsetDays: null` removes the override (sequential pack applies).
   */
  async patchEstimateStart(id: string, dto: PatchEstimateStartDto): Promise<OrderDocument> {
    const doc = await this.findByIdRaw(id);
    if (!Types.ObjectId.isValid(dto.moduleId) || !Types.ObjectId.isValid(dto.workTypeId)) {
      throw new BadRequestException('moduleId and workTypeId must be valid ObjectIds');
    }
    if (!Number.isInteger(dto.orderItemIndex) || dto.orderItemIndex < 0) {
      throw new BadRequestException('orderItemIndex must be an integer ≥ 0');
    }
    if (dto.orderItemIndex >= doc.items.length) {
      throw new NotFoundException(`Order line ${dto.orderItemIndex} not found`);
    }

    const moduleId = new Types.ObjectId(dto.moduleId);
    const workTypeId = new Types.ObjectId(dto.workTypeId);
    const offsets: EstimateStartOffset[] = [...(doc.estimateStartOffsets ?? [])];
    const matchIndex = offsets.findIndex(
      (row) =>
        row.orderItemIndex === dto.orderItemIndex &&
        row.moduleId.equals(moduleId) &&
        row.workTypeId.equals(workTypeId),
    );

    if (dto.offsetDays === null) {
      if (matchIndex >= 0) {
        offsets.splice(matchIndex, 1);
      }
    } else {
      if (!Number.isInteger(dto.offsetDays) || dto.offsetDays < 0) {
        throw new BadRequestException('offsetDays must be an integer ≥ 0, or null to clear');
      }
      const next: EstimateStartOffset = {
        orderItemIndex: dto.orderItemIndex,
        moduleId,
        workTypeId,
        offsetDays: dto.offsetDays,
      };
      if (matchIndex >= 0) {
        offsets[matchIndex] = next;
      } else {
        offsets.push(next);
      }
    }

    doc.estimateStartOffsets = offsets;
    await this.healMissingSiteId(doc);
    await doc.save();
    return this.findById(id);
  }

  /**
   * TZ-SWEEP-401 — единственный PATCH-граф статуса заказа.
   *
   * PATCH разрешён только между операционными статусами доски
   * (draft ↔ confirmed ↔ in_production ↔ ready; шаг назад/прыжок вперёд ок).
   * shipped/delivered/cancelled в граф НЕ входят: отгрузка — только
   * `POST /orders/:id/ship` (создаёт Shipment), отмена — `POST /orders/:id/cancel`
   * (снимает резервы). no-op того же статуса из HARD_FROZEN пропускается —
   * дальше решает freeze состава.
   */
  private assertOrderStatusTransition(from: string, to: string): void {
    if (from === to) return;
    if (HARD_FROZEN.has(to)) {
      throw new BadRequestException(
        'Отгрузка — через действие «Отгрузить»; отмена — «Отменить заказ».',
      );
    }
    if (HARD_FROZEN.has(from)) {
      const label = ORDER_STATUS_RU[from] ?? from;
      throw new BadRequestException(`Заказ в статусе «${label}» нельзя изменить через PATCH`);
    }
    const graph = new Set(['draft', 'confirmed', 'in_production', 'ready']);
    if (!graph.has(from) || !graph.has(to)) {
      throw new BadRequestException(`Недопустимый переход статуса: ${from} → ${to}`);
    }
  }

  async update(id: string, dto: UpdateOrderDto): Promise<OrderDocument> {
    const doc = await this.findByIdRaw(id);
    const definedKeys = (Object.keys(dto) as (keyof UpdateOrderDto)[]).filter(
      (key) => dto[key] !== undefined,
    );
    // TZ-SWEEP-401: переход статуса проверяется ДО freeze состава. Status-only
    // payload проходит в in_production/ready (рабочий дроп), а состав по-прежнему режется.
    if (dto.status !== undefined) {
      this.assertOrderStatusTransition(doc.status, dto.status);
    }
    if (HARD_FROZEN.has(doc.status)) {
      const blocked = definedKeys.some(
        (key) => key !== 'status' && key !== 'materialsSource',
      );
      if (blocked) {
        const label = ORDER_STATUS_RU[doc.status] ?? doc.status;
        throw new BadRequestException(`Заказ в статусе «${label}» нельзя обновлять`);
      }
    } else if (PLAN_EDITABLE_FROZEN.has(doc.status)) {
      const blocked = definedKeys.some(
        (key) => key !== 'status' && !PLAN_UPDATE_KEYS.has(key),
      );
      if (blocked) {
        const label = ORDER_STATUS_RU[doc.status] ?? doc.status;
        throw new BadRequestException(
          `Заказ в статусе «${label}» нельзя менять состав — только план/приоритет в Цехе`,
        );
      }
    }
    if (dto.notes !== undefined) doc.notes = dto.notes;
    if (dto.materialsSource !== undefined) doc.materialsSource = dto.materialsSource;
    if (dto.status !== undefined) doc.status = dto.status;
    if (dto.plannedDate !== undefined) doc.plannedDate = new Date(dto.plannedDate);
    if (dto.deliveryAddress !== undefined) doc.deliveryAddress = dto.deliveryAddress;
    if (dto.priority !== undefined) doc.priority = dto.priority;

    if (dto.siteId === undefined) {
      await this.healMissingSiteId(doc);
    }

    const nextCounterparty =
      dto.counterpartyId !== undefined
        ? dto.counterpartyId
        : doc.counterpartyId.toString();
    if (dto.counterpartyId !== undefined) {
      doc.counterpartyId = new Types.ObjectId(dto.counterpartyId);
    }
    if (dto.siteId !== undefined) {
      await this.sites.assertBelongsTo(dto.siteId, nextCounterparty);
      doc.siteId = new Types.ObjectId(dto.siteId);
    } else if (dto.counterpartyId !== undefined) {
      await this.sites.assertBelongsTo(doc.siteId.toString(), nextCounterparty);
    }
    if (dto.items !== undefined) {
      this.assertTrailingLinesDeletable(doc.items ?? [], dto.items.length);
      doc.items = this.mapItems(dto.items, doc.items);
      doc.total = doc.items.reduce((s, i) => s + i.total, 0);
    }
    return doc.save();
  }

  /** TZ-PRODUCTION-331 — legacy orders without siteId fail mongoose required on any save. */
  private async healMissingSiteId(doc: OrderDocument): Promise<void> {
    if (doc.siteId) return;
    const counterpartyId = doc.counterpartyId?.toString();
    if (!counterpartyId || !Types.ObjectId.isValid(counterpartyId)) {
      throw new BadRequestException(MISSING_SITE_RU);
    }
    const sites = await this.sites.findByCounterparty(counterpartyId);
    const first = sites[0];
    if (!first?._id) {
      throw new BadRequestException(MISSING_SITE_RU);
    }
    doc.siteId = first._id;
  }

  async reserveStock(
    id: string,
    warehouseId: string,
    zoneName?: string,
  ): Promise<{ order: OrderDocument; reservationIds: string[] }> {
    return this.sessionRunner.run(async (session) => {
      const order = await this.model.findById(id).session(session).exec();
      if (!order) throw new NotFoundException(`Order ${id} not found`);
      const reservationIds: string[] = [];
      for (const item of order.items) {
        const reservation = await this.reservationService.create(
          {
            orderId: order.number,
            productId: item.productId.toString(),
            warehouseId,
            qty: item.quantity,
            zoneName,
          },
          session,
        );
        reservationIds.push(reservation._id.toString());
      }
      order.reservationIds = [
        ...(order.reservationIds ?? []),
        ...reservationIds.map((rid) => new Types.ObjectId(rid)),
      ];
      order.status = 'confirmed';
      await order.save({ session });
      return { order, reservationIds };
    });
  }

  async ship(
    id: string,
    recipient?: string,
    address?: string,
    warehouseId?: string,
    driverInfo?: string,
  ): Promise<{ order: OrderDocument; shipmentId: string }> {
    // Z-001: shipment creation + order.status update must be atomic.
    return this.sessionRunner.run(async (session) => {
      const order = await this.model.findById(id).session(session).exec();
      if (!order) throw new NotFoundException(`Order ${id} not found`);
      if (
        order.status === 'cancelled' ||
        order.status === 'shipped' ||
        order.status === 'delivered'
      ) {
        throw new NotFoundException(`Cannot ship order in status ${order.status}`);
      }
      const [shipment] = await this.shipmentModel.create(
        [
          {
            number: `SHP-${order.number}`,
            orderId: order._id,
            counterpartyId: order.counterpartyId,
            recipient,
            address,
            warehouseId: warehouseId ? new Types.ObjectId(warehouseId) : undefined,
            driverInfo,
            status: 'scheduled',
            items: order.items.map((i) => ({
              productId: i.productId,
              productName: i.productName,
              quantity: i.quantity,
              unit: i.unit,
            })),
          },
        ],
        { session },
      );
      if (!shipment) throw new NotFoundException('Shipment create failed');
      order.shipmentIds = [
        ...(order.shipmentIds ?? []),
        new Types.ObjectId(shipment._id.toString()),
      ];
      order.status = 'shipped';
      // TZ-SWEEP-401: отгрузка заказа = отгрузка всех линий (item.status — ход
      // изделия; readyForWork не трогаем). Старые линии без поля получают значение.
      for (let i = 0; i < order.items.length; i++) {
        const item = order.items[i];
        item.status = 'shipped';
        item.boardLane = 'shipped';
        if (!item.lineId) {
          item.lineId = `legacy-${i}-${order._id.toString()}`;
        }
      }
      const saved = await order.save({ session });
      return { order: saved, shipmentId: shipment._id.toString() };
    });
  }

  async cancel(id: string): Promise<OrderDocument> {
    return this.sessionRunner.run(async (session) => {
      const order = await this.model.findById(id).session(session).exec();
      if (!order) throw new NotFoundException(`Order ${id} not found`);
      const failures: string[] = [];
      for (const rid of order.reservationIds ?? []) {
        try {
          await this.reservationService.release(rid.toString());
        } catch (e) {
          const msg = (e as Error).message ?? String(e);
          this.logger.warn(`Reservation ${rid} release on cancel failed: ${msg}`);
          failures.push(rid.toString());
        }
      }
      if (failures.length > 0) {
        this.logger.error(
          `Cancel failed: ${failures.length} reservation(s) could not be released — rolling back`,
        );
        throw new Error(
          `Cancel aborted; reservation release failures: ${failures.join(', ')}`,
        );
      }
      order.status = 'cancelled';
      await order.save({ session });
      return order;
    });
  }

  async remove(id: string): Promise<void> {
    const doc = await this.findById(id);
    await this.model
      .updateOne({ _id: doc._id }, { $set: { deletedAt: new Date() } })
      .exec();
  }
}
