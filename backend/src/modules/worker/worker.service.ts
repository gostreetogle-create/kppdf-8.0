import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Worker, WorkerDocument } from './worker.schema';
import { CreateWorkerDto } from './dto/create-worker.dto';
import { UpdateWorkerDto } from './dto/update-worker.dto';

@Injectable()
export class WorkerService {
  constructor(
    @InjectModel(Worker.name)
    private readonly model: Model<WorkerDocument>,
  ) {}

  async create(dto: CreateWorkerDto): Promise<WorkerDocument> {
    return this.model.create({
      ...dto,
      workTypeIds: (dto.workTypeIds ?? []).map((id) => new Types.ObjectId(id)),
      personId: dto.personId ? new Types.ObjectId(dto.personId) : undefined,
      isActive: dto.isActive ?? true,
    });
  }

  async findAll(
    workTypeId?: string,
    isActive?: boolean,
  ): Promise<WorkerDocument[]> {
    const filter: Record<string, unknown> = {};
    if (typeof isActive === 'boolean') filter.isActive = isActive;
    if (workTypeId) {
      if (!Types.ObjectId.isValid(workTypeId)) return [];
      filter.workTypeIds = new Types.ObjectId(workTypeId);
    }
    return this.model.find(filter).sort({ lastName: 1, firstName: 1 }).exec();
  }

  async findById(id: string): Promise<WorkerDocument> {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException(`Worker ${id} not found`);
    }
    const doc = await this.model.findById(id).exec();
    if (!doc) throw new NotFoundException(`Worker ${id} not found`);
    return doc;
  }

  async update(id: string, dto: UpdateWorkerDto): Promise<WorkerDocument> {
    const doc = await this.findById(id);
    if (dto.lastName !== undefined) doc.lastName = dto.lastName;
    if (dto.firstName !== undefined) doc.firstName = dto.firstName;
    if (dto.patronymic !== undefined) doc.patronymic = dto.patronymic;
    if (dto.grade !== undefined) doc.grade = dto.grade;
    if (dto.ratePerHour !== undefined) doc.ratePerHour = dto.ratePerHour;
    if (dto.workTypeIds !== undefined) {
      doc.workTypeIds = dto.workTypeIds.map((id) => new Types.ObjectId(id));
    }
    if (dto.isActive !== undefined) doc.isActive = dto.isActive;
    if (dto.phone !== undefined) doc.phone = dto.phone;
    if (dto.personId !== undefined) {
      doc.personId = dto.personId ? new Types.ObjectId(dto.personId) : (undefined as unknown as Types.ObjectId);
    }
    if (dto.department !== undefined) doc.department = dto.department;
    return doc.save();
  }

  async remove(id: string): Promise<void> {
    const doc = await this.findById(id);
    await this.model
      .updateOne({ _id: doc._id }, { $set: { deletedAt: new Date() } })
      .exec();
  }
}
