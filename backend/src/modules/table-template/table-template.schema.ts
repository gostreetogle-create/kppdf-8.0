import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

@Schema({ _id: false })
export class TableColumn {
  @Prop({ required: true })
  key!: string;

  @Prop({ required: true })
  label!: string;

  @Prop({ default: 100 })
  width!: number;

  @Prop({ enum: ['left', 'center', 'right'], default: 'left' })
  align!: 'left' | 'center' | 'right';

  @Prop()
  format?: string;
}

const TableColumnSchema = SchemaFactory.createForClass(TableColumn);

export type TableTemplateDocument = HydratedDocument<TableTemplate>;

@Schema({ collection: 'table_templates', timestamps: true })
export class TableTemplate {
  @Prop({ required: true, index: true })
  name!: string;

  @Prop()
  description?: string;

  @Prop({ type: [TableColumnSchema], default: [] })
  columns!: TableColumn[];

  @Prop({ default: true })
  isActive!: boolean;
}

export const TableTemplateSchema = SchemaFactory.createForClass(TableTemplate);
