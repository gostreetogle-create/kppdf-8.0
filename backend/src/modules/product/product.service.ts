import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CounterService } from '../counter/counter.service';
import { Category, CategoryDocument } from '../category/category.schema';
import { InjectModel as InjectCategoryModel } from '@nestjs/mongoose';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product, ProductDocument } from './product.schema';
import { EavService } from '../../common/eav/eav.service';

@Injectable()
export class ProductService {
  private readonly logger = new Logger(ProductService.name);

  constructor(
    @InjectModel(Product.name) private readonly model: Model<ProductDocument>,
    @InjectCategoryModel(Category.name) private readonly categoryModel: Model<CategoryDocument>,
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
      .populate('productModuleIds')
      .exec();
    if (!doc) throw new NotFoundException(`Product ${id} not found`);
    const attributes = await this.eav.loadAttributes('Product', doc._id);
    return Object.assign(doc, { attributes });
  }

  async update(id: string, dto: UpdateProductDto): Promise<ProductDocument> {
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
    const doc = await this.model.findById(id).exec();
    if (!doc) throw new NotFoundException(`Product ${id} not found`);
    await this.model
      .updateOne({ _id: doc._id }, { $set: { deletedAt: new Date() } })
      .exec();
  }
}
