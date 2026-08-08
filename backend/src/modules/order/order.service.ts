import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ClientSession, Model, Types } from 'mongoose';
import { Order, OrderDocument, OrderItem } from './order.schema';
import { Shipment, ShipmentDocument } from '../shipment/shipment.schema';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { CounterService } from '../counter/counter.service';
import { ReservationService } from '../reservation/reservation.service';
import { ShipmentService } from '../shipment/shipment.service';
import { SessionRunner } from '../../common/db/session-runner';
import { SiteService } from '../site/site.service';

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
  ) {}

  private mapItems(
    dtoItems: CreateOrderDto['items'],
    previousItems: OrderItem[] = [],
  ): OrderItem[] {
    return dtoItems.map((i, index) => ({
      productId: new Types.ObjectId(i.productId),
      productName: i.productName,
      productSku: i.productSku,
      quantity: i.quantity,
      unit: i.unit,
      unitPrice: i.unitPrice ?? 0,
      total: (i.quantity ?? 0) * (i.unitPrice ?? 0),
      ownerUserId: i.ownerUserId ? new Types.ObjectId(i.ownerUserId) : undefined,
      plannedShipDate: i.plannedShipDate ? new Date(i.plannedShipDate) : undefined,
      readyForWork: i.readyForWork ?? previousItems[index]?.readyForWork ?? false,
      readyAt:
        i.readyForWork === undefined
          ? previousItems[index]?.readyAt
          : i.readyForWork
            ? previousItems[index]?.readyAt
            : undefined,
      readyByUserId:
        i.readyForWork === undefined
          ? previousItems[index]?.readyByUserId
          : i.readyForWork
            ? previousItems[index]?.readyByUserId
            : undefined,
    }));
  }

  async create(dto: CreateOrderDto, session?: ClientSession): Promise<OrderDocument> {
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
    return this.model
      .find(filter)
      .populate('counterpartyId')
      .populate('siteId')
      .populate('quotationId')
      .populate('contractId')
      .sort({ date: -1 })
      .exec();
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
    return doc;
  }

  private async findByIdRaw(id: string): Promise<OrderDocument> {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException(`Order ${id} not found`);
    }
    const doc = await this.model.findById(id).exec();
    if (!doc) throw new NotFoundException(`Order ${id} not found`);
    return doc;
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

  async update(id: string, dto: UpdateOrderDto): Promise<OrderDocument> {
    const doc = await this.findByIdRaw(id);
    if (
      doc.status === 'in_production' ||
      doc.status === 'ready' ||
      doc.status === 'shipped' ||
      doc.status === 'delivered' ||
      doc.status === 'cancelled'
    ) {
      throw new BadRequestException(
        `Order in status "${doc.status}" cannot be updated — only draft/confirmed orders are editable`,
      );
    }
    if (dto.notes !== undefined) doc.notes = dto.notes;
    if (dto.status !== undefined) doc.status = dto.status;
    if (dto.plannedDate !== undefined) doc.plannedDate = new Date(dto.plannedDate);
    if (dto.deliveryAddress !== undefined) doc.deliveryAddress = dto.deliveryAddress;
    if (dto.priority !== undefined) doc.priority = dto.priority;

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
      doc.items = this.mapItems(dto.items, doc.items);
      doc.total = doc.items.reduce((s, i) => s + i.total, 0);
    }
    return doc.save();
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
