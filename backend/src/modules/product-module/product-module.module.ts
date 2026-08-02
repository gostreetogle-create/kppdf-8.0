import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ProductModule as ProductModuleEntity, ProductModuleSchema } from './product-module.schema';
import { ProductModuleService } from './product-module.service';
import { ProductModuleController } from './product-module.controller';
import { Product, ProductSchema } from '../product/product.schema';
import { Material, MaterialSchema } from '../material/material.schema';

/**
 * TZ-83: ProductModuleService uses Product for M:N reverse lookup and
 * Material for TZ-MATERIALS-309 immutable-dimension enforcement.
 */
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ProductModuleEntity.name, schema: ProductModuleSchema },
      { name: Product.name, schema: ProductSchema },
      { name: Material.name, schema: MaterialSchema },
    ]),
  ],
  controllers: [ProductModuleController],
  providers: [ProductModuleService],
  exports: [ProductModuleService, MongooseModule],
})
export class ProductModuleModule {}
