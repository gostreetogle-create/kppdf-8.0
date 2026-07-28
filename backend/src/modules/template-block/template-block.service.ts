import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { promises as fs } from 'fs';
import { join } from 'path';
import { randomUUID } from 'crypto';
import { TemplateBlock, TemplateBlockDocument } from './template-block.schema';
import { CreateTemplateBlockDto } from './dto/create-template-block.dto';
import { UpdateTemplateBlockDto } from './dto/update-template-block.dto';
import { sanitizeHtml, sanitizeBlockContent } from '../../common/sanitize-html';

/** Allowed MIME types for image upload (kept in sync with frontend `ALLOWED` list). */
const ALLOWED_IMAGE_MIME = new Set([
  'image/png',
  'image/jpeg',
  'image/webp',
]);

/** Maps accepted MIME type → on-disk file extension. */
const MIME_TO_EXT: Record<string, string> = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/webp': 'webp',
};

/** Max file size (5 MB) — kept in sync with frontend `onPhotoFileSelected` guard. */
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;

/** Relative URL prefix used in templates. Frontend prepends `API_BASE_URL`. */
const UPLOAD_URL_PREFIX = '/uploads/document-templates';

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
      content: sanitizeHtml(dto.content ?? ''),
      columns: dto.columns?.map((c) => ({
        id: c.id,
        content: sanitizeBlockContent(c.content || ''),
        width: c.width ?? 1,
      })),
      height: dto.height,
      showLine: dto.showLine ?? false,
      settings: dto.settings,
      dataBinding: dto.dataBinding,
      isActive: dto.isActive ?? true,
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
    if (dto.content !== undefined) doc.content = sanitizeHtml(dto.content);
    if (dto.columns !== undefined) {
      doc.columns = dto.columns.map((c) => ({
        id: c.id,
        content: sanitizeBlockContent(c.content || ''),
        width: c.width ?? 1,
      }));
    }
    if (dto.height !== undefined) doc.height = dto.height;
    if (dto.showLine !== undefined) doc.showLine = dto.showLine;
    if (dto.settings !== undefined) doc.settings = dto.settings;
    if (dto.dataBinding !== undefined) doc.dataBinding = dto.dataBinding;
    if (dto.isActive !== undefined) doc.isActive = dto.isActive;
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

  /**
   * TZ-251 — Backend image upload endpoint for TemplateBlock.
   *
   * Accepts a single image file via `multipart/form-data` (form field name
   * `file`). Writes to `./uploads/document-templates/<blockId>/<uuid>.<ext>`
   * (per-block subdirectory → easy folder-level cleanup on hard delete) and
   * returns the relative URL the frontend prepends with `API_BASE_URL`.
   *
   * Validation is enforced in TWO places:
   *   1. `FileInterceptor({ fileFilter, limits })` in the controller rejects
   *      bad MIME (400) or oversize (413) before this method is called.
   *   2. This method adds defense-in-depth: re-checks MIME/size, validates
   *      the block exists (404), creates the destination dir, writes the
   *      file. Frontend behavior (blob URL → http URL patch on success) lives
   *      in `frontend/src/app/pages/doc-constructor/builder/builder.page.ts`.
   *
   * Mongoose schema's `settings: Mixed` already accepts arbitrary URL strings;
   * the consumer (`Settings.imageUrl`) is patched by frontend via the standard
   * PATCH `/template-blocks/:id` endpoint after `uploadImage` returns.
   *
   * Returns: `{ url: '/uploads/document-templates/<blockId>/<uuid>.<ext>' }`.
   */
  async uploadImage(
    blockId: string,
    file: Express.Multer.File,
  ): Promise<{ url: string }> {
    if (!file) {
      throw new BadRequestException('No file uploaded (field name must be "file")');
    }
    if (!ALLOWED_IMAGE_MIME.has(file.mimetype)) {
      throw new BadRequestException(
        `Unsupported MIME type: ${file.mimetype}. Allowed: PNG, JPEG, WEBP`,
      );
    }
    if (file.size > MAX_FILE_SIZE_BYTES) {
      throw new BadRequestException(`File exceeds ${MAX_FILE_SIZE_BYTES} bytes`);
    }

    // Verify the block exists → 404 if not (mirrors PhotosService.findById).
    await this.findById(blockId);

    const ext = MIME_TO_EXT[file.mimetype];
    const filename = `${randomUUID()}.${ext}`;
    const dir = join(process.cwd(), 'uploads', 'document-templates', blockId);
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(join(dir, filename), file.buffer);

    return { url: `${UPLOAD_URL_PREFIX}/${blockId}/${filename}` };
  }
}
