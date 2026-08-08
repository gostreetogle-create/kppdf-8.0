import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  CostCalculation,
  CostCalculationDocument,
  CostMaterial,
  CostLabor,
} from './cost-calculation.schema';
import { CreateCostCalculationDto } from './dto/create-cost-calculation.dto';
import { UpdateCostCalculationDto } from './dto/update-cost-calculation.dto';
import { Product, ProductDocument } from '../product/product.schema';
import {
  ProductModule as ProductModuleEntity,
  ProductModuleDocument,
} from '../product-module/product-module.schema';
import { Material, MaterialDocument } from '../material/material.schema';
import { WorkType, WorkTypeDocument } from '../work-type/work-type.schema';

/**
 * TZ-85 Phase A + TZ-COST-302: CostCalculationService.
 *
 * Rollup walks Product → modules (recursive nested `lineType=module` × qty)
 * → materials + labor. Cycles skip with warn in `infos` (no 500).
 *
 * Overhead canon A (TZ-COST-302): overheadPercent applies only to
 * totalMaterialCost — not labor.
 *
 * Snapshot: each create() persists a new immutable CostCalculation.
 * activate() marks one active and syncs Product.costPrice = totalCost.
 */
type CostLine = {
  lineType: 'module' | 'material';
  refId: Types.ObjectId | string;
  quantity?: number;
  unit?: string;
};
type ProductCostSource = { composition?: CostLine[]; productModuleIds?: Types.ObjectId[] };
type ModuleMaterialCostSource = { materialId: Types.ObjectId | string; quantity?: number; unit?: string };
type ModuleWorkCostSource = { workTypeId: Types.ObjectId | string; estimatedHours?: number };
type ModuleCostSource = {
  _id?: Types.ObjectId;
  composition?: CostLine[];
  materials?: ModuleMaterialCostSource[];
  workTypes?: ModuleWorkCostSource[];
};
type MaterialCostSource = { _id: Types.ObjectId; name: string; pricePerUnit?: number };
type WorkTypeCostSource = { _id: Types.ObjectId; name: string; hourlyRate?: number };

type RollupMaps = {
  materialMap: Map<string, CostMaterial>;
  laborMap: Map<string, CostLabor>;
  infos: string[];
};

export type ModuleCostPreview = {
  materialCost: number;
  laborCost: number;
  totalCost: number;
  currency: 'RUB';
  infos?: string[];
};

@Injectable()
export class CostCalculationService {
  constructor(
    @InjectModel(CostCalculation.name)
    private readonly model: Model<CostCalculationDocument>,
    @InjectModel(Product.name)
    private readonly productModel: Model<ProductDocument>,
    @InjectModel(ProductModuleEntity.name)
    private readonly productModuleModel: Model<ProductModuleDocument>,
    @InjectModel(Material.name)
    private readonly materialModel: Model<MaterialDocument>,
    @InjectModel(WorkType.name)
    private readonly workTypeModel: Model<WorkTypeDocument>,
  ) {}

  /**
   * Overhead canon A: percent of materials only.
   * @see ARCHITECTURE.md Cost Calculation · TZ-COST-302
   */
  static overheadFromMaterials(totalMaterialCost: number, overheadPercent: number): number {
    return (totalMaterialCost * overheadPercent) / 100;
  }

  async create(
    dto: CreateCostCalculationDto,
  ): Promise<CostCalculationDocument> {
    const productObjectId = new Types.ObjectId(dto.productId);
    const product = await this.productModel
      .findById(productObjectId)
      .select('composition productModuleIds')
      .lean()
      .exec() as ProductCostSource | null;
    if (!product) throw new NotFoundException(`Product ${dto.productId} not found`);

    const maps = this.newMaps();
    const productComposition = product.composition ?? [];
    for (const line of productComposition.filter((item) => item.lineType === 'material')) {
      await this.addMaterial(maps, line.refId, line.quantity ?? 1, line.unit);
    }
    const moduleLines = productComposition.length
      ? productComposition.filter((item) => item.lineType === 'module')
      : (product.productModuleIds ?? []).map((refId) => ({
          lineType: 'module' as const,
          refId,
          quantity: 1,
        }));

    for (const moduleLine of moduleLines) {
      await this.walkModule(maps, String(moduleLine.refId), moduleLine.quantity ?? 1, new Set());
    }

    const materials = Array.from(maps.materialMap.values());
    const labor = Array.from(maps.laborMap.values());
    const totalMaterialCost = materials.reduce((sum, row) => sum + row.total, 0);
    const totalLaborCost = labor.reduce((sum, row) => sum + row.total, 0);
    const overheadPercent = dto.overheadPercent ?? 10;
    const overheadCost = CostCalculationService.overheadFromMaterials(
      totalMaterialCost,
      overheadPercent,
    );
    const totalCost = totalMaterialCost + totalLaborCost + overheadCost;
    return this.model.create({
      productId: productObjectId,
      materials,
      totalMaterialCost,
      labor,
      totalLaborCost,
      overheadPercent,
      overheadCost,
      totalCost,
      calculatedAt: new Date(),
      notes: dto.notes,
      infos: maps.infos,
    });
  }

  /**
   * Read-only module cost preview (TZ-COST-302). Same walk as create();
   * no journal / CostCalculation document. totalCost = materials + labor
   * (no product-level overhead on module preview).
   */
  async previewModuleCost(moduleId: string): Promise<ModuleCostPreview> {
    if (!Types.ObjectId.isValid(moduleId)) {
      throw new NotFoundException(`ProductModule ${moduleId} not found`);
    }
    const root = await this.productModuleModel
      .findById(new Types.ObjectId(moduleId))
      .select('_id')
      .lean()
      .exec();
    if (!root) throw new NotFoundException(`ProductModule ${moduleId} not found`);

    const maps = this.newMaps();
    await this.walkModule(maps, moduleId, 1, new Set());

    const materialCost = Array.from(maps.materialMap.values()).reduce((s, r) => s + r.total, 0);
    const laborCost = Array.from(maps.laborMap.values()).reduce((s, r) => s + r.total, 0);
    return {
      materialCost,
      laborCost,
      totalCost: materialCost + laborCost,
      currency: 'RUB',
      ...(maps.infos.length ? { infos: maps.infos } : {}),
    };
  }

  async findAll(
    productId?: string,
    isActive?: boolean,
  ): Promise<CostCalculationDocument[]> {
    const filter: Record<string, unknown> = {};
    if (productId) {
      if (!Types.ObjectId.isValid(productId)) return [];
      filter.productId = new Types.ObjectId(productId);
    }
    if (typeof isActive === 'boolean') filter.isActive = isActive;
    return this.model
      .find(filter)
      .populate('productId')
      .sort({ createdAt: -1 })
      .exec();
  }

  async findById(id: string): Promise<CostCalculationDocument> {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException(`CostCalculation ${id} not found`);
    }
    const doc = await this.model.findById(id).populate('productId').exec();
    if (!doc) throw new NotFoundException(`CostCalculation ${id} not found`);
    return doc;
  }

  async update(
    id: string,
    dto: UpdateCostCalculationDto,
  ): Promise<CostCalculationDocument> {
    const doc = await this.findById(id);
    if (dto.notes !== undefined) doc.notes = dto.notes;
    if (dto.overheadPercent !== undefined) {
      doc.overheadPercent = dto.overheadPercent;
      doc.overheadCost = CostCalculationService.overheadFromMaterials(
        doc.totalMaterialCost,
        dto.overheadPercent,
      );
      doc.totalCost =
        doc.totalMaterialCost + doc.totalLaborCost + doc.overheadCost;
    }
    return doc.save();
  }

  async activate(id: string): Promise<CostCalculationDocument> {
    const doc = await this.findById(id);
    await this.model
      .updateMany(
        { productId: doc.productId, _id: { $ne: doc._id }, isActive: true },
        { $set: { isActive: false } },
      )
      .exec();
    doc.isActive = true;
    const saved = await doc.save();
    await this.productModel
      .updateOne(
        { _id: doc.productId },
        { $set: { costPrice: doc.totalCost } },
      )
      .exec();
    return saved;
  }

  async remove(id: string): Promise<void> {
    const doc = await this.findById(id);
    await this.model
      .updateOne({ _id: doc._id }, { $set: { deletedAt: new Date() } })
      .exec();
  }

  private newMaps(): RollupMaps {
    return {
      materialMap: new Map(),
      laborMap: new Map(),
      infos: [],
    };
  }

  private async addMaterial(
    maps: RollupMaps,
    refId: Types.ObjectId | string,
    quantity: number,
    unit?: string,
  ): Promise<void> {
    if (!Types.ObjectId.isValid(String(refId))) return;
    const material = await this.materialModel
      .findById(new Types.ObjectId(String(refId)))
      .select('name pricePerUnit')
      .lean()
      .exec() as MaterialCostSource | null;
    if (!material) return;
    const key = String(material._id);
    const total = (material.pricePerUnit ?? 0) * quantity;
    const previous = maps.materialMap.get(key);
    if (previous) {
      previous.quantity += quantity;
      previous.total += total;
    } else {
      maps.materialMap.set(key, {
        materialId: material._id,
        materialName: material.name,
        quantity,
        unit,
        pricePerUnit: material.pricePerUnit ?? 0,
        total,
      });
    }
  }

  private async addLabor(
    maps: RollupMaps,
    refId: Types.ObjectId | string,
    hours: number,
  ): Promise<void> {
    if (!Types.ObjectId.isValid(String(refId))) return;
    const workType = await this.workTypeModel
      .findById(new Types.ObjectId(String(refId)))
      .select('name hourlyRate')
      .lean()
      .exec() as WorkTypeCostSource | null;
    if (!workType) return;
    const key = String(workType._id);
    const total = (workType.hourlyRate ?? 0) * hours;
    const previous = maps.laborMap.get(key);
    if (previous) {
      previous.hours += hours;
      previous.total += total;
    } else {
      maps.laborMap.set(key, {
        workTypeId: workType._id,
        workTypeName: workType.name,
        hours,
        hourlyRate: workType.hourlyRate ?? 0,
        total,
      });
    }
  }

  /** Recursive module rollup; cycles → skip + infos warn. */
  private async walkModule(
    maps: RollupMaps,
    moduleId: string,
    multiplier: number,
    ancestors: Set<string>,
  ): Promise<void> {
    if (!Types.ObjectId.isValid(moduleId)) return;
    if (ancestors.has(moduleId)) {
      maps.infos.push(`cycle: skipped nested module ${moduleId} (already in path)`);
      return;
    }
    const module = await this.productModuleModel
      .findById(new Types.ObjectId(moduleId))
      .select('composition materials workTypes')
      .lean()
      .exec() as ModuleCostSource | null;
    if (!module) return;

    const nextAncestors = new Set(ancestors);
    nextAncestors.add(moduleId);

    const composition = module.composition ?? [];
    const materialLines = composition.length
      ? composition.filter((line) => line.lineType === 'material')
      : (module.materials ?? []).map((line) => ({
          lineType: 'material' as const,
          refId: line.materialId,
          quantity: line.quantity,
          unit: line.unit,
        }));
    for (const line of materialLines) {
      await this.addMaterial(maps, line.refId, (line.quantity ?? 1) * multiplier, line.unit);
    }
    for (const workType of module.workTypes ?? []) {
      await this.addLabor(
        maps,
        workType.workTypeId,
        (workType.estimatedHours ?? 0) * multiplier,
      );
    }
    for (const line of composition.filter((l) => l.lineType === 'module')) {
      await this.walkModule(
        maps,
        String(line.refId),
        (line.quantity ?? 1) * multiplier,
        nextAncestors,
      );
    }
  }
}
