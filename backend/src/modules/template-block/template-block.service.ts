import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { TemplateBlock, TemplateBlockDocument } from './template-block.schema';
import { CreateTemplateBlockDto } from './dto/create-template-block.dto';
import { UpdateTemplateBlockDto } from './dto/update-template-block.dto';

@Injectable()
export class TemplateBlockService {
  constructor(
    @InjectModel(TemplateBlock.name)
    private readonly model: Model<TemplateBlockDocument>,
  ) {}

  async create(dto: CreateTemplateBlockDto): Promise<TemplateBlockDocument> {
    return this.model.create({
      templateId: new Types.ObjectId(dto.templateId),
      type: dto.type,
      order: dto.order,
      title: dto.title,
      content: dto.content,
      height: dto.height,
      showLine: dto.showLine ?? false,
      settings: dto.settings,
    });
  }

  async findAll(templateId?: string): Promise<TemplateBlockDocument[]> {
    const filter: Record<string, unknown> = { isActive: true };
    if (templateId) {
      if (!Types.ObjectId.isValid(templateId)) return [];
      filter.templateId = new Types.ObjectId(templateId);
    }
    return this.model.find(filter).sort({ templateId: 1, order: 1 }).exec();
  }

  async findById(id: string): Promise<TemplateBlockDocument> {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException(`TemplateBlock ${id} not found`);
    }
    const doc = await this.model.findById(id).exec();
    if (!doc) throw new NotFoundException(`TemplateBlock ${id} not found`);
    return doc;
  }

  async update(id: string, dto: UpdateTemplateBlockDto): Promise<TemplateBlockDocument> {
    const doc = await this.findById(id);
    if (dto.type !== undefined) doc.type = dto.type;
    if (dto.order !== undefined) doc.order = dto.order;
    if (dto.title !== undefined) doc.title = dto.title;
    if (dto.content !== undefined) doc.content = dto.content;
    if (dto.height !== undefined) doc.height = dto.height;
    if (dto.showLine !== undefined) doc.showLine = dto.showLine;
    if (dto.settings !== undefined) doc.settings = dto.settings;
    return doc.save();
  }

  async reorder(templateId: string, blockIds: string[]): Promise<TemplateBlockDocument[]> {
    if (!Types.ObjectId.isValid(templateId)) {
      throw new NotFoundException(`Template ${templateId} not found`);
    }
    for (let i = 0; i < blockIds.length; i++) {
      await this.model.updateOne(
        { _id: new Types.ObjectId(blockIds[i]), templateId: new Types.ObjectId(templateId) },
        { $set: { order: i } },
      );
    }
    return this.findAll(templateId);
  }

  async remove(id: string): Promise<void> {
    const doc = await this.findById(id);
    await this.model.updateOne({ _id: doc._id }, { $set: { deletedAt: new Date(), isActive: false } }).exec();
  }
}
