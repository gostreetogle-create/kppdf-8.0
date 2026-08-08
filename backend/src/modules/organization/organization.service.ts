import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { Organization, OrganizationDocument } from './organization.schema';

/** Tenant context taken from the JWT, never from the request body. */
export interface OrganizationActor {
  organizationId?: string | null;
  role?: string;
}

@Injectable()
export class OrganizationService {
  private readonly logger = new Logger(OrganizationService.name);

  constructor(
    @InjectModel(Organization.name) private readonly model: Model<OrganizationDocument>,
  ) {}

  async create(dto: CreateOrganizationDto): Promise<OrganizationDocument> {
    return this.model.create({ ...dto, deletedAt: null });
  }

  /**
   * TZ-PARTY-301: a user bound to an organization sees only that organization
   * (single-org policy). Users without a binding still see the full list so
   * bootstrap/admin flows keep working.
   */
  async findAll(
    q: { page?: number; limit?: number; search?: string; type?: string } = {},
    user?: OrganizationActor,
  ) {
    const page = Math.max(1, q.page ?? 1);
    const limit = Math.min(100, Math.max(1, q.limit ?? 20));
    const filter: Record<string, unknown> = { deletedAt: null };
    if (user?.organizationId) filter._id = new Types.ObjectId(user.organizationId);
    if (q.search) {
      const escaped = q.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const re = new RegExp(escaped, 'i');
      filter.$or = [{ name: re }, { shortName: re }, { inn: re }];
    }
    if (q.type) filter.type = q.type;
    const [items, total] = await Promise.all([
      this.model.find(filter).sort({ name: 1 }).skip((page - 1) * limit).limit(limit).lean().exec(),
      this.model.countDocuments(filter).exec(),
    ]);
    return { items, total, page, limit };
  }

  /**
   * TZ-PARTY-301: another tenant's organization is indistinguishable from a
   * missing one (404, never 403) — that is what closes the IDOR.
   */
  async findById(id: string, user?: OrganizationActor): Promise<OrganizationDocument> {
    if (!Types.ObjectId.isValid(id)) throw new NotFoundException(`Organization ${id} not found`);
    if (user?.organizationId && user.organizationId !== id) {
      throw new NotFoundException(`Organization ${id} not found`);
    }
    const doc = await this.model.findOne({ _id: id, deletedAt: null }).exec();
    if (!doc) throw new NotFoundException(`Organization ${id} not found`);
    return doc;
  }

  /**
   * TZ-PARTY-301: «наша фирма» for document headers. Resolution order:
   * the user's own organization → the one flagged `isOurCompany` → the only
   * organization in the instance. Anything else is a setup gap, not a guess.
   */
  async findCurrent(user?: OrganizationActor): Promise<OrganizationDocument> {
    if (user?.organizationId) return this.findById(user.organizationId, user);

    const flagged = await this.model.findOne({ isOurCompany: true, deletedAt: null }).exec();
    if (flagged) return flagged;

    const alive = await this.model.find({ deletedAt: null }).limit(2).exec();
    if (alive.length === 1) return alive[0]!;

    throw new NotFoundException(
      'Наша организация не настроена: отметьте одну организацию как «наша фирма».',
    );
  }

  async findByInn(inn: string): Promise<OrganizationDocument | null> {
    return this.model.findOne({ inn, deletedAt: null }).exec();
  }

  async update(
    id: string,
    dto: UpdateOrganizationDto,
    user?: OrganizationActor,
  ): Promise<OrganizationDocument> {
    const doc = await this.findById(id, user);
    Object.assign(doc, dto);
    return doc.save();
  }

  async remove(id: string, user?: OrganizationActor): Promise<void> {
    const doc = await this.findById(id, user);
    await this.model
      .updateOne({ _id: doc._id }, { $set: { deletedAt: new Date() } })
      .exec();
  }
}
