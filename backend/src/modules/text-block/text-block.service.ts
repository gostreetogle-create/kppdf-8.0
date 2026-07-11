import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  type TextBlockCategory,
  TextBlock,
  type TextBlockDocument,
} from './text-block.schema';
import { CreateTextBlockDto } from './dto/create-text-block.dto';
import { UpdateTextBlockDto } from './dto/update-text-block.dto';

/**
 * TZ-86 Phase A.1 — TextBlock service.
 *
 * CRUD over reusable text chunks. Markdown content stored plain; frontend
 * parser converts at consumption. Slug uniqueness enforced by Mongoose unique
 * index + duplicate-key catch (11000 → ConflictException 409). Soft-delete via
 * project plugin — deleteOne() captures `deletedAt` + audit_log automatically.
 */
@Injectable()
export class TextBlockService {
  constructor(
    @InjectModel(TextBlock.name)
    private readonly model: Model<TextBlockDocument>,
  ) {}

  async create(dto: CreateTextBlockDto): Promise<TextBlockDocument> {
    const slug = dto.slug ?? this.slugify(dto.name);
    const sanitizedTags = (dto.tags ?? []).map((t: string) => this.tagSanitize(t));
    try {
      return await this.model.create({
        name: dto.name,
        slug,
        category: dto.category,
        tags: sanitizedTags,
        content: dto.content,
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
  }): Promise<TextBlockDocument[]> {
    const q: Record<string, unknown> = {};
    if (filter?.category) q.category = filter.category;
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
      try {
        await doc.save();
      } catch (err) {
        if (this.isDuplicateSlug(err)) {
          throw new ConflictException(
            `TextBlock with slug "${dto.slug}" already exists`,
          );
        }
        throw err;
      }
      return doc;
    }
    if (dto.category !== undefined) doc.category = dto.category;
    if (dto.tags !== undefined) {
      doc.tags = dto.tags.map((t: string) => this.tagSanitize(t));
    }
    if (dto.content !== undefined) doc.content = dto.content;
    if (dto.isActive !== undefined) doc.isActive = dto.isActive;
    if (dto.sortOrder !== undefined) doc.sortOrder = dto.sortOrder;
    await doc.save();
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
