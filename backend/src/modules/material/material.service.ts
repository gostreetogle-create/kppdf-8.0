import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreateMaterialDto } from './dto/create-material.dto';
import { UpdateMaterialDto } from './dto/update-material.dto';
import { Material, MaterialDocument } from './material.schema';
import { CounterService } from '../counter/counter.service';
import { Category, CategoryDocument } from '../category/category.schema';

@Injectable()
export class MaterialService {
  private readonly logger = new Logger(MaterialService.name);

  constructor(
    @InjectModel(Material.name) private readonly model: Model<MaterialDocument>,
    @InjectModel(Category.name) private readonly categoryModel: Model<CategoryDocument>,
    private readonly counter: CounterService,
  ) {}

  async create(dto: CreateMaterialDto): Promise<MaterialDocument> {
    let sku = dto.sku;
    const category = dto.categoryId
      ? await this.loadAssignableMaterialCategory(dto.categoryId)
      : null;
    if (!sku && category) {
      if (!category.skuPrefix) {
        throw new BadRequestException(
          `У категории «${category.name}» не настроен префикс внутреннего кода материала`,
        );
      }
      sku = await this.counter.next('Material', category.skuPrefix);
    }

    try {
      return await this.model.create({ ...dto, sku });
    } catch (err) {
      this.rethrowDuplicateSku(err);
    }
  }

  async findAll(q: { page?: number; limit?: number; search?: string; categoryId?: string; supplierId?: string } = {}) {
    const page = Math.max(1, q.page ?? 1);
    const limit = Math.min(100, Math.max(1, q.limit ?? 20));
    const filter: Record<string, unknown> = {};
    if (q.search) {
      const escaped = q.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const re = new RegExp(escaped, 'i');
      filter.$or = [{ name: re }, { article: re }, { sku: re }];
    }
    if (q.categoryId) filter.categoryId = new Types.ObjectId(q.categoryId);
    if (q.supplierId) filter.supplierId = new Types.ObjectId(q.supplierId);
    const [items, total] = await Promise.all([
      this.model.find(filter)
        .populate('categoryId')
        .populate('photoIds')
        .populate('mainPhotoId')
        .populate('supplierId')
        .sort({ name: 1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean()
        .exec(),
      this.model.countDocuments(filter).exec(),
    ]);
    return { items, total, page, limit };
  }

  async findById(id: string): Promise<MaterialDocument> {
    if (!Types.ObjectId.isValid(id)) throw new NotFoundException(`Material ${id} not found`);
    const doc = await this.model.findById(id)
      .populate('categoryId')
      .populate('photoIds')
      .populate('mainPhotoId')
      .populate('supplierId')
      .exec();
    if (!doc) throw new NotFoundException(`Material ${id} not found`);
    return doc;
  }

  async update(id: string, dto: UpdateMaterialDto): Promise<MaterialDocument> {
    if (!Types.ObjectId.isValid(id)) throw new NotFoundException(`Material ${id} not found`);
    if (dto.categoryId) await this.loadAssignableMaterialCategory(dto.categoryId);
    const doc = await this.model.findById(id).exec();
    if (!doc) throw new NotFoundException(`Material ${id} not found`);
    Object.assign(doc, dto);
    try {
      return await doc.save();
    } catch (err) {
      this.rethrowDuplicateSku(err);
    }
  }

  private async loadAssignableMaterialCategory(categoryId: string): Promise<CategoryDocument> {
    const category = await this.categoryModel.findById(categoryId).exec();
    if (!category) {
      throw new BadRequestException(`Категория материала ${categoryId} не найдена`);
    }
    if (category.type !== 'material' || category.isActive === false) {
      throw new BadRequestException(
        `Категория «${category.name}» недоступна для создания материала`,
      );
    }
    return category;
  }

  /** Map Mongo duplicate-key errors to the API's conflict contract. */
  private rethrowDuplicateSku(err: unknown): never {
    const code = (err as { code?: number })?.code;
    if (code === 11000) {
      throw new ConflictException('Материал с таким внутренним кодом уже существует');
    }
    throw err;
  }

  async remove(id: string): Promise<void> {
    if (!Types.ObjectId.isValid(id)) throw new NotFoundException(`Material ${id} not found`);
    const doc = await this.model.findById(id).exec();
    if (!doc) throw new NotFoundException(`Material ${id} not found`);
    await this.model
      .updateOne({ _id: doc._id }, { $set: { deletedAt: new Date() } })
      .exec();
  }

  /**
   * TZ-MATERIALS-310: server-side duplicate of a material record.
   *
   * Contract (mirrors DocumentTemplate duplicate + ProductService patterns):
   *  - new `_id` (auto); `name` becomes `${oldName} (копия)`, truncated to 256
   *    to honour the schema Length(1,256) constraint;
   *  - `sku`: regenerated via CounterService if the source's `categoryId`
   *    is assignable AND has a non-empty `skuPrefix` — otherwise the clone
   *    is left without an internal code so the user can fill it in (avoids
   *    forcing a code from an unconnected default counter);
   *  - `article`: copied as-is (user-controlled, may repeat);
   *  - `<all other scalar fields>`: copied verbatim;
   *  - `photoIds`/`mainPhotoId`: explicitly NOT copied — photos are
   *    managed separately and must be re-uploaded by the user to avoid
   *    orphan references / mixed-upload conflicts (TZ-MATERIALS-306
   *    contract follows the same rationale as PhotoModuleDocument);
   *  - `createdAt`/`updatedAt`/`organizationId`/`isSystem`/`deletedAt`:
   *    intentionally dropped — clone inherits current org/user context at
   *    create time and auto timestamps.
   *
   * Audit: `@AuditAction({ action: 'duplicate' })` at the controller
   * records the source id and the new clone's id.
   */
  async duplicate(sourceId: string): Promise<MaterialDocument> {
    if (!Types.ObjectId.isValid(sourceId)) {
      throw new NotFoundException(`Material ${sourceId} not found`);
    }
    const source = await this.model.findById(sourceId).exec();
    if (!source) throw new NotFoundException(`Material ${sourceId} not found`);

    const sourceObj = (source.toObject
      ? source.toObject()
      : source) as unknown as Record<string, unknown>;
    const {
      _id: _ignoredId,
      sku: _ignoredSourceSku,
      photoIds: _ignoredPhotos,
      mainPhotoId: _ignoredMainPhoto,
      deletedAt: _ignoredDeletedAt,
      createdAt: _ignoredCreatedAt,
      updatedAt: _ignoredUpdatedAt,
      organizationId: _legacy_org,
      isSystem: _ignoredIsSystem,
      ...copiableFields
    } = sourceObj;

    const baseName = String(copiableFields.name ?? 'Материал');
    const SUFFIX = ' (копия)';
    const copiedName =
      baseName.length + SUFFIX.length <= 256
        ? `${baseName}${SUFFIX}`
        : `${baseName.slice(0, 256 - SUFFIX.length)}${SUFFIX}`;

    // Regenerate SKU only when the source has a material category with a prefix.
    // If the category lookup fails for any reason (e.g. category was deleted),
    // we deliberately leave the clone sku-less — the user can fix in the
    // edit dialog. This matches the safe-fallback policy of create().
    let nextSku: string | undefined;
    const rawCatId = copiableFields.categoryId;
    if (rawCatId) {
      const categoryId = String(
        (rawCatId as Types.ObjectId)?.toString?.() ?? rawCatId,
      );
      try {
        const category = await this.loadAssignableMaterialCategory(categoryId);
        if (category.skuPrefix) {
          nextSku = await this.counter.next('Material', category.skuPrefix);
        }
      } catch {
        // Counter / category lookup failure SHOULD NOT block duplication —
        // user can edit the resulting record to assign a code later.
        nextSku = undefined;
      }
    }

    const payload: Record<string, unknown> = {
      ...copiableFields,
      name: copiedName,
      ...(nextSku ? { sku: nextSku } : {}),
      photoIds: [],
      mainPhotoId: undefined,
    };

    try {
      return await this.model.create(payload);
    } catch (err) {
      this.rethrowDuplicateSku(err);
    }
  }
}
