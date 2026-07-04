import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

@Schema({ _id: false })
class ModuleDimensionsSchema {
  @Prop() width?: number;
  @Prop() height?: number;
  @Prop() depth?: number;
  @Prop() unit?: string;
}

const ModuleDimensionsSchemaFactory = SchemaFactory.createForClass(ModuleDimensionsSchema);

@Schema({ _id: false })
class ModuleWorkTypeSchema {
  @Prop({ type: Types.ObjectId, ref: 'WorkType', required: true })
  workTypeId!: Types.ObjectId;

  @Prop({ default: 0 })
  estimatedHours!: number;

  @Prop({ default: 0 })
  sortOrder!: number;
}

const ModuleWorkTypeSchemaFactory = SchemaFactory.createForClass(ModuleWorkTypeSchema);

@Schema({ _id: false })
class ModuleMaterialSchema {
  @Prop() name!: string;
  @Prop({ default: 1 })
  quantity!: number;
  @Prop({ default: 'шт' })
  unit!: string;
  @Prop({ default: true })
  isPurchased!: boolean;
}

const ModuleMaterialSchemaFactory = SchemaFactory.createForClass(ModuleMaterialSchema);

export type ProductModuleDocument = HydratedDocument<ProductModule>;

@Schema({ collection: 'productmodules', timestamps: true })
export class ProductModule {
  @Prop({ required: true })
  name!: string;

  @Prop()
  article?: string;

  @Prop({ type: Types.ObjectId, ref: 'Product', index: true })
  productId?: Types.ObjectId;

  @Prop({ type: ModuleDimensionsSchemaFactory })
  dimensions?: { width?: number; height?: number; depth?: number; unit?: string };

  @Prop({ default: 0 })
  weight?: number;

  @Prop()
  image?: string;

  @Prop({ default: 0 })
  sortOrder!: number;

  @Prop({ type: [ModuleWorkTypeSchemaFactory], default: [] })
  workTypes!: { workTypeId: Types.ObjectId; estimatedHours: number; sortOrder: number }[];

  @Prop({ type: [ModuleMaterialSchemaFactory], default: [] })
  materials!: { name: string; quantity: number; unit: string; isPurchased: boolean }[];
}

export const ProductModuleSchema = SchemaFactory.createForClass(ProductModule);
ProductModuleSchema.index({ productId: 1, sortOrder: 1 });
