import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

@Schema({ _id: false })
class BomComponentSchema {
  @Prop({ type: Types.ObjectId, ref: 'ProductComponent', required: true })
  productComponentId!: Types.ObjectId;

  @Prop({ default: 1 })
  quantity!: number;

  @Prop()
  notes?: string;
}

const BomComponentSchemaFactory = SchemaFactory.createForClass(BomComponentSchema);

export type BomDocument = HydratedDocument<Bom>;

@Schema({ collection: 'boms', timestamps: true })
export class Bom {
  @Prop({ type: Types.ObjectId, ref: 'Product', required: true, index: true })
  productId!: Types.ObjectId;

  @Prop({ required: true })
  version!: string; // "1.0", "2026-01-15", etc.

  @Prop({ default: false, index: true })
  isActive!: boolean;

  @Prop({ type: [BomComponentSchemaFactory], default: [] })
  components!: { productComponentId: Types.ObjectId; quantity: number; notes?: string }[];

  @Prop()
  effectiveFrom?: Date;

  @Prop()
  effectiveTo?: Date;

  @Prop()
  notes?: string;
}

export const BomSchema = SchemaFactory.createForClass(Bom);
BomSchema.index({ productId: 1, version: 1 }, { unique: true });
