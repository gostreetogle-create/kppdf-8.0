import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  CostCalculation,
  CostCalculationSchema,
} from './cost-calculation.schema';
import { CostCalculationService } from './cost-calculation.service';
import { CostCalculationController } from './cost-calculation.controller';
import { Bom, BomSchema } from '../bom/bom.schema';
import {
  TechProcess,
  TechProcessSchema,
} from '../tech-process/tech-process.schema';
import { WorkType, WorkTypeSchema } from '../work-type/work-type.schema';
import { Material, MaterialSchema } from '../material/material.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: CostCalculation.name, schema: CostCalculationSchema },
      { name: Bom.name, schema: BomSchema },
      { name: TechProcess.name, schema: TechProcessSchema },
      { name: WorkType.name, schema: WorkTypeSchema },
      { name: Material.name, schema: MaterialSchema },
    ]),
  ],
  controllers: [CostCalculationController],
  providers: [CostCalculationService],
  exports: [CostCalculationService, MongooseModule],
})
export class CostCalculationModule {}
