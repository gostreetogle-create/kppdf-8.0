import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { DocumentTemplate, DocumentTemplateDocument } from './document-template.schema';
import { CreateDocumentTemplateDto } from './dto/create-document-template.dto';
import { UpdateDocumentTemplateDto } from './dto/update-document-template.dto';
import { TemplateBlock, TemplateBlockDocument } from '../template-block/template-block.schema';
import { CounterService } from '../counter/counter.service';
import { Quotation, QuotationDocument } from '../quotation/quotation.schema';
import { Contract, ContractDocument } from '../contract/contract.schema';
import { Order, OrderDocument } from '../order/order.schema';

@Injectable()
export class DocumentTemplateService {
  constructor(
    @InjectModel(DocumentTemplate.name)
    private readonly model: Model<DocumentTemplateDocument>,
    @InjectModel(TemplateBlock.name)
    private readonly blockModel: Model<TemplateBlockDocument>,
    @InjectModel(Quotation.name)
    private readonly quotationModel: Model<QuotationDocument>,
    @InjectModel(Contract.name)
    private readonly contractModel: Model<ContractDocument>,
    @InjectModel(Order.name)
    private readonly orderModel: Model<OrderDocument>,
    private readonly counter: CounterService,
  ) {}

  async create(dto: CreateDocumentTemplateDto): Promise<DocumentTemplateDocument> {
    if (dto.isDefault) {
      await this.model.updateMany(
        {
          organizationId: new Types.ObjectId(dto.organizationId),
          docTypeId: new Types.ObjectId(dto.docTypeId),
          isDefault: true,
        },
        { $set: { isDefault: false } },
      );
    }
    return this.model.create({
      name: dto.name,
      description: dto.description,
      tags: dto.tags ?? [],
      organizationId: new Types.ObjectId(dto.organizationId),
      docTypeId: new Types.ObjectId(dto.docTypeId),
      isDefault: dto.isDefault ?? false,
      isActive: dto.isActive ?? true,
      pageSize: dto.pageSize ?? 'A4',
      backgroundImage: dto.backgroundImage ?? [],
      backgroundOpacity: dto.backgroundOpacity ?? 0.3,
      version: dto.version ?? 1,
      notes: dto.notes,
    });
  }

  async findAll(
    organizationId?: string,
    docTypeId?: string,
    isDefault?: boolean,
  ): Promise<DocumentTemplateDocument[]> {
    const filter: Record<string, unknown> = {};
    if (organizationId) {
      if (!Types.ObjectId.isValid(organizationId)) return [];
      filter.organizationId = new Types.ObjectId(organizationId);
    }
    if (docTypeId) {
      if (!Types.ObjectId.isValid(docTypeId)) return [];
      filter.docTypeId = new Types.ObjectId(docTypeId);
    }
    if (typeof isDefault === 'boolean') filter.isDefault = isDefault;
    return this.model
      .find(filter)
      .populate('organizationId')
      .populate('docTypeId')
      .sort({ name: 1 })
      .exec();
  }

  async findById(id: string): Promise<DocumentTemplateDocument> {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException(`DocumentTemplate ${id} not found`);
    }
    const doc = await this.model
      .findById(id)
      .populate('organizationId')
      .populate('docTypeId')
      .exec();
    if (!doc) throw new NotFoundException(`DocumentTemplate ${id} not found`);
    return doc;
  }

  async findExpanded(id: string): Promise<{ template: DocumentTemplateDocument; blocks: TemplateBlockDocument[] }> {
    const template = await this.findById(id);
    const blocks = await this.blockModel
      .find({ templateId: template._id, isActive: true })
      .sort({ order: 1 })
      .exec();
    return { template, blocks };
  }

  async update(id: string, dto: UpdateDocumentTemplateDto): Promise<DocumentTemplateDocument> {
    const doc = await this.findById(id);
    if (dto.isDefault === true) {
      await this.model.updateMany(
        {
          _id: { $ne: doc._id },
          organizationId: doc.organizationId,
          docTypeId: doc.docTypeId,
          isDefault: true,
        },
        { $set: { isDefault: false } },
      );
    }
    if (dto.name !== undefined) doc.name = dto.name;
    if (dto.description !== undefined) doc.description = dto.description;
    if (dto.tags !== undefined) doc.tags = dto.tags;
    if (dto.isDefault !== undefined) doc.isDefault = dto.isDefault;
    if (dto.isActive !== undefined) doc.isActive = dto.isActive;
    if (dto.pageSize !== undefined) doc.pageSize = dto.pageSize;
    if (dto.backgroundImage !== undefined) doc.backgroundImage = dto.backgroundImage;
    if (dto.backgroundOpacity !== undefined) doc.backgroundOpacity = dto.backgroundOpacity;
    if (dto.notes !== undefined) doc.notes = dto.notes;
    if (dto.version !== undefined) doc.version = dto.version;
    return doc.save();
  }

  async duplicate(id: string): Promise<DocumentTemplateDocument> {
    const src = await this.findById(id);
    const newTemplate = await this.model.create({
      name: `${src.name} (копия)`,
      description: src.description,
      tags: src.tags,
      organizationId: src.organizationId,
      docTypeId: src.docTypeId,
      isDefault: false,
      isActive: true,
      pageSize: src.pageSize,
      backgroundImage: src.backgroundImage,
      backgroundOpacity: src.backgroundOpacity,
      version: 1,
      notes: src.notes,
    });
    // Duplicate blocks
    const blocks = await this.blockModel.find({ templateId: src._id }).exec();
    for (const b of blocks) {
      await this.blockModel.create({
        templateId: newTemplate._id,
        type: b.type,
        order: b.order,
        title: b.title,
        content: b.content,
        height: b.height,
        showLine: b.showLine,
        settings: b.settings,
      });
    }
    return newTemplate;
  }

  async setDefault(id: string): Promise<DocumentTemplateDocument> {
    const doc = await this.findById(id);
    await this.model.updateMany(
      {
        _id: { $ne: doc._id },
        organizationId: doc.organizationId,
        docTypeId: doc.docTypeId,
        isDefault: true,
      },
      { $set: { isDefault: false } },
    );
    doc.isDefault = true;
    return doc.save();
  }

  async preview(id: string, dataId?: string): Promise<string> {
    const { template, blocks } = await this.findExpanded(id);
    const data = dataId ? await this.loadData(dataId) : {};
    return this.renderHtml(template, blocks, data);
  }

  private async loadData(dataId: string): Promise<Record<string, unknown>> {
    if (!Types.ObjectId.isValid(dataId)) return {};
    const q = await this.quotationModel.findById(dataId).exec();
    if (q) return { kind: 'quotation', ...JSON.parse(JSON.stringify(q)) };
    const c = await this.contractModel.findById(dataId).exec();
    if (c) return { kind: 'contract', ...JSON.parse(JSON.stringify(c)) };
    const o = await this.orderModel.findById(dataId).exec();
    if (o) return { kind: 'order', ...JSON.parse(JSON.stringify(o)) };
    return {};
  }

  private renderHtml(
    template: DocumentTemplateDocument,
    blocks: TemplateBlockDocument[],
    data: Record<string, unknown>,
  ): string {
    const substitute = (s: string | undefined): string => {
      if (!s) return '';
      return s.replace(/\{\{\s*([\w.]+)\s*\}\}/g, (_m, key: string) => {
        const val = key.split('.').reduce<unknown>((acc, k) => {
          if (acc == null) return undefined;
          if (Array.isArray(acc)) {
            const idx = parseInt(k, 10);
            return Number.isFinite(idx) ? acc[idx] : undefined;
          }
          if (typeof acc === 'object') {
            return (acc as Record<string, unknown>)[k];
          }
          return undefined;
        }, data);
        return val == null ? '' : String(val);
      });
    };
    const css = `
      <style>
        body { font-family: 'Times New Roman', serif; max-width: 800px; margin: 20px auto; padding: 20px; }
        h1, h2, h3 { margin: 8px 0; }
        .block { margin: 12px 0; padding: 8px 0; border-bottom: 1px solid #eee; }
        table { width: 100%; border-collapse: collapse; }
        th, td { border: 1px solid #ccc; padding: 4px 8px; text-align: left; }
      </style>`;
    const body = blocks
      .map((b) => {
        const content = substitute(b.content ?? b.title);
        switch (b.type) {
          case 'header':
            return `<div class="block"><h2>${substitute(b.title ?? '')}</h2>${content}</div>`;
          case 'text':
            return `<div class="block">${content}</div>`;
          case 'image':
            return `<div class="block"><img src="${content}" alt=""></div>`;
          case 'signature':
            return `<div class="block"><em>Подпись: ___________________</em><br>${content}</div>`;
          case 'table':
            return `<div class="block">${content}</div>`;
          default:
            return `<div class="block">${content}</div>`;
        }
      })
      .join('\n');
    return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${substitute(template.name)}</title>${css}</head><body>${body}</body></html>`;
  }

  async remove(id: string): Promise<void> {
    const doc = await this.findById(id);
    await this.model.deleteOne({ _id: doc._id }).exec();
    await this.blockModel.deleteMany({ templateId: doc._id }).exec();
  }
}
