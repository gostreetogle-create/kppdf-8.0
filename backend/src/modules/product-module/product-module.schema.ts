import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

// TZ-83 Review #6: явно `_id: false` для согласованности с остальными
// sub-docs (OverrideDimensions / WorkType / Material). Single (non-array)
// subdoc по умолчанию имеет `_id` поле, но в данном случае оно бесполезно
// (только одно поле `dimensions` на модуль, не нужно в него target-ить).
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
class OverrideDimensionsSchema {
  @Prop() length?: number;
  @Prop() width?: number;
  @Prop() height?: number;
  @Prop() unit?: string;
}

const OverrideDimensionsSchemaFactory =
  SchemaFactory.createForClass(OverrideDimensionsSchema);

@Schema({ _id: false })
class ModuleMaterialSchema {
  /**
   * TZ-83 Фаза A.3: ref + override subdoc.
   * Snapshot `name` удалён — тянется через populate по `materialId`.
   * Габариты/кол-во/unit можно override-ить в контексте модуля.
   */
  @Prop({ type: Types.ObjectId, ref: 'Material', required: true })
  materialId!: Types.ObjectId;

  @Prop({ default: 1 })
  quantity!: number;

  @Prop({ default: 'шт' })
  unit!: string;

  @Prop({ default: true })
  isPurchased!: boolean;

  @Prop({ type: OverrideDimensionsSchemaFactory })
  overrideDimensions?: {
    length?: number;
    width?: number;
    height?: number;
    unit?: string;
  };

  @Prop({ default: 0 })
  sortOrder!: number;
}

const ModuleMaterialSchemaFactory = SchemaFactory.createForClass(ModuleMaterialSchema);

export type ProductModuleDocument = HydratedDocument<ProductModule>;

@Schema({ collection: 'productmodules', timestamps: true })
export class ProductModule {
  @Prop({ required: true })
  name!: string;

  @Prop()
  article?: string;

  /**
   * TZ-83 Фаза A.3: `productId` УДАЛЁН. M:N связь через `Product.productModuleIds[]`.
   * Но filter по товару в API остаётся: `GET /product-modules?productId=X` —
   * backend делает reverse-lookup через `Product.productModuleIds`.
   */

  @Prop({ type: ModuleDimensionsSchemaFactory })
  dimensions?: { width?: number; height?: number; depth?: number; unit?: string };

  @Prop({ default: 0 })
  weight?: number;

  /**
   * TZ-83 Фаза A.3: `image: string` УДАЛЁН. Заменено на отдельную
   * entity `ProductModulePhoto` (см. A.7) с isMain/photoId/url/caption/sortOrder.
   */

  @Prop({ default: 0 })
  sortOrder!: number;

  @Prop({ type: [ModuleWorkTypeSchemaFactory], default: [] })
  workTypes!: {
    workTypeId: Types.ObjectId;
    estimatedHours: number;
    sortOrder: number;
  }[];

  @Prop({ type: [ModuleMaterialSchemaFactory], default: [] })
  materials!: {
    materialId: Types.ObjectId;
    quantity: number;
    unit: string;
    isPurchased: boolean;
    overrideDimensions?: {
      length?: number;
      width?: number;
      height?: number;
      unit?: string;
    };
    sortOrder: number;
  }[];
}

export const ProductModuleSchema = SchemaFactory.createForClass(ProductModule);
/**
 * TZ-83 Фаза A.3 index fix: старая пара `{productId: 1, sortOrder: 1}` стала
 * невалидной после удаления поля productId. Заменяем на единственный нужный:
 *  - `sortOrder: 1` для канонической сортировки листингов
 *
 * Review #7: `{ name: text }` индекс удалён за ненадобностью —
 * в текущем API нет `?search=` query для ProductModule, а текстовые индексы
 * стоят write-cost без отдачи. Если в будущем добавим поиск — вернём.
 */
ProductModuleSchema.index({ sortOrder: 1 });
