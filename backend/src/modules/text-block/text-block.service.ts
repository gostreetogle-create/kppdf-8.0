import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { TextBlockCategoryService } from '../text-block-category/text-block-category.service';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  type TextBlockCategory,
  TextBlock,
  type TextBlockDocument,
} from './text-block.schema';
import { SYSTEM_DEFAULT_TEXT_BLOCK_CATEGORY_SLUG } from '../text-block-category/text-block-category.schema';
import { CreateTextBlockDto } from './dto/create-text-block.dto';
import { UpdateTextBlockDto } from './dto/update-text-block.dto';
import { sanitizeHtml, sanitizeBlockContent } from '../../common/sanitize-html';

/**
 * TZ-86 Phase A.1 — TextBlock service.
 *
 * CRUD over reusable text chunks. Markdown content stored plain; frontend
 * parser converts at consumption. Slug uniqueness enforced by Mongoose unique
 * index + duplicate-key catch (11000 → ConflictException 409). Soft-delete via
 * project plugin — deleteOne() captures `deletedAt` + audit_log automatically.
 *
 * TZ-DOC-322 — categoryId resolution contract:
 *  - `dto.categoryId` caller-supplied → `TextBlockCategoryService.assertAssignable()`.
 *  - else → `TextBlockCategoryService.resolveDefault(organizationId)`.
 *    Returns null only when the AppModule-wired seed
 *    (`TextBlockCategoriesSeed`, TZ-DOC-321) did not run or was
 *    deactivated by an administrator — in that case we surface a
 *    deterministic 4xx so ops notices missing-default-category instead
 *    of silently self-healing via a hidden upsert (TZ-DOC-320 ladder).
 *  - The legacy `dto.category` enum ('legal'|'intro'|'outro'|'custom')
 *    is accepted by the DTO and persisted on the schema's `category`
 *    field for backward compatibility, but no longer affects
 *    `categoryId` lookup. Removal is the responsibility of TZ-DOC-318.
 */
@Injectable()
export class TextBlockService {
  constructor(
    @InjectModel(TextBlock.name)
    private readonly model: Model<TextBlockDocument>,
    private readonly categoryService: TextBlockCategoryService,
  ) {}

  async create(
    dto: CreateTextBlockDto,
    organizationId?: string | null,
  ): Promise<TextBlockDocument> {
    const slug = dto.slug ?? this.slugify(dto.name);
    const sanitizedTags = (dto.tags ?? []).map((t: string) => this.tagSanitize(t));

    let categoryId: Types.ObjectId;
    if (dto.categoryId) {
      const cat = await this.categoryService.assertAssignable(
        dto.categoryId,
        organizationId ?? '',
      );
      categoryId = cat._id;
    } else {
      // TZ-DOC-322 — explicit contract: rely on the seed-inserted system
      // «Общее» (TZ-DOC-321). When it is missing, fail loudly rather than
      // silently upsert in the service path.
      const def = await this.categoryService.resolveDefault(organizationId);
      if (!def) {
        throw new BadRequestException(
          `Default text-block category unavailable. The AppModule-wired ` +
            `TextBlockCategoriesSeed (slug SYSTEM_DEFAULT_TEXT_BLOCK_CATEGORY_SLUG) ` +
            `must be present and active. Run the seed or activate the system default in ` +
            `the dictionary.`,
        );
      }
      categoryId = def._id;
    }

    try {
      return await this.model.create({
        name: dto.name,
        slug,
        category: dto.category ?? 'custom',
        categoryId,
        tags: sanitizedTags,
        content: sanitizeHtml(dto.content ?? ''),
        columns: (dto.columns ?? []).map((c) => ({
          ...c,
          content: sanitizeBlockContent(c.content ?? ''),
        })),
        isActive: dto.isActive ?? true,
        sortOrder: dto.sortOrder ?? 0,
      });
    } catch (err) {
      if (this.isDuplicateSlug(err)) {
        throw new ConflictException(
          `TextBlock with slug "${slug}" already exists`,
        );
      }
      throw err;
    }
  }

  async findAll(filter?: {
    category?: TextBlockCategory;
    isActive?: boolean;
    categoryId?: string;
  }): Promise<TextBlockDocument[]> {
    const q: Record<string, unknown> = {};
    if (filter?.category) q.category = filter.category;
    if (filter?.categoryId) {
      if (!Types.ObjectId.isValid(filter.categoryId)) {
        throw new BadRequestException(`Invalid categoryId ${filter.categoryId}`);
      }
      q.categoryId = new Types.ObjectId(filter.categoryId);
    }
    if (typeof filter?.isActive === 'boolean') q.isActive = filter.isActive;
    return this.model
      .find(q)
      .sort({ category: 1, sortOrder: 1, name: 1 })
      .exec();
  }

  async findById(id: string): Promise<TextBlockDocument> {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException(`TextBlock ${id} not found`);
    }
    const doc = await this.model.findById(id).exec();
    if (!doc) throw new NotFoundException(`TextBlock ${id} not found`);
    return doc;
  }

  async update(
    id: string,
    dto: UpdateTextBlockDto,
  ): Promise<TextBlockDocument> {
    const doc = await this.findById(id);
    if (dto.name !== undefined) doc.name = dto.name;
    if (dto.slug !== undefined && dto.slug !== doc.slug) {
      doc.slug = dto.slug;
      // Mark slug change but DO NOT return early — the rest of the dto
      // fields (content, columns, isActive, sortOrder, category, tags)
      // must still be applied. The single atomic `doc.save()` at the
      // end below enforces the slug unique index in one go.
    }
    if (dto.category !== undefined) doc.category = dto.category;
    if (dto.tags !== undefined) {
      doc.tags = dto.tags.map((t: string) => this.tagSanitize(t));
    }
    if (dto.content !== undefined) doc.content = sanitizeHtml(dto.content);
    if (dto.columns !== undefined) {
      doc.columns = dto.columns.map((c) => ({
        ...c,
        content: sanitizeBlockContent(c.content ?? ''),
      })) as any;
    }
    if (dto.isActive !== undefined) doc.isActive = dto.isActive;
    if (dto.sortOrder !== undefined) doc.sortOrder = dto.sortOrder;
    // Single atomic save at the end — slug uniqueness is enforced by the
    // unique index; if it collides Mongoose throws E11000 and we surface
    // it as ConflictException.
    try {
      await doc.save();
    } catch (err) {
      if (this.isDuplicateSlug(err)) {
        throw new ConflictException(
          `TextBlock with slug "${doc.slug}" already exists`,
        );
      }
      throw err;
    }
    return doc;
  }

  async remove(id: string): Promise<void> {
    const doc = await this.findById(id);
    await this.model.deleteOne({ _id: doc._id }).exec();
    // softDelete plugin captures deletedAt + audit_log automatically.
  }

  // ── helpers ────────────────────────────────────────────────────────────────────────

  /** Slugify: lowercase + transliterate Russian→Latin + kebab. Conservative map for MVP. */
  private slugify(name: string): string {
    const map: Record<string, string> = {
      а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', е: 'e', ё: 'yo', ж: 'zh',
      з: 'z', и: 'i', й: 'i', к: 'k', л: 'l', м: 'm', н: 'n', о: 'o',
      п: 'p', р: 'r', с: 's', т: 't', у: 'u', ф: 'f', х: 'h', ц: 'ts',
      ч: 'ch', ш: 'sh', щ: 'shch', ъ: '', ы: 'y', ь: '', э: 'e', ю: 'yu',
      я: 'ya',
    };
    const cleaned = name
      .toLowerCase()
      .split('')
      .map((ch) => map[ch] ?? ch)
      .join('')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
    return cleaned || `block-${Date.now().toString(36)}`;
  }

  /** Tag sanitisation: kebab-case, lowercase, max 30 chars. */
  private tagSanitize(t: string): string {
    return t
      .toLowerCase()
      .replace(/[^a-zа-я0-9\s-]/gi, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 30);
  }

  /** Mongoose duplicate-key error code (MongoServerError). */
  private isDuplicateSlug(err: unknown): boolean {
    return (
      err instanceof Error &&
      'code' in err &&
      (err as { code?: number }).code === 11000
    );
  }
}
