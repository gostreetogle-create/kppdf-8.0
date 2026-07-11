import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { randomUUID } from 'node:crypto';
import { join } from 'node:path';
import { promises as fs } from 'node:fs';
import { DocumentTemplate, DocumentTemplateDocument } from './document-template.schema';
import { CreateDocumentTemplateDto } from './dto/create-document-template.dto';
import { UpdateDocumentTemplateDto } from './dto/update-document-template.dto';
import { BuildDocumentDto } from './dto/build-document.dto';
import {
  TemplateBlock,
  TemplateBlockDocument,
  type DataBinding,
} from '../template-block/template-block.schema';
import { CounterService } from '../counter/counter.service';
import { Quotation, QuotationDocument } from '../quotation/quotation.schema';
import { Contract, ContractDocument } from '../contract/contract.schema';
import { Order, OrderDocument } from '../order/order.schema';
import { Organization, OrganizationDocument } from '../organization/organization.schema';
import { Counterparty, CounterpartyDocument } from '../counterparty/counterparty.schema';
import { Product, ProductDocument } from '../product/product.schema';
import { Material, MaterialDocument } from '../material/material.schema';
import { WorkType, WorkTypeDocument } from '../work-type/work-type.schema';

/**
 * TZ-86 Phase A.4 — DocumentTemplateService extended.
 *
 * New responsibility: `build(id, dto)` — renders an HTML preview of the
 * template using `dataBinding` subdocs to live-resolve block content from
 * a caller-supplied sourceIds map. Distinct from the legacy `preview(id, dataId?)`
 * which auto-detects a single Quotation/Contract/Order for substitution.
 *
 * Algorithm:
 *  1. findExpanded(id) → { template, blocks[] } in display order.
 *  2. resolveSourceIds(dto) → flat `{ organization: {...}, counterparty: {...}, ... }`
 *     bag built via Promise.all parallel lookups (Schema.lean() for speed).
 *  3. resolveBlockContent(b, bag, dto) → TemplateBlockDocument with content
 *     replaced by resolved binding value:
 *       - dataBinding.source === 'static' → use binding.value raw
 *       - dataBinding.source ∈ data sources → look up bag[source], read field
 *       - missing source / missing field → empty (deterministic placeholder)
 *  4. Hand off to existing private renderHtml(template, resolvedBlocks, bag)
 *     so that blocks WITHOUT dataBinding still get `{{key.subkey}}` substitution
 *     against the bag (e.g. header `Документ № {{order.number}}` after build() loads
 *     the bag from orderId).
 *
 * MVP scope: only single-field reads (no nested-path). Format applied via
 * `formatValue()` for currency/date/number (Intl ru-RU defaults). Format hint
 * `text` and undefined fall through to raw String(value).
 */
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
    @InjectModel(Organization.name)
    private readonly orgModel: Model<OrganizationDocument>,
    @InjectModel(Counterparty.name)
    private readonly counterpartyModel: Model<CounterpartyDocument>,
    @InjectModel(Product.name)
    private readonly productModel: Model<ProductDocument>,
    @InjectModel(Material.name)
    private readonly materialModel: Model<MaterialDocument>,
    @InjectModel(WorkType.name)
    private readonly workTypeModel: Model<WorkTypeDocument>,
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

  // ── Phase A.4 — DataBinding-aware build (TZ-86 §2.6) ───────────────────────────────

  /**
   * Render a template to inline HTML using caller-supplied sourceIds map.
   * Public POST /api/document-templates/:id/build endpoint.
   *
   * Returns the rendered HTML string. Service is read-only (no DB writes);
   * AuditInterceptor auto-skips logging because no @AuditAction decorator.
   */
  async build(templateId: string, dto: BuildDocumentDto): Promise<string> {
    if (!Types.ObjectId.isValid(templateId)) {
      throw new BadRequestException(`Invalid templateId ${templateId}`);
    }
    const { template, blocks } = await this.findExpanded(templateId);
    const bag = await this.resolveSourceIds(dto);
    const resolvedBlocks = blocks.map((b) => this.resolveBlockContent(b, bag));
    return this.renderHtml(template, resolvedBlocks, bag);
  }

  /**
   * Parallel lookup of all data sources. Returns flat bag:
   *   `bag.organization = { _id, name, inn, ... }` etc.
   * Empty/invalid ids are silently skipped (defer to per-block resolution
   * which renders empty placeholders).
   *
   * Implementation note: each source is inlined (no shared `add<T>(model: Model<T>, …)`
   * helper) because TypeScript treats `Model<T>` invariant in generic
   * positions when various Mongoose document subtypes flow through, causing
   * TS2345 «not assignable» errors. Inlining avoids the variance problem
   * while keeping identical runtime behaviour.
   */
  private async resolveSourceIds(
    dto: BuildDocumentDto,
  ): Promise<Record<string, unknown>> {
    const bag: Record<string, unknown> = {};
    const lookups: Array<Promise<void>> = [];

    if (dto.organizationId && Types.ObjectId.isValid(dto.organizationId)) {
      lookups.push(
        this.orgModel
          .findById(dto.organizationId)
          .lean()
          .exec()
          .then((doc) => {
            if (doc) bag.organization = doc;
          }),
      );
    }
    if (dto.counterpartyId && Types.ObjectId.isValid(dto.counterpartyId)) {
      lookups.push(
        this.counterpartyModel
          .findById(dto.counterpartyId)
          .lean()
          .exec()
          .then((doc) => {
            if (doc) bag.counterparty = doc;
          }),
      );
    }
    if (dto.productId && Types.ObjectId.isValid(dto.productId)) {
      lookups.push(
        this.productModel
          .findById(dto.productId)
          .lean()
          .exec()
          .then((doc) => {
            if (doc) bag.product = doc;
          }),
      );
    }
    if (dto.materialId && Types.ObjectId.isValid(dto.materialId)) {
      lookups.push(
        this.materialModel
          .findById(dto.materialId)
          .lean()
          .exec()
          .then((doc) => {
            if (doc) bag.material = doc;
          }),
      );
    }
    if (dto.workTypeId && Types.ObjectId.isValid(dto.workTypeId)) {
      lookups.push(
        this.workTypeModel
          .findById(dto.workTypeId)
          .lean()
          .exec()
          .then((doc) => {
            if (doc) bag.workType = doc;
          }),
      );
    }
    if (dto.orderId && Types.ObjectId.isValid(dto.orderId)) {
      lookups.push(
        this.orderModel
          .findById(dto.orderId)
          .lean()
          .exec()
          .then((doc) => {
            if (doc) bag.order = doc;
          }),
      );
    }
    if (dto.contractId && Types.ObjectId.isValid(dto.contractId)) {
      lookups.push(
        this.contractModel
          .findById(dto.contractId)
          .lean()
          .exec()
          .then((doc) => {
            if (doc) bag.contract = doc;
          }),
      );
    }

    await Promise.all(lookups);
    return bag;
  }

  /**
   * For blocks with dataBinding, derive a new block with content replaced.
   * Returns the original block reference if no dataBinding present (pure
   * `{{key.subkey}}` substitution happens inside renderHtml).
   *
   * Type note: spread `{ ...block, content: resolved }` produces a plain
   * object structurally compatible with `TemplateBlockDocument` (consumers
   * in renderHtml only read `content`/`type`/`title` fields). Cast to
   * `TemplateBlockDocument` is required because TS can't infer that
   * a partial-shaped object satisfies the Mongoose Document<T> brand
   * (which carries `$assertPopulated`/`$clone` etc.). Runtime is correct.
   */
  private resolveBlockContent(
    block: TemplateBlockDocument,
    bag: Record<string, unknown>,
  ): TemplateBlockDocument {
    const binding = block.dataBinding;
    if (!binding) return block;

    const resolved = this.resolveBinding(binding, bag);
    if (resolved === undefined) return block;
    return { ...block, content: resolved } as TemplateBlockDocument;
  }

  /**
   * Resolve a single dataBinding to a string value. Returns undefined if
   * neither static nor a successful lookup is possible so the caller can
   * decide whether to mutate the block.
   */
  private resolveBinding(
    binding: DataBinding,
    bag: Record<string, unknown>,
  ): string | undefined {
    // Static literal — explicit user-controlled value
    if (binding.source === 'static') {
      return binding.value ?? '';
    }
    // Sources not implemented in MVP: cost-calculation. Render empty.
    if (binding.source === 'cost-calculation') {
      return '';
    }
    // Live data source lookup
    const entity = bag[binding.source] as Record<string, unknown> | undefined;
    if (!entity) return '';
    if (!binding.field) return '';
    const raw = entity[binding.field];
    return this.formatValue(raw, binding.format);
  }

  /**
   * Apply Intl formatting per dataBinding.format. ru-RU / RUB is the
   * project-wide default. `undefined`/`text` formats pass value through
   * after String() coercion.
   */
  private formatValue(v: unknown, format?: string): string {
    if (v === null || v === undefined) return '';
    if (format === 'currency') {
      const n = typeof v === 'number' ? v : Number(v);
      if (!Number.isFinite(n)) return String(v);
      try {
        return new Intl.NumberFormat('ru-RU', {
          style: 'currency',
          currency: 'RUB',
        }).format(n);
      } catch {
        return String(v);
      }
    }
    if (format === 'date') {
      const d = v instanceof Date ? v : new Date(String(v));
      if (Number.isNaN(d.getTime())) return String(v);
      return d.toLocaleDateString('ru-RU');
    }
    if (format === 'number') {
      const n = typeof v === 'number' ? v : Number(v);
      if (!Number.isFinite(n)) return String(v);
      try {
        return new Intl.NumberFormat('ru-RU').format(n);
      } catch {
        return String(v);
      }
    }
    return String(v);
  }

  // ── TZ-86 legacy preview (kept for backward compat /A.7 manual smoke) ─────

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

  // ── Phase A.6 — Upload background image (TZ-86 §2.6) ─────────────────────────────────

  /**
   * MVP-allowlist: 5 background images per template (Photoshop-style z-axis layers).
   * 6th upload → 409 Conflict. Use a separate DELETE endpoint to remove.
   * Adjust if user feedback changes the limit.
   */
  private static readonly MAX_BACKGROUND_IMAGES = 5;

  /**
   * MIME → extension mapping for generated filenames. NEVER trust
   * `file.originalname` — only safe to derive extension from server-validated
   * MIME (the controller's `fileFilter` enforces this whitelist).
   */
  private static readonly MIME_TO_EXT: Record<string, string> = {
    'image/png': 'png',
    'image/jpeg': 'jpg',
    'image/webp': 'webp',
  };

  /**
   * Persist a background image for this template.
   *
   * Flow:
   *   1. `findById(id)` → validates ObjectId + soft-delete (throws 404 if missing).
   *   2. Enforce 5-image cap (409 if over).
   *   3. Derive safe filesystem path (no user input in filename — UUIDv4 + ext map).
   *   4. Write buffer to disk before DB push — if save() fails we have something
   *      concrete to unlink.
   *   5. Push public URL to `backgroundImage[]` via `doc.save()` so the audit
   *      plugin (`updatedBy` from AsyncLocalStorage) fires the same way as
   *      update()/setDefault().
   *   6. On save() failure → best-effort `fs.unlink()` of the orphan file +
   *      re-throw so the client gets a real error and the disk stays clean.
   *
   * Storage: memoryStorage() upload from controller → `file.buffer` is in RAM.
   * Filename: `${randomUUID()}.${ext}` — collision-free without coordination.
   * URL: `/uploads/document-templates/{id}/{filename}` per main.ts useStaticAssets.
   * Memory footprint: ≤ MAX_FILE_SIZE bytes transiently (5 MB).
   */
  async uploadBackground(
    id: string,
    file: Express.Multer.File,
  ): Promise<string> {
    const doc = await this.findById(id);

    if ((doc.backgroundImage?.length ?? 0) >= DocumentTemplateService.MAX_BACKGROUND_IMAGES) {
      throw new ConflictException(
        `Превышен лимит фоновых изображений (макс. ${DocumentTemplateService.MAX_BACKGROUND_IMAGES}). Удалите одно из существующих, прежде чем добавлять новое.`,
      );
    }

    const ext = DocumentTemplateService.MIME_TO_EXT[file.mimetype];
    if (!ext) {
      // Defense-in-depth: controller's fileFilter already rejects non-whitelisted MIME.
      // Reaching here means someone bypassed the whitelist — fail loudly.
      throw new BadRequestException(
        `Недопустимый MIME-тип файла: ${file.mimetype}. Ожидается image/png | image/jpeg | image/webp.`,
      );
    }

    const filename = `${randomUUID()}.${ext}`;
    const dirPath = join(process.cwd(), 'uploads', 'document-templates', id);
    const filePath = join(dirPath, filename);
    const publicUrl = `/uploads/document-templates/${id}/${filename}`;

    await fs.mkdir(dirPath, { recursive: true });
    await fs.writeFile(filePath, file.buffer);

    try {
      doc.backgroundImage.push(publicUrl);
      await doc.save();
      return publicUrl;
    } catch (err) {
      // Best-effort cleanup of orphan file before surfacing the error.
      await fs.unlink(filePath).catch((unlinkErr) => {
        // Don't shadow the original error — log unlink warning separately.
        // eslint-disable-next-line no-console
        console.warn(
          `[uploadBackground] Failed to unlink orphan file ${filePath}: ${String(unlinkErr)}`,
        );
      });
      throw err;
    }
  }

  async remove(id: string): Promise<void> {
    const doc = await this.findById(id);
    await this.model.deleteOne({ _id: doc._id }).exec();
    await this.blockModel.deleteMany({ templateId: doc._id }).exec();
  }
}
