import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { TemplateBlock, TemplateBlockDocument } from './template-block.schema';
import { CreateTemplateBlockDto } from './dto/create-template-block.dto';
import { UpdateTemplateBlockDto } from './dto/update-template-block.dto';
import { UpdateTemplateBlockLayoutsDto } from './dto/update-layouts.dto';
import { SessionRunner } from '../../common/db/session-runner';
import { sanitizeHtml, sanitizeBlockContent } from '../../common/sanitize-html';
import { normalizeBlockLayout, type BlockSource } from './template-block-layout';
import type { BlockSourceDto } from './dto/create-template-block.dto';

@Injectable()
export class TemplateBlockService {
  constructor(
    @InjectModel(TemplateBlock.name)
    private readonly model: Model<TemplateBlockDocument>,
    private readonly sessionRunner: SessionRunner,
  ) {}

  async create(dto: CreateTemplateBlockDto): Promise<TemplateBlockDocument> {
    return this.model.create({
      templateId: new Types.ObjectId(dto.templateId),
      type: dto.type,
      order: dto.order,
      title: dto.title,
      content: sanitizeHtml(dto.content ?? ''),
      columns: dto.columns?.map((c) => ({
        id: c.id,
        content: sanitizeBlockContent(c.content || ''),
        width: c.width ?? 1,
        ...(c.fontSize !== undefined ? { fontSize: c.fontSize } : {}),
      })),
      height: dto.height,
      showLine: dto.showLine ?? false,
      settings: dto.settings,
      dataBinding: dto.dataBinding,
      layout: dto.layout
        ? (this.assertSupportedPage(dto.layout.page), normalizeBlockLayout(dto.layout))
        : undefined,
      source: this.normalizeSource(dto.source),
      isActive: dto.isActive ?? true,
    });
  }

  private normalizeSource(source: BlockSourceDto | undefined): BlockSource | undefined {
    if (!source) return undefined;

    switch (source.kind) {
      case 'literal':
        if (source.value === undefined) {
          throw new BadRequestException('Literal block source requires value');
        }
        return { kind: 'literal', value: source.value };
      case 'text-block':
        if (!source.refId) {
          throw new BadRequestException('Text-block source requires refId');
        }
        return { kind: 'text-block', refId: source.refId, mode: source.mode ?? 'live' };
      case 'table-template':
        if (!source.refId) {
          throw new BadRequestException('Table-template source requires refId');
        }
        return { kind: 'table-template', refId: source.refId, mode: source.mode ?? 'live' };
      case 'field':
        if (!source.source || !source.field) {
          throw new BadRequestException('Field source requires source and field');
        }
        return {
          kind: 'field',
          source: source.source,
          field: source.field,
          ...(source.format ? { format: source.format } : {}),
        };
    }
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
    if (dto.content !== undefined) doc.content = sanitizeHtml(dto.content);
    if (dto.columns !== undefined) {
      const previousById = new Map((doc.columns ?? []).map((c) => [c.id, c]));
      doc.columns = dto.columns.map((c) => ({
        id: c.id,
        content: sanitizeBlockContent(c.content || ''),
        width: c.width ?? 1,
        fontSize: c.fontSize ?? previousById.get(c.id)?.fontSize ?? 14,
      }));
    }
    if (dto.height !== undefined) doc.height = dto.height;
    if (dto.showLine !== undefined) doc.showLine = dto.showLine;
    if (dto.settings !== undefined) doc.settings = dto.settings;
    if (dto.dataBinding !== undefined) doc.dataBinding = dto.dataBinding;
    if (dto.layout !== undefined) {
      this.assertSupportedPage(dto.layout.page);
      doc.layout = normalizeBlockLayout({ ...doc.layout, ...dto.layout });
    }
    if (dto.source !== undefined) doc.source = this.normalizeSource(dto.source);
    if (dto.isActive !== undefined) doc.isActive = dto.isActive;
    return doc.save();
  }

  async updateLayouts(
    templateId: string,
    dto: UpdateTemplateBlockLayoutsDto,
  ): Promise<TemplateBlockDocument[]> {
    if (!Types.ObjectId.isValid(templateId)) {
      throw new NotFoundException(`Template ${templateId} not found`);
    }

    dto.updates.forEach((update) => this.assertSupportedPage(update.layout.page));
    const ids = dto.updates.map((update) => update.blockId);
    if (new Set(ids).size !== ids.length) {
      throw new BadRequestException('Layout updates must contain unique block IDs');
    }
    if (ids.some((id) => !Types.ObjectId.isValid(id))) {
      throw new BadRequestException('Layout update contains an invalid block ID');
    }

    const templateObjectId = new Types.ObjectId(templateId);
    const blockObjectIds = ids.map((id) => new Types.ObjectId(id));
    const blocks = await this.model.find({
      _id: { $in: blockObjectIds },
      templateId: templateObjectId,
      isActive: true,
    }).exec();
    if (blocks.length !== ids.length) {
      throw new BadRequestException('Every layout block must belong to the active template');
    }

    await this.sessionRunner.run(async (session) => {
      await this.model.bulkWrite(
        dto.updates.map((update) => ({
          updateOne: {
            filter: { _id: new Types.ObjectId(update.blockId), templateId: templateObjectId },
            update: { $set: { layout: normalizeBlockLayout(update.layout) } },
          },
        })),
        { ordered: true, session },
      );
    });
    return this.findAll(templateId);
  }

  async reorder(templateId: string, blockIds: string[]): Promise<TemplateBlockDocument[]> {
    if (!Types.ObjectId.isValid(templateId)) {
      throw new NotFoundException(`Template ${templateId} not found`);
    }
    if (blockIds.length === 0 || new Set(blockIds).size !== blockIds.length) {
      throw new BadRequestException('Reorder requires a unique, non-empty block ID list');
    }
    if (blockIds.some((id) => !Types.ObjectId.isValid(id))) {
      throw new BadRequestException('Reorder contains an invalid block ID');
    }

    const templateObjectId = new Types.ObjectId(templateId);
    const existing = await this.model.find({
      templateId: templateObjectId,
      isActive: true,
    }).select({ _id: 1 }).lean().exec();
    const existingIds = new Set(existing.map((block) => String(block._id)));
    if (existingIds.size !== blockIds.length || blockIds.some((id) => !existingIds.has(id))) {
      throw new BadRequestException('Reorder must contain every active block in the template exactly once');
    }

    await this.sessionRunner.run(async (session) => {
      await this.model.bulkWrite(
        blockIds.map((id, order) => ({
          updateOne: {
            filter: { _id: new Types.ObjectId(id), templateId: templateObjectId, isActive: true },
            update: { $set: { order } },
          },
        })),
        { ordered: true, session },
      );
    });
    return this.findAll(templateId);
  }

  private assertSupportedPage(page: number | undefined): void {
    if (page !== undefined && page !== 1) {
      throw new BadRequestException('Only page 1 is currently supported by the document builder');
    }
  }

  async remove(id: string): Promise<void> {
    const doc = await this.findById(id);
    await this.model.updateOne({ _id: doc._id }, { $set: { deletedAt: new Date(), isActive: false } }).exec();
  }
}
