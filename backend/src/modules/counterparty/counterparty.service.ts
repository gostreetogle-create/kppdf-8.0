import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreateCounterpartyDto } from './dto/create-counterparty.dto';
import { UpdateCounterpartyDto } from './dto/update-counterparty.dto';
import { Counterparty, CounterpartyDocument } from './counterparty.schema';

@Injectable()
export class CounterpartyService {
  private readonly logger = new Logger(CounterpartyService.name);

  constructor(
    @InjectModel(Counterparty.name) private readonly model: Model<CounterpartyDocument>,
  ) {}

  async create(dto: CreateCounterpartyDto): Promise<CounterpartyDocument> {
    return this.model.create(dto);
  }

  async findAll(q: { page?: number; limit?: number; search?: string; role?: string } = {}) {
    const page = Math.max(1, q.page ?? 1);
    const limit = Math.min(100, Math.max(1, q.limit ?? 20));
    const filter: Record<string, unknown> = {};
    if (q.search) {
      const re = new RegExp(q.search, 'i');
      filter.$or = [{ name: re }, { shortName: re }, { inn: re }];
    }
    if (q.role) filter.roles = q.role;
    const [items, total] = await Promise.all([
      this.model.find(filter).sort({ name: 1 }).skip((page - 1) * limit).limit(limit).exec(),
      this.model.countDocuments(filter).exec(),
    ]);
    return { items, total, page, limit };
  }

  async findById(id: string): Promise<CounterpartyDocument> {
    if (!Types.ObjectId.isValid(id)) throw new NotFoundException(`Counterparty ${id} not found`);
    const doc = await this.model.findById(id).exec();
    if (!doc) throw new NotFoundException(`Counterparty ${id} not found`);
    return doc;
  }

  async findByInn(inn: string): Promise<CounterpartyDocument | null> {
    return this.model.findOne({ inn }).exec();
  }

  async update(id: string, dto: UpdateCounterpartyDto): Promise<CounterpartyDocument> {
    const doc = await this.findById(id);
    Object.assign(doc, dto);
    return doc.save();
  }

  async remove(id: string): Promise<void> {
    const doc = await this.findById(id);
    await this.model
      .updateOne({ _id: doc._id }, { $set: { deletedAt: new Date() } })
      .exec();
  }
}
