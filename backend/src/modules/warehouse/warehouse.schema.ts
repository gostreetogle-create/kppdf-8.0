import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type WarehouseType = 'main' | 'branch' | 'transit' | 'production' | 'other';
export type WarehouseDocument = HydratedDocument<Warehouse>;

@Schema({ collection: 'warehouses', timestamps: true })
export class Warehouse {
  @Prop({ required: true, index: true })
  name!: string;

  @Prop({ required: true, enum: ['main', 'branch', 'transit', 'production', 'other'], default: 'main' })
  type!: WarehouseType;

  @Prop()
  address?: string;

  @Prop()
  description?: string;

  @Prop({ default: true, index: true })
  isActive!: boolean;

  /** Legacy zone names (string array). */
  @Prop({ type: [String], default: [] })
  zoneNames!: string[];

  @Prop({ type: [Types.ObjectId], ref: 'Role', default: [] })
  roleIds!: Types.ObjectId[];
}

export const WarehouseSchema = SchemaFactory.createForClass(Warehouse);
