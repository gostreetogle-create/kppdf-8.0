import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  CreateSupplyTaskDto,
  UpdateSupplyTaskDto,
} from './dto/create-supply-task.dto';
import {
  SupplyTask,
  SupplyTaskDocument,
  SupplyTaskStatus,
} from './supply-task.schema';

const STATUS_FLOW: Record<SupplyTaskStatus, SupplyTaskStatus[]> = {
  draft: ['confirmed'],
  confirmed: ['ordered'],
  ordered: ['received'],
  received: [],
};

@Injectable()
export class SupplyTaskService {
  constructor(
    @InjectModel(SupplyTask.name)
    private readonly model: Model<SupplyTaskDocument>,
  ) {}

  async create(dto: CreateSupplyTaskDto): Promise<SupplyTaskDocument> {
    if (!Types.ObjectId.isValid(dto.orderId)) {
      throw new BadRequestException('Invalid orderId');
    }
    if (!dto.materialId && !dto.moduleId && !(dto.title ?? '').trim()) {
      throw new BadRequestException(
        'Укажите materialId, moduleId или title для задачи снабжения',
      );
    }
    if (dto.materialId && !Types.ObjectId.isValid(dto.materialId)) {
      throw new BadRequestException('Invalid materialId');
    }
    if (dto.moduleId && !Types.ObjectId.isValid(dto.moduleId)) {
      throw new BadRequestException('Invalid moduleId');
    }

    return this.model.create({
      orderId: new Types.ObjectId(dto.orderId),
      orderLineId: dto.orderLineId?.trim() || undefined,
      materialId: dto.materialId
        ? new Types.ObjectId(dto.materialId)
        : undefined,
      moduleId: dto.moduleId ? new Types.ObjectId(dto.moduleId) : undefined,
      qty: dto.qty,
      notes: dto.notes?.trim() || undefined,
      title: dto.title?.trim() || undefined,
      status: 'draft' as SupplyTaskStatus,
    });
  }

  async findAll(filters: {
    orderId?: string;
    status?: string;
  }): Promise<SupplyTaskDocument[]> {
    const q: Record<string, unknown> = { deletedAt: null };
    if (filters.orderId && Types.ObjectId.isValid(filters.orderId)) {
      q.orderId = new Types.ObjectId(filters.orderId);
    }
    if (
      filters.status &&
      ['draft', 'confirmed', 'ordered', 'received'].includes(filters.status)
    ) {
      q.status = filters.status;
    }
    return this.model.find(q).sort({ createdAt: -1 }).limit(500).exec();
  }

  async findById(id: string): Promise<SupplyTaskDocument> {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException(`SupplyTask ${id} not found`);
    }
    const doc = await this.model.findOne({ _id: id, deletedAt: null }).exec();
    if (!doc) throw new NotFoundException(`SupplyTask ${id} not found`);
    return doc;
  }

  async update(
    id: string,
    dto: UpdateSupplyTaskDto,
  ): Promise<SupplyTaskDocument> {
    const doc = await this.findById(id);
    if (dto.qty !== undefined) doc.qty = dto.qty;
    if (dto.notes !== undefined) doc.notes = dto.notes.trim();
    if (dto.title !== undefined) doc.title = dto.title.trim();
    return doc.save();
  }

  /**
   * D18: зелёный флаг «можно заказывать» — кто + когда.
   */
  async confirm(
    id: string,
    userId: string,
  ): Promise<SupplyTaskDocument> {
    const doc = await this.findById(id);
    this.assertTransition(doc.status, 'confirmed');
    if (!Types.ObjectId.isValid(userId)) {
      throw new BadRequestException('Invalid userId for confirm');
    }
    doc.status = 'confirmed';
    doc.confirmedBy = new Types.ObjectId(userId);
    doc.confirmedAt = new Date();
    return doc.save();
  }

  async markOrdered(id: string): Promise<SupplyTaskDocument> {
    const doc = await this.findById(id);
    this.assertTransition(doc.status, 'ordered');
    doc.status = 'ordered';
    return doc.save();
  }

  async markReceived(id: string): Promise<SupplyTaskDocument> {
    const doc = await this.findById(id);
    this.assertTransition(doc.status, 'received');
    doc.status = 'received';
    return doc.save();
  }

  async remove(id: string): Promise<void> {
    const doc = await this.findById(id);
    await this.model
      .updateOne({ _id: doc._id }, { $set: { deletedAt: new Date() } })
      .exec();
  }

  private assertTransition(
    from: SupplyTaskStatus,
    to: SupplyTaskStatus,
  ): void {
    const allowed = STATUS_FLOW[from] ?? [];
    if (!allowed.includes(to)) {
      throw new BadRequestException(
        `Нельзя перевести задачу снабжения из «${from}» в «${to}»`,
      );
    }
  }
}
