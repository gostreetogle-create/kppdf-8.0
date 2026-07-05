import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateCurrencyDto } from './dto/create-currency.dto';
import { UpdateCurrencyDto } from './dto/update-currency.dto';
import { Currency, CurrencyDocument } from './currency.schema';

@Injectable()
export class CurrencyService {
  private readonly logger = new Logger(CurrencyService.name);

  constructor(
    @InjectModel(Currency.name)
    private readonly model: Model<CurrencyDocument>,
  ) {}

  async findAll(q: {
    page?: number;
    limit?: number;
    search?: string;
    isActive?: boolean;
  } = {}) {
    const page = Math.max(1, q.page ?? 1);
    const limit = Math.min(100, Math.max(1, q.limit ?? 20));
    const filter: Record<string, unknown> = {};
    if (q.search) {
      const re = new RegExp(q.search, 'i');
      filter.$or = [{ code: re }, { label: re }, { symbol: re }];
    }
    if (q.isActive !== undefined) filter.isActive = q.isActive;
    const [items, total] = await Promise.all([
      this.model
        .find(filter)
        .sort({ sortOrder: 1, code: 1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .exec(),
      this.model.countDocuments(filter).exec(),
    ]);
    return { items, total, page, limit };
  }

  async findActive(): Promise<CurrencyDocument[]> {
    return this.model
      .find({ isActive: true })
      .sort({ sortOrder: 1, code: 1 })
      .exec();
  }

  async findByCode(code: string): Promise<CurrencyDocument> {
    const doc = await this.model.findOne({ code }).exec();
    if (!doc) throw new NotFoundException(`Currency "${code}" not found`);
    return doc;
  }

  async create(dto: CreateCurrencyDto): Promise<CurrencyDocument> {
    const exists = await this.model.findOne({ code: dto.code }).exec();
    if (exists) {
      throw new BadRequestException(`Currency "${dto.code}" already exists`);
    }
    const doc = await this.model.create({
      ...dto,
      isActive: dto.isActive ?? true,
      isSystem: dto.isSystem ?? false,
      sortOrder: dto.sortOrder ?? 0,
    });
    this.logger.log(`Currency created: ${doc.code}`);
    return doc;
  }

  async update(code: string, dto: UpdateCurrencyDto): Promise<CurrencyDocument> {
    const doc = await this.findByCode(code);
    Object.assign(doc, dto);
    return doc.save();
  }

  async remove(code: string): Promise<void> {
    const doc = await this.findByCode(code);
    if (doc.isSystem) {
      throw new BadRequestException(
        `System currency "${code}" cannot be deleted — deactivate it instead`,
      );
    }
    await this.model
      .updateOne({ _id: doc._id }, { $set: { deletedAt: new Date() } })
      .exec();
    this.logger.log(`Currency soft-deleted: ${code}`);
  }
}
