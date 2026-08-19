import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  CreateDeskNoteDto,
  UpdateDeskNoteDto,
} from './dto/desk-note.dto';
import { DeskNote, DeskNoteDocument } from './desk-note.schema';

export interface DeskNoteListFilters {
  orderId?: string;
  lineId?: string;
  moduleId?: string;
}

/**
 * TZ-DESK-408 — CRUD заметок стола. Один write-path; hard delete (PO: compact).
 * Заметка видна только в контексте заказа/линии/модуля (anchor-фильтры).
 */
@Injectable()
export class DeskNoteService {
  constructor(
    @InjectModel(DeskNote.name)
    private readonly model: Model<DeskNoteDocument>,
  ) {}

  async findAll(filters: DeskNoteListFilters): Promise<DeskNoteDocument[]> {
    const q: Record<string, unknown> = {};
    if (filters.orderId && Types.ObjectId.isValid(filters.orderId)) {
      q.anchorOrderId = new Types.ObjectId(filters.orderId);
    }
    if (filters.lineId?.trim()) {
      q.anchorLineId = filters.lineId.trim();
    }
    if (filters.moduleId && Types.ObjectId.isValid(filters.moduleId)) {
      q.anchorModuleId = new Types.ObjectId(filters.moduleId);
    }
    return this.model.find(q).sort({ createdAt: -1 }).limit(200).exec();
  }

  async create(
    dto: CreateDeskNoteDto,
    authorId: string,
  ): Promise<DeskNoteDocument> {
    if (!Types.ObjectId.isValid(dto.anchorOrderId)) {
      throw new BadRequestException('Invalid anchorOrderId');
    }
    if (dto.anchorModuleId && !Types.ObjectId.isValid(dto.anchorModuleId)) {
      throw new BadRequestException('Invalid anchorModuleId');
    }
    if (!Types.ObjectId.isValid(authorId)) {
      throw new BadRequestException('Invalid authorId');
    }
    return this.model.create({
      text: dto.text.trim(),
      kind: dto.kind ?? 'note',
      anchorOrderId: new Types.ObjectId(dto.anchorOrderId),
      anchorLineId: dto.anchorLineId?.trim() || undefined,
      anchorModuleId: dto.anchorModuleId
        ? new Types.ObjectId(dto.anchorModuleId)
        : undefined,
      authorId: new Types.ObjectId(authorId),
      isDone: false,
    });
  }

  async update(
    id: string,
    dto: UpdateDeskNoteDto,
  ): Promise<DeskNoteDocument> {
    const doc = await this.findById(id);
    if (dto.text !== undefined) doc.text = dto.text.trim();
    if (dto.kind !== undefined) doc.kind = dto.kind;
    if (dto.isDone !== undefined) doc.isDone = dto.isDone;
    return doc.save();
  }

  async remove(id: string): Promise<void> {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException(`DeskNote ${id} not found`);
    }
    const res = await this.model.deleteOne({ _id: new Types.ObjectId(id) }).exec();
    if (res.deletedCount === 0) {
      throw new NotFoundException(`DeskNote ${id} not found`);
    }
  }

  private async findById(id: string): Promise<DeskNoteDocument> {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException(`DeskNote ${id} not found`);
    }
    const doc = await this.model.findById(id).exec();
    if (!doc) throw new NotFoundException(`DeskNote ${id} not found`);
    return doc;
  }
}
