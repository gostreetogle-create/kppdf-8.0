import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { randomUUID } from 'node:crypto';
import { join } from 'node:path';
import { promises as fs } from 'node:fs';
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
      settings: this.sanitizeSettings(dto.settings),
      dataBinding: dto.dataBinding,
      layout: dto.layout
        ? (this.assertSupportedPage(dto.layout.page), normalizeBlockLayout(dto.layout))
        : undefined,
      source: this.normalizeSource(dto.source),
      groupId: dto.groupId ?? null,
      locked: dto.locked ?? false,
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
    if (dto.settings !== undefined) doc.settings = this.sanitizeSettings(dto.settings);
    if (dto.dataBinding !== undefined) doc.dataBinding = dto.dataBinding;
    if (dto.layout !== undefined) {
      this.assertSupportedPage(dto.layout.page);
      doc.layout = normalizeBlockLayout({ ...doc.layout, ...dto.layout });
    }
    if (dto.source !== undefined) doc.source = this.normalizeSource(dto.source);
    if (dto.groupId !== undefined) doc.groupId = dto.groupId;
    if (dto.locked !== undefined) doc.locked = dto.locked;
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

  /**
   * TZ-DOC-333 — reject ephemeral image URLs on create/update.
   *
   * `settings.imageUrl` may only be:
   *   - absent / null / ''  → no image (or remove existing);
   *   - a `/uploads/...` path → persisted disk URL (canonical).
   * Anything else (`blob:`, `data:`, absolute http(s), relative paths) is
   * rejected with a 400 and an actionable message. Browser `blob:` URLs are
   * session-local and would render as broken images after reload — the FE
   * must upload via `POST /template-blocks/:id/image` and persist only the
   * returned `/uploads/...` URL.
   */
  private sanitizeSettings(
    settings: Record<string, unknown> | undefined,
  ): Record<string, unknown> | undefined {
    if (!settings) return settings;
    const imageUrl = settings['imageUrl'];
    if (imageUrl === undefined || imageUrl === null || imageUrl === '') {
      return settings;
    }
    if (typeof imageUrl !== 'string') {
      throw new BadRequestException(
        'settings.imageUrl должен быть строкой: пустая строка (удалить фото) или URL вида /uploads/...',
      );
    }
    if (!imageUrl.startsWith('/uploads/')) {
      throw new BadRequestException(
        `settings.imageUrl содержит недопустимый URL. Разрешён только путь вида /uploads/template-blocks/... . Временные blob:/data: URL сохранять нельзя — загрузите файл через POST /template-blocks/:id/image.`,
      );
    }
    if (imageUrl.split('/').includes('..')) {
      throw new BadRequestException(
        'settings.imageUrl содержит недопустимый путь (../): путь не должен покидать каталог /uploads/.',
      );
    }
    return settings;
  }

  /**
   * TZ-DOC-333 — MIME → extension map for generated filenames. NEVER trust
   * `file.originalname`; derive the extension from the server-validated MIME
   * (controller `fileFilter` enforces the whitelist first). Mirrors the
   * DocumentTemplate `uploadBackground` reference implementation.
   */
  private static readonly MIME_TO_EXT: Record<string, string> = {
    'image/png': 'png',
    'image/jpeg': 'jpg',
    'image/webp': 'webp',
  };

  /**
   * Exact shape of a persisted block-photo URL. Used as the ONLY allowlist
   * for the replace-unlink, so `..`/absolute/foreign paths can never escape
   * `uploads/template-blocks/{blockId}/`.
   */
  private static readonly BLOCK_IMAGE_URL_RE =
    /^\/uploads\/template-blocks\/[a-f0-9]{24}\/[a-f0-9-]{36}\.(png|jpg|webp)$/;

  /**
   * TZ-DOC-333 — persist a photo for an image block.
   *
   * Mirror of `DocumentTemplateService.uploadBackground` (canonical storage
   * pattern), with 1 block → 1 «current» imageUrl (replace semantics):
   *
   *   1. `findById(id)` → 404 on missing/invalid block.
   *   2. Derive safe filename `${randomUUID()}.${ext}` (no user input).
   *   3. Write buffer to `uploads/template-blocks/{id}/{filename}` BEFORE the
   *      DB write so a failed save leaves a concrete file to unlink.
   *   4. Set `settings.imageUrl = /uploads/template-blocks/{id}/{filename}`
   *      via `doc.save()` (audit plugin fires the same as update()).
   *   5. Best-effort `fs.unlink()` of the PREVIOUS block image (only paths
   *      inside `/uploads/template-blocks/` are ever touched).
   *   6. On save() failure → best-effort unlink of the orphan file + re-throw.
   *
   * Returns `{ url }` — the shape `TemplateBlocksService.uploadImage` (FE)
   * already expects. main.ts `useStaticAssets` serves `/uploads/*`.
   */
  async uploadImage(id: string, file: Express.Multer.File): Promise<{ url: string }> {
    const doc = await this.findById(id);

    const ext = TemplateBlockService.MIME_TO_EXT[file.mimetype];
    if (!ext) {
      // Defense-in-depth: controller's fileFilter already rejects non-whitelisted MIME.
      throw new BadRequestException(
        `Недопустимый MIME-тип файла: ${file.mimetype}. Ожидается image/png | image/jpeg | image/webp.`,
      );
    }

    const filename = `${randomUUID()}.${ext}`;
    const dirPath = join(process.cwd(), 'uploads', 'template-blocks', id);
    const filePath = join(dirPath, filename);
    const publicUrl = `/uploads/template-blocks/${id}/${filename}`;

    await fs.mkdir(dirPath, { recursive: true });
    await fs.writeFile(filePath, file.buffer);

    try {
      const settings = (doc.settings ?? {}) as Record<string, unknown>;
      const previousUrl = settings['imageUrl'];
      doc.settings = { ...settings, imageUrl: publicUrl };
      await doc.save();

      // Replace semantics: best-effort unlink of the previous block image.
      // STRICT shape check — an attacker-controlled value like
      // /uploads/template-blocks/../../secret must never reach fs.unlink
      // even though sanitizeSettings already rejects `..` on writes (defense
      // in depth for legacy/duplicated records).
      if (
        typeof previousUrl === 'string' &&
        TemplateBlockService.BLOCK_IMAGE_URL_RE.test(previousUrl)
      ) {
        await fs.unlink(join(process.cwd(), previousUrl)).catch(() => {});
      }
      return { url: publicUrl };
    } catch (err) {
      // Best-effort cleanup of the orphan file before surfacing the error.
      await fs.unlink(filePath).catch((unlinkErr) => {
        // Don't shadow the original error.
        // eslint-disable-next-line no-console
        console.warn(
          `[uploadImage] Failed to unlink orphan file ${filePath}: ${String(unlinkErr)}`,
        );
      });
      throw err;
    }
  }

  async remove(id: string): Promise<void> {
    const doc = await this.findById(id);
    await this.model.updateOne({ _id: doc._id }, { $set: { deletedAt: new Date(), isActive: false } }).exec();
  }
}
