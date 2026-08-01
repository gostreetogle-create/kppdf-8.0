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
import type { AuthenticatedUser } from '../../common/decorators/current-user.decorator';

type OrgScopedUser = Pick<AuthenticatedUser, 'organizationId'>;

@Injectable()
export class GeneratedDocumentService {
  constructor(
    @InjectModel(GeneratedDocument.name)
    private readonly model: Model<GeneratedDocumentDocument>,
    private readonly templateService: DocumentTemplateService,
    private readonly counter: CounterService,
  ) {}

  async findAll(
    filters?: {
      templateId?: string;
      sourceType?: string;
      sourceId?: string;
    },
    user?: OrgScopedUser,
  ): Promise<GeneratedDocumentDocument[]> {
    const q: Record<string, unknown> = { isActive: true };
    const scope = this.organizationScope(user);
    if (scope) Object.assign(q, scope);
    if (filters?.templateId && Types.ObjectId.isValid(filters.templateId)) {
      q.templateId = new Types.ObjectId(filters.templateId);
    }
    if (filters?.sourceType) q.sourceType = filters.sourceType;
    if (filters?.sourceId && Types.ObjectId.isValid(filters.sourceId)) {
      q.sourceId = new Types.ObjectId(filters.sourceId);
    }
    return this.model.find(q).sort({ createdAt: -1 }).exec();
  }

  async findById(id: string, user?: OrgScopedUser): Promise<GeneratedDocumentDocument> {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException(`GeneratedDocument ${id} not found`);
    }
    const filter: Record<string, unknown> = { _id: id };
    const scope = this.organizationScope(user);
    if (scope) Object.assign(filter, scope);
    const doc = await this.model.findOne(filter).exec();
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
    user?: OrgScopedUser,
  ): Promise<GeneratedDocumentDocument> {
    const template = await this.templateService.findById(templateId);
    const templateOrgId = this.organizationIdOf(template.organizationId);
    if (!templateOrgId) {
      throw new NotFoundException(`DocumentTemplate ${templateId} not found`);
    }
    const userOrgId = user?.organizationId ?? null;
    if (userOrgId && !Types.ObjectId.isValid(userOrgId)) {
      throw new NotFoundException(`DocumentTemplate ${templateId} not found`);
    }
    if (userOrgId && templateOrgId !== userOrgId) {
      throw new NotFoundException(`DocumentTemplate ${templateId} not found`);
    }
    if (userOrgId && dto.organizationId && dto.organizationId !== userOrgId) {
      throw new NotFoundException('Organization not found');
    }
    if (userOrgId) {
      await this.templateService.assertBuildSourcesInOrganization(dto, userOrgId);
    }
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

    const orgId = userOrgId
      ? new Types.ObjectId(userOrgId)
      : dto.organizationId && Types.ObjectId.isValid(dto.organizationId)
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

  async remove(id: string, user?: OrgScopedUser): Promise<void> {
    const doc = await this.findById(id, user);
    if (user?.organizationId && !this.organizationIdOf(doc.organizationId)) {
      // Global/legacy documents are readable through the shared-record scope,
      // but must not be deactivated by an organization-scoped user.
      throw new NotFoundException(`GeneratedDocument ${id} not found`);
    }
    doc.isActive = false;
    await doc.save();
  }

  private organizationIdOf(value: unknown): string | null {
    if (typeof value === 'string') return value;
    if (value && typeof value === 'object' && '_id' in value) {
      return String((value as { _id: unknown })._id);
    }
    return value ? String(value) : null;
  }

  private organizationScope(user?: OrgScopedUser): Record<string, unknown> | null {
    const organizationId = user?.organizationId;
    if (!organizationId) return null;
    if (!Types.ObjectId.isValid(organizationId)) {
      // An authenticated user with a malformed organization claim must not
      // receive an unscoped query or trigger a Mongoose cast error.
      return { _id: { $in: [] } };
    }
    return {
      $or: [
        { organizationId: new Types.ObjectId(organizationId) },
        { organizationId: null },
        { organizationId: { $exists: false } },
      ],
    };
  }
}
