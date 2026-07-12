import {
  Injectable,
  Logger,
  OnApplicationBootstrap,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Category, CategoryDocument } from '../../modules/category/category.schema';

interface SeedCategory {
  name: string;
  slug: string;
  type: 'material' | 'product' | 'general';
  skuPrefix: string;
  sortOrder: number;
  description?: string;
}

const DEFAULT_CATEGORIES: readonly SeedCategory[] = [
  // Materials
  { name: 'Металлы',        slug: 'metals',        type: 'material', skuPrefix: 'MTL', sortOrder: 10, description: 'Сталь, алюминий, медь и сплавы' },
  { name: 'Пластик',        slug: 'plastic',        type: 'material', skuPrefix: 'PLS', sortOrder: 20, description: 'Полимерные материалы' },
  { name: 'Дерево',         slug: 'wood',           type: 'material', skuPrefix: 'WD',  sortOrder: 30, description: 'Пиломатериалы и плитные материалы' },
  { name: 'Текстиль',       slug: 'textile',        type: 'material', skuPrefix: 'TXT', sortOrder: 40, description: 'Ткани и нетканые материалы' },
  { name: 'Комплектующие',  slug: 'components',     type: 'material', skuPrefix: 'CMP', sortOrder: 50, description: 'Фурнитура, крепёж, электроника' },
  // Products
  { name: 'Мебель',         slug: 'furniture',      type: 'product',  skuPrefix: 'FUR', sortOrder: 60, description: 'Корпусная и офисная мебель' },
  { name: 'Вывески',        slug: 'signage',        type: 'product',  skuPrefix: 'SGN', sortOrder: 70, description: 'Таблички, баннеры, световые короба' },
  { name: 'Упаковка',       slug: 'packaging',      type: 'product',  skuPrefix: 'PKG', sortOrder: 80, description: 'Упаковочные изделия' },
] as const;

@Injectable()
export class CategoriesSeed implements OnApplicationBootstrap {
  private readonly logger = new Logger(CategoriesSeed.name);

  constructor(
    @InjectModel(Category.name) private readonly model: Model<CategoryDocument>,
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    for (const c of DEFAULT_CATEGORIES) {
      const existing = await this.model.findOne({ slug: c.slug, type: c.type }).exec();
      if (existing) continue;

      try {
        await this.model.create({
          name: c.name,
          slug: c.slug,
          type: c.type,
          skuPrefix: c.skuPrefix,
          sortOrder: c.sortOrder,
          isActive: true,
          fullPath: c.slug,
          description: c.description,
        });
        this.logger.log(`Category seeded: ${c.type}/${c.slug}`);
      } catch (err) {
        this.logger.warn(`Could not seed category ${c.slug}: ${(err as Error).message}`);
      }
    }
  }
}

