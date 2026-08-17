import { BadRequestException, ConflictException, Injectable, NotFoundException, Optional } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ProductModule, ProductModuleDocument } from './product-module.schema';
import { Product, ProductDocument } from '../product/product.schema';
import { Material, MaterialDocument } from '../material/material.schema';
import { CompositionLineDocumentShape } from '../catalog/composition-line.schema';
import { CompositionLineService } from '../catalog/composition-line.service';
import { CreateCompositionLineDto, UpdateCompositionLineDto } from '../catalog/composition-line.dto';
import { CatalogGraphService } from '../catalog-graph/catalog-graph.service';
import {
  CostCalculationService,
  ModuleCostPreview,
} from '../cost-calculation/cost-calculation.service';

export interface MaterialInModuleDto { materialId: string; quantity?: number; unit?: string; isPurchased?: boolean; overrideDimensions?: { length?: number; width?: number; height?: number; unit?: string }; sortOrder?: number; }
export interface WorkTypeInModuleDto { workTypeId: string; estimatedHours?: number; sortOrder?: number; }
export interface UpsertProductModuleDto { name: string; article: string; dimensions?: { width?: number; height?: number; depth?: number; unit?: string }; weight?: number; sortOrder?: number; workTypes?: WorkTypeInModuleDto[]; materials?: MaterialInModuleDto[]; }

type DimensionKey = 'length' | 'width' | 'height';

@Injectable()
export class ProductModuleService {
  private readonly compositionLines: CompositionLineService;

  constructor(
    @InjectModel(ProductModule.name) private readonly model: Model<ProductModuleDocument>,
    @InjectModel(Product.name) private readonly productModel: Model<ProductDocument>,
    @InjectModel(Material.name) private readonly materialModel: Model<MaterialDocument>,
    @Optional() compositionLines: CompositionLineService | undefined,
    private readonly catalogGraph: CatalogGraphService,
    private readonly costCalculation: CostCalculationService,
  ) { this.compositionLines = compositionLines ?? new CompositionLineService(); }

  async create(dto: UpsertProductModuleDto, organizationId?: string | null): Promise<ProductModuleDocument> {
    this.rejectLegacyMaterialsWrite(dto.materials);
    const article = this.normalizeRequiredArticle(dto.article);
    try {
      return await this.model.create(this.toPersistence({ ...dto, article }, organizationId));
    } catch (err) {
      this.rethrowDuplicateArticle(err);
    }
  }

  async findAll(productId?: string): Promise<ProductModuleDocument[]> {
    const activeFilter: Record<string, unknown> = { deletedAt: null };
    if (productId) {
      if (!Types.ObjectId.isValid(productId)) return [];
      const product = await this.productModel.findById(productId).select('composition productModuleIds').lean();
      if (!product) return [];
      const moduleIds = product.composition?.length
        ? product.composition.filter((line) => line.lineType === 'module').map((line) => line.refId)
        : product.productModuleIds;
      if (moduleIds.length === 0) return [];
      return this.model.find({ ...activeFilter, _id: { $in: moduleIds } }).populate('workTypes.workTypeId').populate({ path: 'materials.materialId', select: 'name photoIds unit dimensions materialKind' }).sort({ sortOrder: 1 }).exec();
    }
    return this.model.find(activeFilter).populate('workTypes.workTypeId').populate({ path: 'materials.materialId', select: 'name photoIds unit dimensions materialKind' }).sort({ sortOrder: 1 }).exec();
  }

  async findByIds(ids: string[]): Promise<ProductModuleDocument[]> {
    const validIds = ids.filter(id => Types.ObjectId.isValid(id)).map(id => new Types.ObjectId(id));
    if (validIds.length === 0) return [];
    
    return this.model.find({ 
      _id: { $in: validIds }, 
      deletedAt: null 
    })
    .populate('workTypes.workTypeId')
    .populate({ 
      path: 'materials.materialId', 
      select: 'name photoIds unit dimensions materialKind' 
    })
    .exec();
  }

  async findById(id: string): Promise<ProductModuleDocument> {
    if (!Types.ObjectId.isValid(id)) throw new NotFoundException(`ProductModule ${id} not found`);
    const doc = await this.model.findById(id).populate('workTypes.workTypeId').populate({ path: 'materials.materialId', select: 'name photoIds unit dimensions materialKind' }).exec();
    if (!doc || doc.deletedAt) throw new NotFoundException(`ProductModule ${id} not found`);
    return doc;
  }

  /** TZ-COST-302: read-only cost preview (same recursive walk as CostCalculation). */
  async getCostPreview(id: string): Promise<ModuleCostPreview> {
    await this.findById(id);
    return this.costCalculation.previewModuleCost(id);
  }

  async update(id: string, dto: Partial<UpsertProductModuleDto>, organizationId?: string | null): Promise<ProductModuleDocument> {
    // Keep the controller/service contract ready for organization-scoped reads;
    // the compound unique index enforces the write boundary for this task.
    void organizationId;
    this.rejectLegacyMaterialsWrite(dto.materials);
    const doc = await this.findById(id);
    if (dto.name !== undefined) doc.name = dto.name;
    if (dto.article !== undefined) doc.article = this.normalizeRequiredArticle(dto.article);
    if (dto.dimensions !== undefined) doc.dimensions = dto.dimensions;
    if (dto.weight !== undefined) doc.weight = dto.weight;
    if (dto.sortOrder !== undefined) doc.sortOrder = dto.sortOrder;
    if (dto.workTypes) doc.workTypes = dto.workTypes.map((w) => ({ workTypeId: new Types.ObjectId(w.workTypeId), estimatedHours: w.estimatedHours ?? 0, sortOrder: w.sortOrder ?? 0 }));
    try {
      return await doc.save();
    } catch (err) {
      this.rethrowDuplicateArticle(err);
    }
  }

  async getComposition(id: string): Promise<CompositionLineDocumentShape[]> {
    const doc = await this.findById(id);
    const legacy = (doc.materials ?? []).map((row) => ({ _id: new Types.ObjectId(), lineType: 'material' as const, refId: new Types.ObjectId(String(row.materialId)), quantity: row.quantity ?? 1, sortOrder: row.sortOrder ?? 0, unit: row.unit, overrideDimensions: row.overrideDimensions, isPurchased: row.isPurchased }));
    return this.compositionLines.dualRead(doc, legacy);
  }

  async addComposition(id: string, dto: CreateCompositionLineDto): Promise<CompositionLineDocumentShape[]> {
    if (dto.lineType === 'product') throw new BadRequestException('Product lines are not allowed on module composition');
    const doc = await this.findById(id);
    const incoming = this.compositionLines.toStoredLine(dto);
    await this.catalogGraph.assertNoCycleAndDepth(id, 'module', { lineType: incoming.lineType, refId: incoming.refId.toString() });
    await this.compositionLines.validateReference('module', incoming, { materialModel: this.materialModel, moduleModel: this.model });
    await this.assertCompositionMaterialOverrides(incoming);
    const next = this.compositionLines.upsertDeduplicated((doc.composition ?? []) as unknown as CompositionLineDocumentShape[], incoming);
    this.compositionLines.ensureLineLimit(next);
    doc.composition = next as never;
    await doc.save();
    return doc.composition as unknown as CompositionLineDocumentShape[];
  }

  async updateComposition(id: string, lineId: string, dto: UpdateCompositionLineDto): Promise<CompositionLineDocumentShape[]> {
    if (dto.lineType === 'product') throw new BadRequestException('Product lines are not allowed on module composition');
    if (!Types.ObjectId.isValid(lineId)) throw new BadRequestException('Invalid composition line id');
    const doc = await this.findById(id);
    const current = (doc.composition ?? []) as unknown as CompositionLineDocumentShape[];
    const index = current.findIndex((line) => line._id.toString() === lineId);
    if (index < 0) throw new NotFoundException(`Composition line ${lineId} not found`);
    const updated = this.compositionLines.toStoredLine(dto, current[index]);
    await this.catalogGraph.assertNoCycleAndDepth(id, 'module', { lineType: updated.lineType, refId: updated.refId.toString() }, lineId);
    await this.compositionLines.validateReference('module', updated, { materialModel: this.materialModel, moduleModel: this.model });
    await this.assertCompositionMaterialOverrides(updated);
    const next = current.slice(); next[index] = updated;
    this.compositionLines.ensureNoDuplicateKeys(next);
    doc.composition = next as never;
    await doc.save();
    return doc.composition as unknown as CompositionLineDocumentShape[];
  }

  async removeComposition(id: string, lineId: string): Promise<void> {
    if (!Types.ObjectId.isValid(lineId)) throw new BadRequestException('Invalid composition line id');
    const doc = await this.findById(id);
    const current = (doc.composition ?? []) as unknown as CompositionLineDocumentShape[];
    const next = current.filter((line) => line._id.toString() !== lineId);
    if (next.length === current.length) throw new NotFoundException(`Composition line ${lineId} not found`);
    doc.composition = next as never;
    await doc.save();
  }

  async remove(id: string): Promise<void> {
    const doc = await this.findById(id);
    const boms = await this.model.db.collection('boms').findOne({ 'components.productComponentId': doc._id });
    const productRefs = await this.model.db.collection('products').findOne({ $or: [{ composition: { $elemMatch: { lineType: 'module', refId: doc._id } } }, { productModuleIds: doc._id }] });
    if (boms || productRefs) throw new ConflictException('ProductModule is referenced by catalog history and cannot be archived');
    await this.model.updateOne({ _id: doc._id, deletedAt: null }, { $set: { deletedAt: new Date() } }).exec();
  }

  /** Non-empty materials[] is legacy write path (TZ-CATALOG-304). Empty array is treated as omit. */
  private rejectLegacyMaterialsWrite(materials: MaterialInModuleDto[] | undefined): void {
    if (materials !== undefined && materials.length > 0) {
      throw new BadRequestException('Legacy materials[] writes are disabled; use the composition API');
    }
  }

  /** TZ-MATERIALS-309 override rules, applied on composition material lines after 304 cutover. */
  private async assertCompositionMaterialOverrides(line: CompositionLineDocumentShape): Promise<void> {
    if (line.lineType !== 'material') return;
    await this.assertMaterialsAndOverridesAllowed([{ materialId: String(line.refId), overrideDimensions: line.overrideDimensions }]);
  }

  private async assertMaterialsAndOverridesAllowed(materials: MaterialInModuleDto[]): Promise<void> {
    for (const row of materials) {
      if (!Types.ObjectId.isValid(row.materialId)) throw new BadRequestException(`Некорректный materialId: ${row.materialId}`);
    }
    const ids = [...new Set(materials.map((m) => m.materialId))];
    if (ids.length === 0) return;
    const docs = await this.materialModel.find({ _id: { $in: ids.map((id) => new Types.ObjectId(id)) } }).select('name dimensions').lean().exec();
    const byId = new Map(docs.map((material) => [String(material._id), material]));
    for (const row of materials) {
      const material = byId.get(row.materialId);
      if (!material) throw new BadRequestException(`Материал ${row.materialId} не найден`);
      const immutable = new Set((material.dimensions ?? []).filter((dimension) => dimension.isImmutable).map((dimension) => dimension.type));
      for (const key of ['length', 'width', 'height'] as DimensionKey[]) {
        if (row.overrideDimensions?.[key] !== undefined && immutable.has(key)) {
          throw new BadRequestException(`Размер «${key}» материала «${material.name}» неизменяем и не может быть переопределён в модуле`);
        }
      }
    }
  }

  private normalizeRequiredArticle(value: string | undefined): string {
    const article = value?.trim() ?? '';
    if (!article) throw new BadRequestException('Артикул модуля обязателен');
    return article;
  }

  private rethrowDuplicateArticle(err: unknown): never {
    if ((err as { code?: number })?.code === 11000) {
      throw new ConflictException('Артикул уже используется');
    }
    throw err;
  }

  private toPersistence(dto: UpsertProductModuleDto, organizationId?: string | null) {
    return {
      ...dto,
      organizationId: organizationId ? this.organizationId(organizationId) : undefined,
      workTypes: (dto.workTypes ?? []).map((w) => ({ workTypeId: new Types.ObjectId(w.workTypeId), estimatedHours: w.estimatedHours ?? 0, sortOrder: w.sortOrder ?? 0 })),
      materials: [],
    };
  }

  private organizationId(value: string): Types.ObjectId {
    if (!Types.ObjectId.isValid(value)) throw new BadRequestException('Invalid organization scope');
    return new Types.ObjectId(value);
  }
}
