import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  GeneratedDocument,
  GeneratedDocumentDocument,
  GeneratedDocumentSourceType,
} from './generated-document.schema';
import { DocumentTemplateService } from '../document-template/document-template.service';
import { BuildDocumentDto } from '../document-template/dto/build-document.dto';
import { CounterService } from '../counter/counter.service';

@Injectable()
export class GeneratedDocumentService {
  constructor(
    @InjectModel(GeneratedDocument.name)
    private readonly model: Model<GeneratedDocumentDocument>,
    private readonly templateService: DocumentTemplateService,
    private readonly counter: CounterService,
  ) {}

  async findAll(filters?: {
    templateId?: string;
    sourceType?: string;
    sourceId?: string;
  }): Promise<GeneratedDocumentDocument[]> {
    const q: Record<string, unknown> = { isActive: true };
    if (filters?.templateId && Types.ObjectId.isValid(filters.templateId)) {
      q.templateId = new Types.ObjectId(filters.templateId);
    }
    if (filters?.sourceType) q.sourceType = filters.sourceType;
    if (filters?.sourceId && Types.ObjectId.isValid(filters.sourceId)) {
      q.sourceId = new Types.ObjectId(filters.sourceId);
    }
    return this.model.find(q).sort({ createdAt: -1 }).exec();
  }

  async findById(id: string): Promise<GeneratedDocumentDocument> {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException(`GeneratedDocument ${id} not found`);
    }
    const doc = await this.model.findById(id).exec();
    if (!doc || !doc.isActive) {
      throw new NotFoundException(`GeneratedDocument ${id} not found`);
    }
    return doc;
  }

  /**
   * Render template with build payload, persist HTML snapshot, return saved doc.
   */
  async generate(
    templateId: string,
    dto: BuildDocumentDto,
    options?: { name?: string; status?: 'draft' | 'final' },
  ): Promise<GeneratedDocumentDocument> {
    const template = await this.templateService.findById(templateId);
    const html = await this.templateService.build(templateId, dto);
    const number = await this.counter.next('generated-document', 'DOC');

    let sourceType: GeneratedDocumentSourceType = 'manual';
    let sourceId: Types.ObjectId | undefined;
    if (dto.orderId && Types.ObjectId.isValid(dto.orderId)) {
      sourceType = 'order';
      sourceId = new Types.ObjectId(dto.orderId);
    } else if (dto.contractId && Types.ObjectId.isValid(dto.contractId)) {
      sourceType = 'contract';
      sourceId = new Types.ObjectId(dto.contractId);
    }

    const orgId =
      dto.organizationId && Types.ObjectId.isValid(dto.organizationId)
        ? new Types.ObjectId(dto.organizationId)
        : template.organizationId;

    return this.model.create({
      number,
      name: options?.name ?? `${template.name} — ${number}`,
      templateId: template._id,
      templateName: template.name,
      sourceType,
      sourceId,
      organizationId: orgId,
      html,
      buildPayload: { ...dto },
      status: options?.status ?? 'draft',
      isActive: true,
    });
  }

  async remove(id: string): Promise<void> {
    const doc = await this.findById(id);
    doc.isActive = false;
    await doc.save();
  }
}
