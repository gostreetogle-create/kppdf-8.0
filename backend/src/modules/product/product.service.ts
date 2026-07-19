import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CounterService } from '../counter/counter.service';
import { Category, CategoryDocument } from '../category/category.schema';
import { InjectModel as InjectCategoryModel } from '@nestjs/mongoose';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product, ProductDocument } from './product.schema';
import {
  ProductModule as ProductModuleEntity,
  ProductModuleDocument,
} from '../product-module/product-module.schema';
import { EavService } from '../../common/eav/eav.service';

@Injectable()
export class ProductService {
  private readonly logger = new Logger(ProductService.name);

  constructor(
    @InjectModel(Product.name) private readonly model: Model<ProductDocument>,
    @InjectCategoryModel(Category.name) private readonly categoryModel: Model<CategoryDocument>,
    // TZ-83 Фаза D.3: ProductModule model инжектится для existence-check
    // в attachModule (Review #3: предотвращает dangling ObjectId).
    @InjectModel(ProductModuleEntity.name)
    private readonly productModuleModel: Model<ProductModuleDocument>,
    private readonly counter: CounterService,
    private readonly eav: EavService,
  ) {}

  async create(dto: CreateProductDto): Promise<ProductDocument> {
    let sku = dto.sku;
    if (!sku && dto.categoryId) {
      const cat = await this.categoryModel.findById(dto.categoryId).exec();
      if (!cat) throw new BadRequestException(`Category ${dto.categoryId} not found`);
      const seq = await this.counter.next('Product', cat.skuPrefix);
      sku = seq; // e.g. "PRODUCT-2026-001"
    }
    const { attributes, ...rest } = dto;
    const doc = await this.model.create({ ...rest, sku });
    if (attributes && Object.keys(attributes).length > 0) {
      const catId = doc.categoryId ? new Types.ObjectId(doc.categoryId as unknown as string) : undefined;
      await this.eav.resolveAttributes('Product', doc._id, attributes, catId);
    }
    return doc;
  }

  async findAll(q: {
    page?: number; limit?: number; search?: string;
    categoryId?: string; status?: string; isActive?: boolean;
    sortBy?: string; sortOrder?: 'asc' | 'desc';
  } = {}) {
    const page = Math.max(1, q.page ?? 1);
    const limit = Math.min(100, Math.max(1, q.limit ?? 20));
    const filter: Record<string, unknown> = {};
    if (q.search) {
      const re = new RegExp(q.search, 'i');
      filter.$or = [{ name: re }, { sku: re }];
    }
    if (q.categoryId) filter.categoryId = new Types.ObjectId(q.categoryId);
    if (q.status) filter.status = q.status;
    if (typeof q.isActive === 'boolean') filter.isActive = q.isActive;

    const sortField = q.sortBy ?? 'createdAt';
    const sortOrder = q.sortOrder === 'asc' ? 1 : -1;

    const [items, total] = await Promise.all([
      this.model.find(filter)
        .populate('categoryId')
        .populate('photoIds')
        .populate('productModuleIds')
        .sort({ [sortField]: sortOrder })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean()
        .exec(),
      this.model.countDocuments(filter).exec(),
    ]);
    return { items, total, page, limit };
  }

  async findById(id: string): Promise<ProductDocument & { attributes?: Record<string, unknown> }> {
    if (!Types.ObjectId.isValid(id)) throw new NotFoundException(`Product ${id} not found`);
    const doc = await this.model.findById(id)
      .populate('categoryId')
      .populate('photoIds')
      // TZ-83 Review #1: nested populate для productModuleIds[] → детальная
      // страница /products/:id показывает названия материалов/работ, а не
      // (id 507f…) строки. Раньше верхне-уровневый populate возвращал массив
      // ProductModule документов, но их подмассивы workTypes.workTypeId и
      // materials.materialId оставались ObjectId-строками. Теперь — full tree.
      .populate({
        path: 'productModuleIds',
        populate: [
          { path: 'workTypes.workTypeId', model: 'WorkType' },
          { path: 'materials.materialId', model: 'Material', select: 'name photoIds unit' },
        ],
      })
      .exec();
    if (!doc) throw new NotFoundException(`Product ${id} not found`);
    const attributes = await this.eav.loadAttributes('Product', doc._id);
    return Object.assign(doc, { attributes });
  }

  async update(id: string, dto: UpdateProductDto): Promise<ProductDocument> {
    if (!Types.ObjectId.isValid(id)) throw new NotFoundException(`Product ${id} not found`);
    const doc = await this.model.findById(id).exec();
    if (!doc) throw new NotFoundException(`Product ${id} not found`);
    const { attributes, ...rest } = dto;
    Object.assign(doc, rest);
    const saved = await doc.save();
    if (attributes && Object.keys(attributes).length > 0) {
      const catId = saved.categoryId ? new Types.ObjectId(saved.categoryId as unknown as string) : undefined;
      await this.eav.resolveAttributes('Product', saved._id, attributes, catId);
    }
    return saved;
  }

  async remove(id: string): Promise<void> {
    if (!Types.ObjectId.isValid(id)) throw new NotFoundException(`Product ${id} not found`);
    const doc = await this.model.findById(id).exec();
    if (!doc) throw new NotFoundException(`Product ${id} not found`);
    await this.model
      .updateOne({ _id: doc._id }, { $set: { deletedAt: new Date() } })
      .exec();
  }

  /**
   * TZ-83 Фаза D.3: atomic attach — MongoDB `$addToSet` гарантирует
   * idempotency + race-condition-safety. В отличие от naive PATCH
   * с заменой всего `productModuleIds[]` здесь нельзя потерять
   * параллельные изменения от другого пользователя.
   *
   * Возвращаем обновлённый документ с populated modules и их main photo
   * — чтобы UI мог сразу обновить список без дополнительного GET.
   */
  async attachModule(productId: string, moduleId: string): Promise<ProductDocument> {
    if (!Types.ObjectId.isValid(productId) || !Types.ObjectId.isValid(moduleId)) {
      throw new BadRequestException('Invalid productId or moduleId');
    }
    // TZ-83 Review #3: existence-check предотвращает dangling ObjectId в
    // productModuleIds[] (race-safe: другой пользователь мог параллельно
    // удалить модуль, мы не должны оставлять ссылку на мёртвый id).
    const moduleExists = await this.productModuleModel
      .exists({ _id: new Types.ObjectId(moduleId) })
      .exec();
    if (!moduleExists) {
      throw new NotFoundException(`ProductModule ${moduleId} not found`);
    }
    const doc = await this.model
      .findByIdAndUpdate(
        productId,
        { $addToSet: { productModuleIds: new Types.ObjectId(moduleId) } },
        { new: true },
      )
      .populate('categoryId')
      .populate('photoIds')
      .populate({
        path: 'productModuleIds',
        populate: [
          { path: 'workTypes.workTypeId', model: 'WorkType' },
          // TZ-83 Review #2: добавляем materials.materialId в chain чтобы
          // детальная страница получала populated данные без отдельного GET.
          {
            path: 'materials.materialId',
            model: 'Material',
            select: 'name photoIds unit',
          },
        ],
      })
      .exec();
    if (!doc) throw new NotFoundException(`Product ${productId} not found`);
    return doc;
  }

  async detachModule(productId: string, moduleId: string): Promise<void> {
    if (!Types.ObjectId.isValid(productId) || !Types.ObjectId.isValid(moduleId)) {
      throw new BadRequestException('Invalid productId or moduleId');
    }
    const result = await this.model
      .updateOne(
        { _id: new Types.ObjectId(productId) },
        { $pull: { productModuleIds: new Types.ObjectId(moduleId) } },
      )
      .exec();
    if (result.matchedCount === 0) {
      throw new NotFoundException(`Product ${productId} not found`);
    }
  }
}
