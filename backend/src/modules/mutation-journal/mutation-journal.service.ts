import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { AuthenticatedUser } from '../../common/decorators/current-user.decorator';
import { MaterialService } from '../material/material.service';
import { CreateMaterialDto } from '../material/dto/create-material.dto';
import { UpdateMaterialDto } from '../material/dto/update-material.dto';
import { CreateProposalDto } from './dto/create-proposal.dto';
import {
  MutationJournal,
  MutationJournalDocument,
} from './mutation-journal.schema';

const DEFAULT_RING = 50;
const PROPOSAL_TTL_MS = 60 * 60 * 1000;

function leanMaterial(doc: { toObject?: () => Record<string, unknown> } | Record<string, unknown> | null): Record<string, unknown> | null {
  if (!doc) return null;
  if (typeof (doc as { toObject?: () => Record<string, unknown> }).toObject === 'function') {
    return (doc as { toObject: () => Record<string, unknown> }).toObject();
  }
  return { ...(doc as Record<string, unknown>) };
}

@Injectable()
export class MutationJournalService {
  private readonly logger = new Logger(MutationJournalService.name);
  private readonly ringSize: number;

  constructor(
    @InjectModel(MutationJournal.name)
    private readonly model: Model<MutationJournalDocument>,
    private readonly materials: MaterialService,
  ) {
    const raw = Number(process.env.MUTATION_JOURNAL_RING_SIZE ?? DEFAULT_RING);
    this.ringSize = Number.isFinite(raw) && raw >= 1 ? Math.min(200, Math.floor(raw)) : DEFAULT_RING;
  }

  async propose(dto: CreateProposalDto, user: AuthenticatedUser) {
    if (!user?.id || !Types.ObjectId.isValid(user.id)) {
      throw new ForbiddenException('Authenticated user required');
    }

    const toolName = dto.toolName ?? 'kppdf_propose_material';
    const orgId =
      user.organizationId && Types.ObjectId.isValid(user.organizationId)
        ? new Types.ObjectId(user.organizationId)
        : undefined;

    if (dto.kind === 'material.create') {
      if (!dto.create?.name?.trim()) {
        throw new BadRequestException('create.name is required for material.create');
      }
      const payload = {
        ...dto.create,
        unit: dto.create.unit?.trim() || 'шт',
      };
      const doc = await this.model.create({
        status: 'proposed',
        kind: dto.kind,
        toolName,
        actorUserId: new Types.ObjectId(user.id),
        organizationId: orgId,
        entityType: 'Material',
        payload,
        before: null,
        after: null,
        expiresAt: new Date(Date.now() + PROPOSAL_TTL_MS),
      });
      return this.toProposalView(doc);
    }

    if (dto.kind === 'material.update') {
      if (!dto.update?.id || !dto.update?.patch || typeof dto.update.patch !== 'object') {
        throw new BadRequestException('update.id and update.patch required for material.update');
      }
      const existing = await this.materials.findById(dto.update.id);
      const before = leanMaterial(existing);
      const doc = await this.model.create({
        status: 'proposed',
        kind: dto.kind,
        toolName,
        actorUserId: new Types.ObjectId(user.id),
        organizationId: orgId,
        entityType: 'Material',
        entityId: new Types.ObjectId(dto.update.id),
        payload: { id: dto.update.id, patch: dto.update.patch },
        before,
        after: null,
        expiresAt: new Date(Date.now() + PROPOSAL_TTL_MS),
      });
      return this.toProposalView(doc);
    }

    throw new BadRequestException(`Unsupported kind: ${dto.kind}`);
  }

  async confirm(proposalId: string, user: AuthenticatedUser) {
    const doc = await this.loadOwned(proposalId, user);
    if (doc.status !== 'proposed') {
      throw new BadRequestException(`Proposal ${proposalId} is ${doc.status}, not proposed`);
    }
    if (doc.expiresAt && doc.expiresAt.getTime() < Date.now()) {
      doc.status = 'expired';
      await doc.save();
      throw new BadRequestException(`Proposal ${proposalId} expired`);
    }

    if (doc.kind === 'material.create') {
      const payload = (doc.payload ?? {}) as unknown as CreateMaterialDto;
      const created = await this.materials.create(payload);
      doc.entityId = created._id as Types.ObjectId;
      doc.after = leanMaterial(created);
      doc.before = null;
    } else if (doc.kind === 'material.update') {
      const payload = doc.payload as unknown as { id: string; patch: UpdateMaterialDto };
      if (!doc.before) {
        const existing = await this.materials.findById(payload.id);
        doc.before = leanMaterial(existing);
      }
      const updated = await this.materials.update(payload.id, payload.patch);
      doc.entityId = updated._id as Types.ObjectId;
      doc.after = leanMaterial(updated);
    } else {
      throw new BadRequestException(`Unsupported kind: ${doc.kind}`);
    }

    doc.status = 'applied';
    doc.appliedAt = new Date();
    await doc.save();
    await this.enforceRing(doc.organizationId);
    return this.toMutationView(doc);
  }

  async undo(mutationId: string, user: AuthenticatedUser) {
    const doc = await this.loadOwned(mutationId, user);
    if (doc.status !== 'applied') {
      throw new BadRequestException(`Mutation ${mutationId} is ${doc.status}, not applied`);
    }

    if (doc.kind === 'material.create') {
      if (!doc.entityId) throw new BadRequestException('Missing entityId for create undo');
      await this.materials.remove(String(doc.entityId));
    } else if (doc.kind === 'material.update') {
      if (!doc.entityId || !doc.before) {
        throw new BadRequestException('Missing before snapshot for update undo');
      }
      const restore = this.pickRestorable(doc.before);
      await this.materials.update(String(doc.entityId), restore as UpdateMaterialDto);
    } else {
      throw new BadRequestException(`Unsupported kind: ${doc.kind}`);
    }

    doc.status = 'undone';
    doc.undoneAt = new Date();
    await doc.save();
    return this.toMutationView(doc);
  }

  async undoLast(user: AuthenticatedUser) {
    const filter = this.orgActorFilter(user);
    const last = await this.model
      .findOne({ ...filter, status: 'applied' })
      .sort({ appliedAt: -1, createdAt: -1 })
      .exec();
    if (!last) throw new NotFoundException('No applied mutation to undo');
    return this.undo(String(last._id), user);
  }

  async listRecent(user: AuthenticatedUser, limit = 20) {
    const filter = this.orgActorFilter(user);
    const take = Math.min(100, Math.max(1, limit));
    const items = await this.model
      .find({ ...filter, status: { $in: ['applied', 'undone'] } })
      .sort({ appliedAt: -1, createdAt: -1 })
      .limit(take)
      .lean()
      .exec();
    return {
      ringSize: this.ringSize,
      items: items.map((d) => this.toMutationView(d as MutationJournalDocument)),
    };
  }

  async getById(id: string, user: AuthenticatedUser) {
    const doc = await this.loadOwned(id, user);
    return doc.status === 'proposed' ? this.toProposalView(doc) : this.toMutationView(doc);
  }

  async cancel(proposalId: string, user: AuthenticatedUser) {
    const doc = await this.loadOwned(proposalId, user);
    if (doc.status !== 'proposed') {
      throw new BadRequestException(`Only proposed can be cancelled (was ${doc.status})`);
    }
    doc.status = 'cancelled';
    await doc.save();
    return this.toProposalView(doc);
  }

  private async enforceRing(organizationId?: Types.ObjectId) {
    const filter: Record<string, unknown> = {
      status: { $in: ['applied', 'undone'] },
    };
    if (organizationId) filter.organizationId = organizationId;
    const count = await this.model.countDocuments(filter).exec();
    if (count <= this.ringSize) return;
    const overflow = count - this.ringSize;
    const oldest = await this.model
      .find(filter)
      .sort({ appliedAt: 1, createdAt: 1 })
      .limit(overflow)
      .select({ _id: 1 })
      .lean()
      .exec();
    const ids = oldest.map((o) => o._id);
    if (ids.length) {
      await this.model.deleteMany({ _id: { $in: ids } }).exec();
      this.logger.debug(`Evicted ${ids.length} journal entries (ring=${this.ringSize})`);
    }
  }

  private pickRestorable(before: Record<string, unknown>): Record<string, unknown> {
    const skip = new Set([
      '_id',
      '__v',
      'createdAt',
      'updatedAt',
      'deletedAt',
      'id',
    ]);
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(before)) {
      if (skip.has(k)) continue;
      out[k] = v;
    }
    return out;
  }

  private orgActorFilter(user: AuthenticatedUser): Record<string, unknown> {
    const filter: Record<string, unknown> = {};
    if (user.role === 'admin') {
      if (user.organizationId && Types.ObjectId.isValid(user.organizationId)) {
        filter.organizationId = new Types.ObjectId(user.organizationId);
      }
      return filter;
    }
    if (!user.id || !Types.ObjectId.isValid(user.id)) {
      throw new ForbiddenException('Authenticated user required');
    }
    filter.actorUserId = new Types.ObjectId(user.id);
    if (user.organizationId && Types.ObjectId.isValid(user.organizationId)) {
      filter.organizationId = new Types.ObjectId(user.organizationId);
    }
    return filter;
  }

  private async loadOwned(id: string, user: AuthenticatedUser): Promise<MutationJournalDocument> {
    if (!Types.ObjectId.isValid(id)) throw new NotFoundException(`Mutation ${id} not found`);
    const doc = await this.model.findById(id).exec();
    if (!doc) throw new NotFoundException(`Mutation ${id} not found`);

    if (user.role !== 'admin') {
      if (String(doc.actorUserId) !== user.id) {
        throw new ForbiddenException('Not your mutation');
      }
    } else if (
      user.organizationId &&
      doc.organizationId &&
      String(doc.organizationId) !== user.organizationId
    ) {
      throw new ForbiddenException('Wrong organization');
    }
    return doc;
  }

  private toProposalView(doc: MutationJournalDocument | Record<string, unknown>) {
    const d = doc as MutationJournalDocument;
    return {
      proposalId: String(d._id),
      status: d.status,
      kind: d.kind,
      toolName: d.toolName,
      entityType: d.entityType,
      entityId: d.entityId ? String(d.entityId) : null,
      payload: d.payload ?? null,
      before: d.before ?? null,
      after: d.after ?? null,
      expiresAt: d.expiresAt ?? null,
      createdAt: (d as { createdAt?: Date }).createdAt ?? null,
    };
  }

  private toMutationView(doc: MutationJournalDocument | Record<string, unknown>) {
    const d = doc as MutationJournalDocument;
    return {
      mutationId: String(d._id),
      status: d.status,
      kind: d.kind,
      toolName: d.toolName,
      entityType: d.entityType,
      entityId: d.entityId ? String(d.entityId) : null,
      before: d.before ?? null,
      after: d.after ?? null,
      appliedAt: d.appliedAt ?? null,
      undoneAt: d.undoneAt ?? null,
      createdAt: (d as { createdAt?: Date }).createdAt ?? null,
    };
  }
}
