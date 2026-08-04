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
 * TZ-85 Phase A: CostCalculationService.
 *
 * REWRITE rationale (TZ-85.md §2.1, decision #1): cost rollup is now driven
 * exclusively by the ProductModule hierarchy (Product → ProductModule →
 * {materials[], workTypes[]}) introduced in TZ-83. The legacy Bom/TechProcess
 * schemas are kept as read-only historical artefacts (see TZ-83 §3) but no
 * longer participate in the rollup algorithm.
 *
 * Snapshot architecture (TZ-85.md §2.2, decision #2): each call to `create()`
 * persists a NEW `CostCalculation` document. The document is the immutable
 * financial record of the rollup at calculation time — it is NOT recomputed
 * on read. Material/WorkType price changes do NOT retroactively mutate
 * historical snapshots (TZ-85.md §2.2, decision #3); the user re-runs the
 * calculation explicitly to capture the new prices.
 *
 * Aggregation rule (TZ-85.md §2.2, decision #5): identical Material or
 * WorkType ids appearing across different ProductModules are rolled up into
 * a single `materials[]` / `labor[]` line (quantities and totals are summed).
 * This keeps the breakdown UI clean: one row per logical "лист ЛДСП 16мм"
 * instead of N duplicated rows.
 *
 * TZ-CATALOG-304: create() dual-reads composition-first with legacy fallback
 * (productModuleIds / module.materials[]) until the cleanup successor.
 *
 * @see TZ-83 (foundation: 5 atomic commits at `752ace3`).
 * @see TZ-85 §4.A.2 for the algorithm pseudocode.
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
type ModuleCostSource = { composition?: CostLine[]; materials?: ModuleMaterialCostSource[]; workTypes?: ModuleWorkCostSource[] };
type MaterialCostSource = { _id: Types.ObjectId; name: string; pricePerUnit?: number };
type WorkTypeCostSource = { _id: Types.ObjectId; name: string; hourlyRate?: number };

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
   * TZ-85A.2: rewrite of `create()` to walk the ProductModule hierarchy.
   *
   * Replaces the pre-TZ-85 implementation that pulled active Bom + active
   * TechProcess and aggregated `bom.components[].productComponentId` +
   * `techProcess.operations[].workTypeId` (which left `pricePerUnit = 0`
   * because the Material lookup was never wired — see old `// TODO`).
   *
   * Defensive guards:
   *  - `?? 0` on every numeric field (null safety vs Mongoose hydration).
   *  - `if (!material) continue` for orphan `materialId` references (a
   *    Material could have been hard-deleted while ProductModule.materials[]
   *    still pointed at it). Orphan rows are filtered silently — the
   *    alternative (throw) would block the entire recalculation on a single
   *    stale reference.
   *  - `mod.materials ?? []` (schema defaults to `[]`, but defensive against
   *    legacy docs).
   *
   * Backwards compat (TZ-85.md §2.2, decision #6): `bomId` / `bomVersion`
   * remain in `CreateCostCalculationDto` so legacy clients / e2e tests that
   * POST with these fields keep validating. They are NOT written into the
   * new snapshot — there is no longer a Bom source.
   */
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

    const materialMap = new Map<string, CostMaterial>();
    const laborMap = new Map<string, CostLabor>();
    const addMaterial = async (refId: Types.ObjectId | string, quantity: number, unit?: string): Promise<void> => {
      if (!Types.ObjectId.isValid(String(refId))) return;
      const material = await this.materialModel
        .findById(new Types.ObjectId(String(refId)))
        .select('name pricePerUnit')
        .lean()
        .exec() as MaterialCostSource | null;
      if (!material) return;
      const key = String(material._id);
      const total = (material.pricePerUnit ?? 0) * quantity;
      const previous = materialMap.get(key);
      if (previous) {
        previous.quantity += quantity;
        previous.total += total;
      } else {
        materialMap.set(key, {
          materialId: material._id,
          materialName: material.name,
          quantity,
          unit,
          pricePerUnit: material.pricePerUnit ?? 0,
          total,
        });
      }
    };
    const addLabor = async (refId: Types.ObjectId | string, hours: number): Promise<void> => {
      if (!Types.ObjectId.isValid(String(refId))) return;
      const workType = await this.workTypeModel
        .findById(new Types.ObjectId(String(refId)))
        .select('name hourlyRate')
        .lean()
        .exec() as WorkTypeCostSource | null;
      if (!workType) return;
      const key = String(workType._id);
      const total = (workType.hourlyRate ?? 0) * hours;
      const previous = laborMap.get(key);
      if (previous) {
        previous.hours += hours;
        previous.total += total;
      } else {
        laborMap.set(key, {
          workTypeId: workType._id,
          workTypeName: workType.name,
          hours,
          hourlyRate: workType.hourlyRate ?? 0,
          total,
        });
      }
    };

    const productComposition = product.composition ?? [];
    for (const line of productComposition.filter((item) => item.lineType === 'material')) {
      await addMaterial(line.refId, line.quantity ?? 1, line.unit);
    }
    const moduleLines = productComposition.length
      ? productComposition.filter((item) => item.lineType === 'module')
      : (product.productModuleIds ?? []).map((refId) => ({ lineType: 'module' as const, refId, quantity: 1 }));
    const moduleIds = moduleLines.map((line) => line.refId).filter((refId) => Types.ObjectId.isValid(String(refId)));
    const modules = await this.productModuleModel
      .find({ _id: { $in: moduleIds.map((id) => new Types.ObjectId(String(id))) } })
      .select('composition materials workTypes')
      .lean()
      .exec() as ModuleCostSource[];
    const modulesById = new Map(modules.map((module) => [String((module as ModuleCostSource & { _id?: Types.ObjectId })._id), module]));

    for (const moduleLine of moduleLines) {
      const module = modulesById.get(String(moduleLine.refId));
      if (!module) continue;
      const multiplier = moduleLine.quantity ?? 1;
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
        await addMaterial(line.refId, (line.quantity ?? 1) * multiplier, line.unit);
      }
      for (const workType of module.workTypes ?? []) {
        await addLabor(workType.workTypeId, (workType.estimatedHours ?? 0) * multiplier);
      }
    }

    const materials = Array.from(materialMap.values());
    const labor = Array.from(laborMap.values());
    const totalMaterialCost = materials.reduce((sum, row) => sum + row.total, 0);
    const totalLaborCost = labor.reduce((sum, row) => sum + row.total, 0);
    const overheadPercent = dto.overheadPercent ?? 10;
    const overheadCost = (totalMaterialCost * overheadPercent) / 100;
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
    });
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
      doc.overheadCost = (doc.totalMaterialCost * dto.overheadPercent) / 100;
      doc.totalCost =
        doc.totalMaterialCost + doc.totalLaborCost + doc.overheadCost;
    }
    return doc.save();
  }

  async activate(id: string): Promise<CostCalculationDocument> {
    const doc = await this.findById(id);
    // Deactivate others for same product
    await this.model
      .updateMany(
        { productId: doc.productId, _id: { $ne: doc._id }, isActive: true },
        { $set: { isActive: false } },
      )
      .exec();
    doc.isActive = true;
    return doc.save();
  }

  async remove(id: string): Promise<void> {
    const doc = await this.findById(id);
    await this.model
      .updateOne({ _id: doc._id }, { $set: { deletedAt: new Date() } })
      .exec();
  }
}
