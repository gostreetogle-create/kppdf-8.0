import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type MaterialDocument = HydratedDocument<Material>;

/**
 * Один измеряемый габарит материала. Используется в `Material.dimensions[]`.
 *
 * `type` — что измеряем (длина / ширина / высота / толщина / диаметр / глубина).
 * `value` — числовое значение (в мм, конвенция — мм везде).
 * `isImmutable` — если true, downstream-операции (продукция, модули) не могут
 * изменить это значение. Пример: толщина листа металла 2 мм — её нельзя
 * «раскатать», но длину и ширину можно резать.
 */
@Schema({ _id: false })
export class Dimension {
  @Prop({
    required: true,
    enum: ['length', 'width', 'height', 'thickness', 'diameter', 'depth'],
  })
  type!: 'length' | 'width' | 'height' | 'thickness' | 'diameter' | 'depth';

  @Prop({ required: true, min: 0 })
  value!: number;

  @Prop({ default: false })
  isImmutable!: boolean;
}

export const DimensionSchema = SchemaFactory.createForClass(Dimension);

@Schema({ collection: 'materials', timestamps: true })
export class Material {
  @Prop({ required: true, index: true })
  name!: string;

  @Prop({ index: true })
  article?: string;

  @Prop({ unique: true, sparse: true, index: true })
  sku?: string;

  @Prop({ required: true })
  unit!: string; // FK → Unit.key (m2/m3/kg/sheet/pcs/...)

  @Prop({ type: Types.ObjectId, ref: 'Category', index: true })
  categoryId?: Types.ObjectId;

  @Prop()
  description?: string;

  /**
   * Цена за единицу. Всегда в RUB — поле валюты отсутствует по политике
   * (см. docs/data-model.md «Политики → Валюта — всегда RUB»).
   */
  @Prop({ default: 0 })
  pricePerUnit?: number;

  @Prop({ default: 0 })
  stockQty?: number;

  @Prop({ type: [DimensionSchema], default: [] })
  dimensions!: Dimension[];

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Photo' }], default: [] })
  photoIds!: Types.ObjectId[];

  /** Главное фото (отмечается галочкой в форме; используется в карточках). */
  @Prop({ type: Types.ObjectId, ref: 'Photo' })
  mainPhotoId?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Organization' })
  supplierId?: Types.ObjectId;

  @Prop()
  notes?: string;
}

export const MaterialSchema = SchemaFactory.createForClass(Material);

// Индекс для частого запроса «все материалы конкретного поставщика».
MaterialSchema.index({ supplierId: 1 });
