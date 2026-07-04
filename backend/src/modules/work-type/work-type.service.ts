import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { WorkType, WorkTypeDocument } from './work-type.schema';
import { CreateWorkTypeDto } from './dto/create-work-type.dto';
import { UpdateWorkTypeDto } from './dto/update-work-type.dto';

@Injectable()
export class WorkTypeService {
  constructor(
    @InjectModel(WorkType.name)
    private readonly model: Model<WorkTypeDocument>,
  ) {}

  async create(dto: CreateWorkTypeDto): Promise<WorkTypeDocument> {
    return this.model.create({
      ...dto,
      workCenterId: dto.workCenterId ? new Types.ObjectId(dto.workCenterId) : undefined,
    });
  }

  async findAll(workCenterId?: string): Promise<WorkTypeDocument[]> {
    const filter: Record<string, unknown> = {};
    if (workCenterId) {
      if (!Types.ObjectId.isValid(workCenterId)) return [];
      filter.workCenterId = new Types.ObjectId(workCenterId);
    }
    return this.model.find(filter).sort({ name: 1 }).exec();
  }

  async findById(id: string): Promise<WorkTypeDocument> {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException(`WorkType ${id} not found`);
    }
    const doc = await this.model.findById(id).exec();
    if (!doc) throw new NotFoundException(`WorkType ${id} not found`);
    return doc;
  }

  async update(id: string, dto: UpdateWorkTypeDto): Promise<WorkTypeDocument> {
    const doc = await this.findById(id);
    if (dto.name !== undefined) doc.name = dto.name;
    if (dto.section !== undefined) doc.section = dto.section;
    if (dto.description !== undefined) doc.description = dto.description;
    if (dto.isActive !== undefined) doc.isActive = dto.isActive;
    if (dto.department !== undefined) doc.department = dto.department;
    if (dto.defaultDurationHours !== undefined) doc.defaultDurationHours = dto.defaultDurationHours;
    if (dto.hourlyRate !== undefined) doc.hourlyRate = dto.hourlyRate;
    if (dto.workCenterId !== undefined) {
      doc.workCenterId = dto.workCenterId ? new Types.ObjectId(dto.workCenterId) : (undefined as unknown as Types.ObjectId);
    }
    return doc.save();
  }

  async remove(id: string): Promise<void> {
    const doc = await this.findById(id);
    await this.model
      .updateOne({ _id: doc._id }, { $set: { deletedAt: new Date() } })
      .exec();
  }
}
