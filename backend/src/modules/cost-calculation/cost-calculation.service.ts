import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  CostCalculation,
  CostCalculationDocument,
} from './cost-calculation.schema';
import { CreateCostCalculationDto } from './dto/create-cost-calculation.dto';
import { UpdateCostCalculationDto } from './dto/update-cost-calculation.dto';
import { Bom, BomDocument } from '../bom/bom.schema';
import {
  TechProcess,
  TechProcessDocument,
} from '../tech-process/tech-process.schema';
import {
  WorkType,
  WorkTypeDocument,
} from '../work-type/work-type.schema';
import { Material, MaterialDocument } from '../material/material.schema';

@Injectable()
export class CostCalculationService {
  constructor(
    @InjectModel(CostCalculation.name)
    private readonly model: Model<CostCalculationDocument>,
    @InjectModel(Bom.name) private readonly bomModel: Model<BomDocument>,
    @InjectModel(TechProcess.name)
    private readonly techProcessModel: Model<TechProcessDocument>,
    @InjectModel(WorkType.name)
    private readonly workTypeModel: Model<WorkTypeDocument>,
    @InjectModel(Material.name)
    private readonly materialModel: Model<MaterialDocument>,
  ) {}

  async create(
    dto: CreateCostCalculationDto,
  ): Promise<CostCalculationDocument> {
    const productObjectId = new Types.ObjectId(dto.productId);

    // Load active Bom and TechProcess
    const [bom, techProcess] = await Promise.all([
      dto.bomId
        ? this.bomModel.findById(dto.bomId).exec()
        : this.bomModel
            .findOne({ productId: productObjectId, isActive: true })
            .sort({ createdAt: -1 })
            .exec(),
      this.techProcessModel
        .findOne({ productId: productObjectId, isActive: true })
        .sort({ createdAt: -1 })
        .exec(),
    ]);

    // Materials from Bom
    const materials = bom?.components
      ? bom.components
          .filter((c) => c.productComponentId)
          .map((c) => ({
            materialId: c.productComponentId,
            materialName: undefined,
            quantity: c.quantity ?? 0,
            unit: undefined,
            pricePerUnit: 0, // TODO: load from Material catalog
            total: 0,
          }))
      : [];

    const totalMaterialCost = materials.reduce((s, m) => s + (m.total ?? 0), 0);

    // Labor from TechProcess
    const labor: { workTypeId: Types.ObjectId; workTypeName?: string; hours: number; hourlyRate: number; total: number }[] = [];
    let totalLaborCost = 0;
    if (techProcess && techProcess.operations.length > 0) {
      const workTypeIds = techProcess.operations
        .map((o) => o.workTypeId)
        .filter(Boolean) as Types.ObjectId[];
      const workTypes = await this.workTypeModel
        .find({ _id: { $in: workTypeIds } })
        .exec();
      const wtMap = new Map(workTypes.map((w) => [w._id.toString(), w]));
      for (const op of techProcess.operations) {
        const wt = op.workTypeId ? wtMap.get(op.workTypeId.toString()) : undefined;
        const hours = op.durationHours ?? 0;
        const rate = wt?.hourlyRate ?? 0;
        const total = hours * rate;
        totalLaborCost += total;
        labor.push({
          workTypeId: op.workTypeId,
          workTypeName: wt?.name,
          hours,
          hourlyRate: rate,
          total,
        });
      }
    }

    const overheadPercent = dto.overheadPercent ?? 10;
    const overheadCost = (totalMaterialCost * overheadPercent) / 100;
    const totalCost = totalMaterialCost + totalLaborCost + overheadCost;

    return this.model.create({
      productId: productObjectId,
      bomId: bom?._id,
      bomVersion: dto.bomVersion,
      isActive: false,
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
