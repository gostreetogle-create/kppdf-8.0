import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ProductModule as ProductModuleEntity, ProductModuleSchema } from './product-module.schema';
import { ProductModuleService } from './product-module.service';
import { ProductModuleController } from './product-module.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ProductModuleEntity.name, schema: ProductModuleSchema },
    ]),
  ],
  controllers: [ProductModuleController],
  providers: [ProductModuleService],
  exports: [ProductModuleService, MongooseModule],
})
export class ProductModuleModule {}
