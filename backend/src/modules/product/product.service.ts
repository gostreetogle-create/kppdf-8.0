import { ConflictException, GoneException, Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CounterService } from '../counter/counter.service';
import { Category, CategoryDocument } from '../category/category.schema';
import { InjectModel as InjectCategoryModel } from '@nestjs/mongoose';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product, ProductDocument } from './product.schema';
import { ProductModule as ProductModuleEntity, ProductModuleDocument } from '../product-module/product-module.schema';
import { Material, MaterialDocument } from '../material/material.schema';
import { EavService } from '../../common/eav/eav.service';
import { CompositionLineDocumentShape } from '../catalog/composition-line.schema';
import { CompositionLineService } from '../catalog/composition-line.service';
import { CreateCompositionLineDto, UpdateCompositionLineDto } from '../catalog/composition-line.dto';
import { CatalogGraphService } from '../catalog-graph/catalog-graph.service';

@Injectable()
export class ProductService {
  private readonly logger = new Logger(ProductService.name);
  constructor(
    @InjectModel(Product.name) private readonly model: Model<ProductDocument>,
    @InjectCategoryModel(Category.name) private readonly categoryModel: Model<CategoryDocument>,
    @InjectModel(ProductModuleEntity.name) private readonly productModuleModel: Model<ProductModuleDocument>,
    @InjectModel(Material.name) private readonly materialModel: Model<MaterialDocument>,
    private readonly counter: CounterService,
    private readonly eav: EavService,
    private readonly compositionLines: CompositionLineService,
    private readonly catalogGraph: CatalogGraphService,
  ) {}

  async create(dto: CreateProductDto): Promise<ProductDocument> {
    let sku = dto.sku;
    if (!sku && dto.categoryId) { const cat = await this.categoryModel.findById(dto.categoryId).exec(); if (!cat) throw new BadRequestException(`Category ${dto.categoryId} not found`); sku = await this.counter.next('Product', cat.skuPrefix); }
    const { attributes, ...rest } = dto;
    const doc = await this.model.create({ ...rest, sku });
    if (attributes && Object.keys(attributes).length > 0) { const catId = doc.categoryId ? new Types.ObjectId(doc.categoryId as unknown as string) : undefined; await this.eav.resolveAttributes('Product', doc._id, attributes, catId); }
    return doc;
  }

  async findAll(q: { page?: number; limit?: number; search?: string; categoryId?: string; status?: string; isActive?: boolean; sortBy?: string; sortOrder?: 'asc' | 'desc' } = {}) {
    const page = Math.max(1, q.page ?? 1); const limit = Math.min(100, Math.max(1, q.limit ?? 20)); const filter: Record<string, unknown> = {};
    if (q.search) { const escaped = q.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); const re = new RegExp(escaped, 'i'); filter.$or = [{ name: re }, { sku: re }]; }
    if (q.categoryId) filter.categoryId = new Types.ObjectId(q.categoryId); if (q.status) filter.status = q.status; if (typeof q.isActive === 'boolean') filter.isActive = q.isActive;
    const sortField = q.sortBy ?? 'createdAt'; const sortOrder = q.sortOrder === 'asc' ? 1 : -1;
    const [items, total] = await Promise.all([this.model.find(filter).populate('categoryId').populate('photoIds').populate('productModuleIds').sort({ [sortField]: sortOrder }).skip((page - 1) * limit).limit(limit).lean().exec(), this.model.countDocuments(filter).exec()]);
    return { items, total, page, limit };
  }

  async findById(id: string): Promise<ProductDocument & { attributes?: Record<string, unknown>; isComplex?: boolean }> {
    if (!Types.ObjectId.isValid(id)) throw new NotFoundException(`Product ${id} not found`);
    const doc = await this.model.findById(id).populate('categoryId').populate('photoIds').populate({ path: 'productModuleIds', populate: [{ path: 'workTypes.workTypeId', model: 'WorkType' }, { path: 'materials.materialId', model: 'Material', select: 'name photoIds unit materialKind' }] }).exec();
    if (!doc) throw new NotFoundException(`Product ${id} not found`);
    const composition = (doc.composition ?? []) as unknown as CompositionLineDocumentShape[];
    const isComplex = composition.some((line) => line.lineType === 'product');
    return Object.assign(doc, { attributes: await this.eav.loadAttributes('Product', doc._id), isComplex });
  }

  async update(id: string, dto: UpdateProductDto): Promise<ProductDocument> {
    if (!Types.ObjectId.isValid(id)) throw new NotFoundException(`Product ${id} not found`); const doc = await this.model.findById(id).exec(); if (!doc) throw new NotFoundException(`Product ${id} not found`);
    const { attributes, ...rest } = dto; Object.assign(doc, rest); const saved = await doc.save();
    if (attributes && Object.keys(attributes).length > 0) { const catId = saved.categoryId ? new Types.ObjectId(saved.categoryId as unknown as string) : undefined; await this.eav.resolveAttributes('Product', saved._id, attributes, catId); }
    return saved;
  }

  async getTree(id: string, maxDepth = 8) { return this.catalogGraph.getTree('product', id, maxDepth); }

  async getComposition(id: string): Promise<CompositionLineDocumentShape[]> {
    if (!Types.ObjectId.isValid(id)) throw new NotFoundException(`Product ${id} not found`); const doc = await this.model.findById(id).select('composition productModuleIds').lean().exec(); if (!doc) throw new NotFoundException(`Product ${id} not found`);
    const legacy = (doc.productModuleIds ?? []).map((refId) => ({ _id: new Types.ObjectId(), lineType: 'module' as const, refId: new Types.ObjectId(String(refId)), quantity: 1, sortOrder: 0 })); return this.compositionLines.dualRead(doc, legacy);
  }

  async addComposition(id: string, dto: CreateCompositionLineDto): Promise<CompositionLineDocumentShape[]> {
    const doc = await this.model.findById(id).exec(); if (!doc) throw new NotFoundException(`Product ${id} not found`); const incoming = this.compositionLines.toStoredLine(dto);
    await this.catalogGraph.assertNoCycleAndDepth(id, 'product', { lineType: incoming.lineType, refId: incoming.refId.toString() }); await this.compositionLines.validateReference('product', incoming, { materialModel: this.materialModel, moduleModel: this.productModuleModel, productModel: this.model });
    const raw = ((doc.composition ?? []) as unknown as CompositionLineDocumentShape[]).map((line) => this.plainCompositionLine(line)); const next = this.compositionLines.upsertDeduplicated(raw, incoming); this.compositionLines.ensureLineLimit(next);
    const saved = await this.model.findOneAndUpdate(this.versionedCompositionFilter(doc), { $set: { composition: next }, $inc: { __v: 1 } }, { new: true, runValidators: true }).exec(); if (!saved) throw new ConflictException(`Product ${id} changed while composition was being updated`); return saved.composition as unknown as CompositionLineDocumentShape[];
  }

  async updateComposition(id: string, lineId: string, dto: UpdateCompositionLineDto): Promise<CompositionLineDocumentShape[]> {
    if (!Types.ObjectId.isValid(lineId)) throw new BadRequestException('Invalid composition line id'); const doc = await this.model.findById(id).exec(); if (!doc) throw new NotFoundException(`Product ${id} not found`);
    const raw = ((doc.composition ?? []) as unknown as CompositionLineDocumentShape[]).map((line) => this.plainCompositionLine(line)); const index = raw.findIndex((line) => line._id.toString() === lineId); if (index < 0) throw new NotFoundException(`Composition line ${lineId} not found`);
    const updated = this.compositionLines.toStoredLine(dto, raw[index]);    await this.catalogGraph.assertNoCycleAndDepth(id, 'product', { lineType: updated.lineType, refId: updated.refId.toString() }, lineId); await this.compositionLines.validateReference('product', updated, { materialModel: this.materialModel, moduleModel: this.productModuleModel, productModel: this.model });
    const next = raw.slice(); next[index] = updated; this.compositionLines.ensureNoDuplicateKeys(next); const saved = await this.model.findOneAndUpdate(this.versionedCompositionFilter(doc), { $set: { composition: next }, $inc: { __v: 1 } }, { new: true, runValidators: true }).exec(); if (!saved) throw new ConflictException(`Product ${id} changed while composition was being updated`); return saved.composition as unknown as CompositionLineDocumentShape[];
  }

  async removeComposition(id: string, lineId: string): Promise<void> {
    if (!Types.ObjectId.isValid(lineId)) throw new BadRequestException('Invalid composition line id'); const doc = await this.model.findById(id).exec(); if (!doc) throw new NotFoundException(`Product ${id} not found`);
    const raw = ((doc.composition ?? []) as unknown as CompositionLineDocumentShape[]).map((line) => this.plainCompositionLine(line)); const next = raw.filter((line) => line._id.toString() !== lineId); if (next.length === raw.length) throw new NotFoundException(`Composition line ${lineId} not found`);
    const saved = await this.model.findOneAndUpdate(this.versionedCompositionFilter(doc), { $set: { composition: next }, $inc: { __v: 1 } }, { new: true, runValidators: true }).exec(); if (!saved) throw new ConflictException(`Product ${id} changed while composition was being updated`);
  }

  private versionedCompositionFilter(doc: ProductDocument): Record<string, unknown> { return { _id: doc._id, $or: [{ __v: doc.__v ?? 0 }, { __v: { $exists: false } }] }; }
  private plainCompositionLine(line: CompositionLineDocumentShape): CompositionLineDocumentShape { return { _id: line._id, lineType: line.lineType, refId: line.refId, quantity: Number(line.quantity), sortOrder: Number(line.sortOrder ?? 0), unit: line.unit, overrideDimensions: line.overrideDimensions, isPurchased: line.isPurchased, sourcePosition: line.sourcePosition, sourceCode: line.sourceCode, notes: line.notes }; }
  async remove(id: string): Promise<void> { if (!Types.ObjectId.isValid(id)) throw new NotFoundException(`Product ${id} not found`); const doc = await this.model.findById(id).exec(); if (!doc) throw new NotFoundException(`Product ${id} not found`); await this.model.updateOne({ _id: doc._id }, { $set: { deletedAt: new Date() } }).exec(); }

  async attachModule(_productId: string, _moduleId: string): Promise<ProductDocument> { throw new GoneException('Legacy productModuleIds writes are disabled; use the composition API'); }
  async detachModule(_productId: string, _moduleId: string): Promise<void> { throw new GoneException('Legacy productModuleIds writes are disabled; use the composition API'); }
}
