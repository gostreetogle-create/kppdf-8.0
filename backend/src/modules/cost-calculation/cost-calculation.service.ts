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
 * @see TZ-83 (foundation: 5 atomic commits at `752ace3`).
 * @see TZ-85 §4.A.2 for the algorithm pseudocode.
 */
@Injectable()
export class CostCalculationService {
  constructor(
    @InjectModel(CostCalculation.name)
    private readonly model: Model<CostCalculationDocument>,
    // TZ-85A: single source for the rollup. The nested populate chain
    // `productModuleIds → materials.materialId | workTypes.workTypeId` is the
    // canonical pattern also used in `ProductService.findById` (TZ-83 Review #1).
    @InjectModel(Product.name)
    private readonly productModel: Model<ProductDocument>,
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

    // TZ-85A.2: deep populate of the module tree. `select` keeps the
    // payload tight — we only need name + pricePerUnit on Material and
    // name + hourlyRate on WorkType. The `as unknown as` casts on the
    // result handle Mongoose's loss of structural typing across the
    // populate chain (same pattern as ProductService.attachModule).
    const product = await this.productModel
      .findById(productObjectId)
      .populate({
        path: 'productModuleIds',
        populate: [
          {
            path: 'materials.materialId',
            model: 'Material',
            select: 'name pricePerUnit',
          },
          {
            path: 'workTypes.workTypeId',
            model: 'WorkType',
            select: 'name hourlyRate',
          },
        ],
      })
      .exec();
    if (!product) {
      throw new NotFoundException(`Product ${dto.productId} not found`);
    }

    const matMap = new Map<string, CostMaterial>();
    const laborMap = new Map<string, CostLabor>();
    const modules =
      (product.productModuleIds as unknown as ProductModuleDocument[]) ?? [];

    for (const mod of modules) {
      // ── materials: aggregate by materialId ──
      for (const mat of mod.materials ?? []) {
        const material = mat.materialId as unknown as MaterialDocument | null;
        if (!material) continue; // orphan ref → skip silently (TZ-85A risk #1)
        const id = material._id.toString();
        const qty = mat.quantity ?? 0;
        const lineTotal = (material.pricePerUnit ?? 0) * qty;
        const prev = matMap.get(id);
        if (prev) {
          prev.quantity += qty;
          prev.total += lineTotal;
        } else {
          matMap.set(id, {
            materialId: material._id,
            materialName: material.name,
            quantity: qty,
            unit: mat.unit,
            pricePerUnit: material.pricePerUnit ?? 0,
            total: lineTotal,
          });
        }
      }

      // ── labor: aggregate by workTypeId ──
      for (const wt of mod.workTypes ?? []) {
        const workType = wt.workTypeId as unknown as WorkTypeDocument | null;
        if (!workType) continue;
        const id = workType._id.toString();
        const hours = wt.estimatedHours ?? 0;
        const lineTotal = (workType.hourlyRate ?? 0) * hours;
        const prev = laborMap.get(id);
        if (prev) {
          prev.hours += hours;
          prev.total += lineTotal;
        } else {
          laborMap.set(id, {
            workTypeId: workType._id,
            workTypeName: workType.name,
            hours,
            hourlyRate: workType.hourlyRate ?? 0,
            total: lineTotal,
          });
        }
      }
    }

    const materials = Array.from(matMap.values());
    const labor = Array.from(laborMap.values());
    const totalMaterialCost = materials.reduce((s, m) => s + m.total, 0);
    const totalLaborCost = labor.reduce((s, l) => s + l.total, 0);
    const overheadPercent = dto.overheadPercent ?? 10;
    const overheadCost = (totalMaterialCost * overheadPercent) / 100;
    const totalCost = totalMaterialCost + totalLaborCost + overheadCost;

    // `isActive` defaults to `false` per schema (no explicit write needed).
    // `bomId` / `bomVersion` / `techProcessId` deliberately omitted — there
    // is no longer a source for them. The schema keeps them as optional
    // for legacy docs that pre-date TZ-85A.
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
