import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

@Schema({ _id: false })
export class CostMaterial {
  @Prop({ type: Types.ObjectId, ref: 'Material', required: true })
  materialId!: Types.ObjectId;

  @Prop()
  materialName?: string;

  @Prop({ default: 0 })
  quantity!: number;

  @Prop()
  unit?: string;

  @Prop({ default: 0 })
  pricePerUnit!: number;

  @Prop({ default: 0 })
  total!: number;
}

const CostMaterialSchema = SchemaFactory.createForClass(CostMaterial);

@Schema({ _id: false })
export class CostLabor {
  @Prop({ type: Types.ObjectId, ref: 'WorkType', required: true })
  workTypeId!: Types.ObjectId;

  @Prop()
  workTypeName?: string;

  @Prop({ default: 0 })
  hours!: number;

  @Prop({ default: 0 })
  hourlyRate!: number;

  @Prop({ default: 0 })
  total!: number;
}

const CostLaborSchema = SchemaFactory.createForClass(CostLabor);

export type CostCalculationDocument = HydratedDocument<CostCalculation>;

@Schema({ collection: 'costcalculations', timestamps: true })
export class CostCalculation {
  @Prop({ type: Types.ObjectId, ref: 'Product', required: true, index: true })
  productId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Bom' })
  bomId?: Types.ObjectId;

  @Prop()
  bomVersion?: string;

  @Prop({ default: false, index: true })
  isActive!: boolean;

  @Prop({ type: [CostMaterialSchema], default: [] })
  materials!: CostMaterial[];

  @Prop({ default: 0 })
  totalMaterialCost!: number;

  @Prop({ type: [CostLaborSchema], default: [] })
  labor!: CostLabor[];

  @Prop({ default: 0 })
  totalLaborCost!: number;

  @Prop({ default: 10 })
  overheadPercent!: number;

  @Prop({ default: 0 })
  overheadCost!: number;

  @Prop({ default: 0 })
  totalCost!: number;

  @Prop()
  calculatedAt?: Date;

  @Prop()
  notes?: string;
}

export const CostCalculationSchema = SchemaFactory.createForClass(CostCalculation);
CostCalculationSchema.index({ productId: 1, isActive: 1 });
