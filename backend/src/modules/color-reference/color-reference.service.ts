import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreateColorReferenceDto } from './dto/create-color-reference.dto';
import { UpdateColorReferenceDto } from './dto/update-color-reference.dto';
import {
  ColorReference,
  ColorReferenceDocument,
} from './color-reference.schema';

/** Slug of the seeded system default color «Не выбран». */
export const SYSTEM_DEFAULT_COLOR_SLUG = 'ne-vybran';

export interface ColorReferenceListQuery {
  /** Only active colors (for the product form dropdown). */
  activeOnly?: boolean;
  /** Organization scope of the requesting user; system colors always included. */
  organizationId?: string | null;
  search?: string;
}

/**
 * TZ-PRODUCTS-301 — ColorReferenceService (справочник «Цвета»).
 *
 * Ownership-scoped CRUD, зеркалит TZ-DOC-307/315:
 *   - `resolveDefault(organizationId)` — активный `isDefault` цвет в
 *     org-scope, иначе активный системный «Не выбран» (slug
 *     `SYSTEM_DEFAULT_COLOR_SLUG`). Возвращает null, когда нет ни одного —
 *     вызывающий обязан упасть с 4xx.
 *   - `assertAssignable(colorId, organizationId)` — бросает 4xx, если цвет
 *     не существует / неактивен / принадлежит чужой организации.
 *   - `assertDefaultId(colorId, organizationId)` — бросает 4xx, если
 *     переданный id не является назначаемым default-цветом для области
 *     (используется формами товара: default-выбор должен существовать и
 *     быть активным в scope).
 *   - `update`/`remove` принимают organizationId вызывающего и отказывают
 *     (403) для цвета чужой области — IDOR guard.
 *   - `remove(id)` — 409 для system-цветов (seed-managed) и если цвет
 *     используется товарами (зарезервировано; в этой задаче товары не
 *     ссылаются — при появлении ссылок дополнить проверкой).
 *   - Soft delete: remove() ставит deletedAt (counterparty-паттерн);
 *     findAll/findById исключают удалённые.
 *
 * Uniqueness: compound unique index {organizationId, slug} (schema);
 * duplicate-key → 409 Conflict.
 */
@Injectable()
export class ColorReferenceService {
  private readonly logger = new Logger(ColorReferenceService.name);

  constructor(
    @InjectModel(ColorReference.name)
    private readonly model: Model<ColorReferenceDocument>,
  ) {}

  private toOrgId(organizationId?: string | null): Types.ObjectId | undefined {
    if (!organizationId || !Types.ObjectId.isValid(organizationId)) return undefined;
    return new Types.ObjectId(organizationId);
  }

  /** Slugify (mirrors TZ-DOC-307): lowercase + Russian→Latin + kebab. */
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
    return cleaned || `color-${Date.now().toString(36)}`;
  }

  /** Escape user input for safe inclusion in a RegExp (mirrors CategoryService). */
  private escapeRegex(s: string): string {
    return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  async create(
    dto: CreateColorReferenceDto,
    organizationId?: string | null,
  ): Promise<ColorReferenceDocument> {
    const org = this.toOrgId(organizationId);
    const slug = dto.slug ?? this.slugify(dto.name);
    const existing = await this.model
      .findOne({ organizationId: org, slug, deletedAt: null })
      .exec();
    if (existing) {
      throw new ConflictException(
        `Цвет с ключом «${slug}» уже существует в этой области`,
      );
    }
    const doc = await this.model.create({
      name: dto.name,
      slug,
      hex: dto.hex,
      description: dto.description,
      isActive: dto.isActive ?? true,
      isDefault: dto.isDefault ?? false,
      sortOrder: dto.sortOrder ?? 0,
      organizationId: org,
      isSystem: false,
    });
    this.logger.log(`Created color reference ${slug}`);
    return doc;
  }

  /**
   * List colors visible to the requesting org: the org's own colors plus
   * every system/global color. Never leaks another org's colors.
   * Soft-deleted excluded. Search by name/slug merged with org-scope $or.
   */
  async findAll(
    query: ColorReferenceListQuery = {},
  ): Promise<ColorReferenceDocument[]> {
    const filter: Record<string, unknown> = { deletedAt: null };
    if (query.activeOnly === true) filter.isActive = true;

    const scope: Record<string, unknown>[] = [];
    if (query.organizationId) {
      const org = this.toOrgId(query.organizationId);
      scope.push(
        { organizationId: org },
        { organizationId: { $exists: false } },
      );
    }

    if (query.search) {
      const safeTerm = this.escapeRegex(query.search);
      const re = new RegExp(safeTerm, 'i');
      const searchCond = { $or: [{ name: re }, { slug: re }] };
      if (scope.length > 0) {
        filter.$and = [searchCond, { $or: scope }];
      } else {
        filter.$or = [searchCond];
      }
    } else if (scope.length > 0) {
      filter.$or = scope;
    }

    return this.model.find(filter).sort({ sortOrder: 1, name: 1 }).exec();
  }

  async findById(id: string): Promise<ColorReferenceDocument> {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException(`ColorReference ${id} not found`);
    }
    const doc = await this.model.findOne({ _id: id, deletedAt: null }).exec();
    if (!doc) throw new NotFoundException(`ColorReference ${id} not found`);
    return doc;
  }

  /** IDOR guard: only the owning org (or a system caller) may manage a color. */
  private assertCallerCanManage(
    doc: ColorReferenceDocument,
    organizationId?: string | null,
  ): void {
    if (!organizationId) return; // system caller → full access
    if (doc.organizationId && String(doc.organizationId) !== organizationId) {
      throw new ForbiddenException(
        `Цвет «${doc.name}» принадлежит другой организации`,
      );
    }
  }

  async update(
    id: string,
    dto: UpdateColorReferenceDto,
    organizationId?: string | null,
  ): Promise<ColorReferenceDocument> {
    const doc = await this.findById(id);
    this.assertCallerCanManage(doc, organizationId);
    if (doc.isSystem) {
      throw new ConflictException(
        `Системный цвет «${doc.name}» изменять нельзя — он управляется сервером`,
      );
    }
    const newSlug = dto.slug ?? doc.slug;
    if (dto.slug !== undefined && dto.slug !== doc.slug) {
      const org = doc.organizationId ?? undefined;
      const existing = await this.model
        .findOne({ _id: { $ne: doc._id }, organizationId: org, slug: newSlug, deletedAt: null })
        .exec();
      if (existing) {
        throw new ConflictException(
          `Цвет с ключом «${newSlug}» уже существует в этой области`,
        );
      }
    }
    if (dto.name !== undefined) doc.name = dto.name;
    if (dto.slug !== undefined) doc.slug = dto.slug;
    if (dto.hex !== undefined) doc.hex = dto.hex;
    if (dto.description !== undefined) doc.description = dto.description;
    if (dto.isActive !== undefined) doc.isActive = dto.isActive;
    if (dto.isDefault !== undefined) doc.isDefault = dto.isDefault;
    if (dto.sortOrder !== undefined) doc.sortOrder = dto.sortOrder;
    return doc.save();
  }

  async remove(id: string, organizationId?: string | null): Promise<void> {
    const doc = await this.findById(id);
    this.assertCallerCanManage(doc, organizationId);
    if (doc.isSystem) {
      throw new ConflictException(
        `Системный цвет «${doc.name}» удалить нельзя`,
      );
    }
    // NOTE: when products start referencing ColorReference (TZ-PRODUCTS-302),
    // add a 409 in-use guard here (mirror document-template-category.remove).
    await this.model
      .updateOne({ _id: doc._id }, { $set: { deletedAt: new Date() } })
      .exec();
  }

  /**
   * Server-side default color for product forms (TZ-PRODUCTS-301):
   *   1. active org-scoped color marked `isDefault`;
   *   2. active system «Не выбран» (slug SYSTEM_DEFAULT_COLOR_SLUG).
   * Returns null when neither exists — caller MUST fail with 4xx.
   */
  async resolveDefault(
    organizationId?: string | null,
  ): Promise<ColorReferenceDocument | null> {
    if (organizationId && Types.ObjectId.isValid(organizationId)) {
      const orgDefault = await this.model
        .findOne({
          organizationId: new Types.ObjectId(organizationId),
          isActive: true,
          isDefault: true,
          deletedAt: null,
        })
        .sort({ sortOrder: 1 })
        .exec();
      if (orgDefault) return orgDefault;
    }
    return this.model
      .findOne({
        organizationId: { $exists: false },
        isActive: true,
        isDefault: true,
        deletedAt: null,
      })
      .sort({ sortOrder: 1 })
      .exec();
  }

  /**
   * Validates that a product form may reference this color as DEFAULT:
   * exists + active + same org scope (or system) + isDefault-назначен
   * (org-scoped isDefault, либо системный «Не выбран»).
   * Throws NotFoundException (missing) or BadRequestException
   * (inactive / foreign org / not a default).
   */
  async assertDefaultId(
    colorId: string,
    organizationId?: string | null,
  ): Promise<ColorReferenceDocument> {
    const doc = await this.assertAssignable(colorId, organizationId);
    if (!doc.isDefault) {
      throw new BadRequestException(
        `Цвет «${doc.name}» не назначен цветом по умолчанию`,
      );
    }
    return doc;
  }

  /**
   * Validates that a product form may reference this color:
   * exists + active + same org scope (or system/global).
   * Throws NotFoundException (missing) or BadRequestException
   * (inactive / foreign org) — both are testable 4xx.
   */
  async assertAssignable(
    colorId: string,
    organizationId?: string | null,
  ): Promise<ColorReferenceDocument> {
    if (!Types.ObjectId.isValid(colorId)) {
      throw new BadRequestException(`Invalid colorId ${colorId}`);
    }
    const doc = await this.model.findOne({ _id: colorId, deletedAt: null }).exec();
    if (!doc) {
      throw new NotFoundException(`Цвет ${colorId} не найден`);
    }
    if (!doc.isActive) {
      throw new BadRequestException(
        `Цвет «${doc.name}» неактивен — выберите активный цвет`,
      );
    }
    const org = organizationId ? String(organizationId) : '';
    if (doc.organizationId && String(doc.organizationId) !== org) {
      throw new BadRequestException(
        `Цвет «${doc.name}» принадлежит другой организации`,
      );
    }
    return doc;
  }
}
