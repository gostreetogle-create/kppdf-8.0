import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ClientSession, Model, Types } from 'mongoose';
import { Order, OrderDocument, OrderItem } from './order.schema';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { CounterService } from '../counter/counter.service';
import { ReservationService } from '../reservation/reservation.service';
import { ShipmentService } from '../shipment/shipment.service';
import { SessionRunner } from '../../common/db/session-runner';

@Injectable()
export class OrderService {
  private readonly logger = new Logger(OrderService.name);

  constructor(
    @InjectModel(Order.name)
    private readonly model: Model<OrderDocument>,
    private readonly counter: CounterService,
    private readonly reservationService: ReservationService,
    private readonly shipmentService: ShipmentService,
    private readonly sessionRunner: SessionRunner,
  ) {}

  async create(dto: CreateOrderDto, session?: ClientSession): Promise<OrderDocument> {
    const number = dto.number ?? (await this.counter.next('Order', 'ORD'));
    const items: OrderItem[] = dto.items.map((i) => ({
      productId: new Types.ObjectId(i.productId),
      productName: i.productName,
      productSku: i.productSku,
      quantity: i.quantity,
      unit: i.unit,
      unitPrice: i.unitPrice,
      total: (i.quantity ?? 0) * (i.unitPrice ?? 0),
    }));
    const total = items.reduce((s, i) => s + i.total, 0);
    const doc = new this.model({
      number,
      counterpartyId: new Types.ObjectId(dto.counterpartyId),
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
      .populate('quotationId')
      .populate('contractId')
      .exec();
    if (!doc) throw new NotFoundException(`Order ${id} not found`);
    return doc;
  }

  /** Find by ID without populate — returns raw ObjectIds for refs. */
  private async findByIdRaw(id: string): Promise<OrderDocument> {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException(`Order ${id} not found`);
    }
    const doc = await this.model.findById(id).exec();
    if (!doc) throw new NotFoundException(`Order ${id} not found`);
    return doc;
  }

  async update(id: string, dto: UpdateOrderDto): Promise<OrderDocument> {
    const doc = await this.findById(id);
    if (dto.notes !== undefined) doc.notes = dto.notes;
    if (dto.status !== undefined) doc.status = dto.status;
    if (dto.plannedDate !== undefined) doc.plannedDate = new Date(dto.plannedDate);
    if (dto.deliveryAddress !== undefined) doc.deliveryAddress = dto.deliveryAddress;
    if (dto.priority !== undefined) doc.priority = dto.priority;
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
    // Use unpopulated query so counterpartyId is a raw ObjectId.
    const order = await this.findByIdRaw(id);
    if (order.status === 'cancelled' || order.status === 'shipped' || order.status === 'delivered') {
      throw new NotFoundException(`Cannot ship order in status ${order.status}`);
    }
    const shipment = await this.shipmentService.create({
      orderId: order._id.toString(),
      counterpartyId: order.counterpartyId.toString(),
      recipient,
      address,
      warehouseId,
      driverInfo,
      status: 'scheduled',
      items: order.items.map((i) => ({
        productId: i.productId.toString(),
        productName: i.productName,
        quantity: i.quantity,
        unit: i.unit,
      })),
    });
    order.shipmentIds = [
      ...(order.shipmentIds ?? []),
      new Types.ObjectId(shipment._id.toString()),
    ];
    order.status = 'shipped';
    await order.save();
    return { order, shipmentId: shipment._id.toString() };
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
