import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreateCounterpartyDto } from './dto/create-counterparty.dto';
import { UpdateCounterpartyDto } from './dto/update-counterparty.dto';
import { QuickCreatePartyDto } from './dto/quick-create-party.dto';
import { Counterparty, CounterpartyDocument } from './counterparty.schema';
import { SiteService } from '../site/site.service';
import { SiteDocument } from '../site/site.schema';

/** Valid 10-digit INN stub with FNS checksum (unique enough for quick-create). */
export function generateQuickInnStub(): string {
  const w = [2, 4, 10, 3, 5, 9, 4, 6, 8];
  const base = String(Date.now()).slice(-9).padStart(9, '0');
  let s = 0;
  for (let i = 0; i < 9; i++) s += Number(base[i]) * w[i]!;
  const check = (s % 11) % 10;
  return `${base}${check}`;
}

@Injectable()
export class CounterpartyService {
  private readonly logger = new Logger(CounterpartyService.name);

  constructor(
    @InjectModel(Counterparty.name) private readonly model: Model<CounterpartyDocument>,
    private readonly sites: SiteService,
  ) {}

  async create(dto: CreateCounterpartyDto): Promise<CounterpartyDocument> {
    return this.model.create(dto);
  }

  /**
   * TZ-ORDERS-303: имя+тел+адрес → Counterparty + Site.
   */
  async quickCreateParty(
    dto: QuickCreatePartyDto,
  ): Promise<{ counterparty: CounterpartyDocument; site: SiteDocument }> {
    let inn = generateQuickInnStub();
    for (let attempt = 0; attempt < 5; attempt++) {
      const clash = await this.model.findOne({ inn }).exec();
      if (!clash) break;
      inn = generateQuickInnStub();
    }
    const counterparty = await this.model.create({
      name: dto.name.trim(),
      phone: dto.phone?.trim() || undefined,
      roles: ['customer'],
      inn,
      isActive: true,
    });
    const site = await this.sites.create({
      counterpartyId: counterparty._id.toString(),
      name: (dto.siteName ?? 'Объект').trim() || 'Объект',
      address: dto.address.trim(),
    });
    return { counterparty, site };
  }

  async findAll(
    q: { page?: number; limit?: number; search?: string; role?: string } = {},
    user?: { organizationId?: string | null; role?: string },
  ) {
    const page = Math.max(1, q.page ?? 1);
    const limit = Math.min(100, Math.max(1, q.limit ?? 20));
    const filter: Record<string, unknown> = { deletedAt: null };

    if (user?.organizationId) {
      filter.$or = [
        { organizationId: new Types.ObjectId(user.organizationId) },
        { organizationId: null, isSystem: true },
        { organizationId: { $exists: false } },
      ];
    }

    if (q.search) {
      const escaped = q.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const re = new RegExp(escaped, 'i');
      const searchCond = {
        $or: [{ name: re }, { shortName: re }, { inn: re }, { phone: re }],
      };
      if (filter.$or) {
        filter.$or = (filter.$or as Record<string, unknown>[]).map((cond) => ({
          ...cond,
          ...searchCond,
        }));
      } else {
        filter.$or = [searchCond];
      }
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
