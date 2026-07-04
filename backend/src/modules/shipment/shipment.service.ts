import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Shipment, ShipmentDocument, ShipmentItem, ShippingDoc } from './shipment.schema';
import { CreateShipmentDto } from './dto/create-shipment.dto';
import { UpdateShipmentDto } from './dto/update-shipment.dto';
import { AddDocDto } from './dto/add-doc.dto';
import { CounterService } from '../counter/counter.service';
import { StockMovementService } from '../stock-movement/stock-movement.service';
import { ReservationService } from '../reservation/reservation.service';

@Injectable()
export class ShipmentService {
  constructor(
    @InjectModel(Shipment.name)
    private readonly model: Model<ShipmentDocument>,
    private readonly counter: CounterService,
    private readonly stockMovementService: StockMovementService,
    private readonly reservationService: ReservationService,
  ) {}

  async create(dto: CreateShipmentDto): Promise<ShipmentDocument> {
    const number = dto.number ?? (await this.counter.next('Shipment', 'SHP'));
    const items: ShipmentItem[] = dto.items.map((i) => ({
      productId: new Types.ObjectId(i.productId),
      productName: i.productName,
      quantity: i.quantity,
      unit: i.unit,
    }));
    return this.model.create({
      number,
      orderId: new Types.ObjectId(dto.orderId),
      counterpartyId: new Types.ObjectId(dto.counterpartyId),
      date: dto.date ? new Date(dto.date) : new Date(),
      recipient: dto.recipient,
      address: dto.address,
      status: dto.status ?? 'draft',
      driverInfo: dto.driverInfo,
      warehouseId: dto.warehouseId ? new Types.ObjectId(dto.warehouseId) : undefined,
      notes: dto.notes,
      items,
    });
  }

  async findAll(
    orderId?: string,
    status?: string,
    date?: Date,
  ): Promise<ShipmentDocument[]> {
    const filter: Record<string, unknown> = {};
    if (orderId) {
      if (!Types.ObjectId.isValid(orderId)) return [];
      filter.orderId = new Types.ObjectId(orderId);
    }
    if (status) filter.status = status;
    if (date) {
      const dayStart = new Date(date);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(date);
      dayEnd.setHours(23, 59, 59, 999);
      filter.date = { $gte: dayStart, $lte: dayEnd };
    }
    return this.model
      .find(filter)
      .populate('orderId')
      .populate('counterpartyId')
      .sort({ date: -1 })
      .exec();
  }

  async findById(id: string): Promise<ShipmentDocument> {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException(`Shipment ${id} not found`);
    }
    const doc = await this.model
      .findById(id)
      .populate('orderId')
      .populate('counterpartyId')
      .exec();
    if (!doc) throw new NotFoundException(`Shipment ${id} not found`);
    return doc;
  }

  async update(id: string, dto: UpdateShipmentDto): Promise<ShipmentDocument> {
    const doc = await this.findById(id);
    if (dto.recipient !== undefined) doc.recipient = dto.recipient;
    if (dto.address !== undefined) doc.address = dto.address;
    if (dto.status !== undefined) doc.status = dto.status;
    if (dto.driverInfo !== undefined) doc.driverInfo = dto.driverInfo;
    if (dto.notes !== undefined) doc.notes = dto.notes;
    if (dto.warehouseId !== undefined) {
      doc.warehouseId = dto.warehouseId
        ? new Types.ObjectId(dto.warehouseId)
        : (undefined as unknown as Types.ObjectId);
    }
    return doc.save();
  }

  async dispatch(id: string): Promise<ShipmentDocument> {
    const doc = await this.findById(id);
    if (!doc.warehouseId) {
      throw new NotFoundException(`Shipment has no warehouseId; cannot dispatch`);
    }
    if (doc.status === 'in_transit' || doc.status === 'delivered') {
      throw new NotFoundException(`Shipment already ${doc.status}`);
    }
    for (const item of doc.items) {
      await this.stockMovementService.create({
        type: 'out',
        productId: item.productId.toString(),
        warehouseId: doc.warehouseId.toString(),
        qty: item.quantity,
        orderId: doc.orderId.toString(),
        documentRef: `SHP:${doc.number}`,
      });
    }
    // Release any active reservations for this order
    const reservations = await this.reservationService.findAll(doc.orderId.toString());
    for (const r of reservations) {
      if (r.status === 'active') {
        try {
          await this.reservationService.fulfill(r._id.toString());
        } catch {
          // best-effort
        }
      }
    }
    doc.status = 'in_transit';
    doc.dispatchedAt = new Date();
    return doc.save();
  }

  async addDoc(id: string, dto: AddDocDto): Promise<ShipmentDocument> {
    const doc = await this.findById(id);
    const docEntry: ShippingDoc = {
      number: dto.number ?? `${doc.number}-${(doc.docs?.length ?? 0) + 1}`,
      date: dto.date ? new Date(dto.date) : new Date(),
      type: dto.type,
      totalAmount: dto.totalAmount,
      signatures: dto.signatures ?? [],
      pdfUrl: dto.pdfUrl,
      notes: dto.notes,
    };
    doc.docs = [...(doc.docs ?? []), docEntry];
    return doc.save();
  }

  async remove(id: string): Promise<void> {
    const doc = await this.findById(id);
    await this.model
      .updateOne({ _id: doc._id }, { $set: { deletedAt: new Date() } })
      .exec();
  }
}
