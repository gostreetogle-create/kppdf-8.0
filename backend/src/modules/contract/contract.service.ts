import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Contract, ContractDocument, ContractItem } from './contract.schema';
import { CreateContractDto } from './dto/create-contract.dto';
import { UpdateContractDto } from './dto/update-contract.dto';
import { CounterService } from '../counter/counter.service';
import { OrderService } from '../order/order.service';
import { SessionRunner } from '../../common/db/session-runner';

@Injectable()
export class ContractService {
  constructor(
    @InjectModel(Contract.name)
    private readonly model: Model<ContractDocument>,
    private readonly counter: CounterService,
    private readonly orderService: OrderService,
    private readonly sessionRunner: SessionRunner,
  ) {}

  async create(dto: CreateContractDto): Promise<ContractDocument> {
    const number = dto.number ?? (await this.counter.next('Contract', 'CTR'));
    const items: ContractItem[] = dto.items.map((i) => ({
      productId: new Types.ObjectId(i.productId),
      productName: i.productName,
      quantity: i.quantity,
      unit: i.unit,
      unitPrice: i.unitPrice,
      total: (i.quantity ?? 0) * (i.unitPrice ?? 0),
    }));
    const totalAmount = items.reduce((s, i) => s + i.total, 0);
    return this.model.create({
      number,
      title: dto.title,
      proposalId: dto.proposalId ? new Types.ObjectId(dto.proposalId) : undefined,
      organizationId: new Types.ObjectId(dto.organizationId),
      customerId: new Types.ObjectId(dto.customerId),
      status: dto.status ?? 'draft',
      items,
      notes: dto.notes,
      totalAmount,
      expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : undefined,
      packageTag: dto.packageTag,
    });
  }

  async findAll(
    customerId?: string,
    status?: string,
    from?: Date,
    to?: Date,
  ): Promise<(Contract & { _id: Types.ObjectId })[]> {
    const filter: Record<string, unknown> = {};
    if (customerId) {
      if (!Types.ObjectId.isValid(customerId)) return [];
      filter.customerId = new Types.ObjectId(customerId);
    }
    if (status) filter.status = status;
    if (from || to) {
      const range: Record<string, Date> = {};
      if (from) range.$gte = from;
      if (to) range.$lte = to;
      filter.createdAt = range;
    }
    return this.model
      .find(filter)
      .populate('customerId')
      .populate('organizationId')
      .populate('proposalId')
      .sort({ createdAt: -1 })
      .lean()
      .exec();
  }

  async findById(id: string): Promise<ContractDocument> {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException(`Contract ${id} not found`);
    }
    const doc = await this.model
      .findById(id)
      .populate('customerId')
      .populate('organizationId')
      .populate('proposalId')
      .exec();
    if (!doc) throw new NotFoundException(`Contract ${id} not found`);
    return doc;
  }

  /** Find by ID without populate — returns raw ObjectIds for refs. */
  private async findByIdRaw(id: string): Promise<ContractDocument> {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException(`Contract ${id} not found`);
    }
    const doc = await this.model.findById(id).exec();
    if (!doc) throw new NotFoundException(`Contract ${id} not found`);
    return doc;
  }

  async update(id: string, dto: UpdateContractDto): Promise<ContractDocument> {
    const doc = await this.findById(id);
    if (dto.title !== undefined) doc.title = dto.title;
    if (dto.notes !== undefined) doc.notes = dto.notes;
    if (dto.status !== undefined) doc.status = dto.status;
    if (dto.expiresAt !== undefined) doc.expiresAt = new Date(dto.expiresAt);
    if (dto.packageTag !== undefined) doc.packageTag = dto.packageTag;
    if (dto.items !== undefined) {
      doc.items = dto.items.map((i) => ({
        productId: new Types.ObjectId(i.productId),
        productName: i.productName,
        quantity: i.quantity,
        unit: i.unit,
        unitPrice: i.unitPrice,
        total: (i.quantity ?? 0) * (i.unitPrice ?? 0),
      }));
      doc.totalAmount = doc.items.reduce((s, i) => s + i.total, 0);
    }
    return doc.save();
  }

  async sign(id: string, signedAt: string): Promise<ContractDocument> {
    const doc = await this.findById(id);
    doc.status = 'signed';
    doc.signedAt = new Date(signedAt);
    return doc.save();
  }

  async activate(id: string): Promise<{ contract: ContractDocument; orderId: string }> {
    return this.sessionRunner.run(async (session) => {
      const doc = await this.model.findById(id).session(session).exec();
      if (!doc) throw new NotFoundException(`Contract ${id} not found`);
      if (doc.status !== 'signed') {
        throw new NotFoundException(`Contract must be signed first (current: ${doc.status})`);
      }
      const order = await this.orderService.create(
        {
          counterpartyId: doc.customerId.toString(),
          contractId: doc._id.toString(),
          status: 'confirmed',
          items: doc.items.map((i) => ({
            productId: i.productId.toString(),
            productName: i.productName,
            quantity: i.quantity,
            unit: i.unit,
            unitPrice: i.unitPrice,
          })),
        },
        session,
      );
      doc.status = 'active';
      await doc.save({ session });
      return { contract: doc, orderId: order._id.toString() };
    });
  }

  async remove(id: string): Promise<void> {
    const doc = await this.findById(id);
    await this.model
      .updateOne({ _id: doc._id }, { $set: { deletedAt: new Date() } })
      .exec();
  }
}
