import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ProductModule as ProductModuleEntity, ProductModuleSchema } from './product-module.schema';
import { ProductModuleService } from './product-module.service';
import { ProductModuleController } from './product-module.controller';
import { Product, ProductSchema } from '../product/product.schema';

/**
 * TZ-83 Фаза A.5: ProductModuleService injects @InjectModel(Product.name)
 * для M:N reverse-lookup в findAll(productId). Регистрируем ProductSchema
 * локально чтобы model был доступен в рамках этого модуля.
 */
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ProductModuleEntity.name, schema: ProductModuleSchema },
      { name: Product.name, schema: ProductSchema },
    ]),
  ],
  controllers: [ProductModuleController],
  providers: [ProductModuleService],
  exports: [ProductModuleService, MongooseModule],
})
export class ProductModuleModule {}
