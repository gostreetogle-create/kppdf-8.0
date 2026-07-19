import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { Organization, OrganizationDocument } from './organization.schema';

@Injectable()
export class OrganizationService {
  private readonly logger = new Logger(OrganizationService.name);

  constructor(
    @InjectModel(Organization.name) private readonly model: Model<OrganizationDocument>,
  ) {}

  async create(dto: CreateOrganizationDto): Promise<OrganizationDocument> {
    return this.model.create(dto);
  }

  async findAll(q: { page?: number; limit?: number; search?: string; type?: string } = {}) {
    const page = Math.max(1, q.page ?? 1);
    const limit = Math.min(100, Math.max(1, q.limit ?? 20));
    const filter: Record<string, unknown> = {};
    if (q.search) {
      const re = new RegExp(q.search, 'i');
      filter.$or = [{ name: re }, { shortName: re }, { inn: re }];
    }
    if (q.type) filter.type = q.type;
    const [items, total] = await Promise.all([
      this.model.find(filter).sort({ name: 1 }).skip((page - 1) * limit).limit(limit).lean().exec(),
      this.model.countDocuments(filter).exec(),
    ]);
    return { items, total, page, limit };
  }

  async findById(id: string): Promise<OrganizationDocument> {
    if (!Types.ObjectId.isValid(id)) throw new NotFoundException(`Organization ${id} not found`);
    const doc = await this.model.findById(id).exec();
    if (!doc) throw new NotFoundException(`Organization ${id} not found`);
    return doc;
  }

  async findByInn(inn: string): Promise<OrganizationDocument | null> {
    return this.model.findOne({ inn }).exec();
  }

  async update(id: string, dto: UpdateOrganizationDto): Promise<OrganizationDocument> {
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
