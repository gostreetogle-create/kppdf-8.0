import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Product, ProductSchema } from './product.schema';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { ProductSubroutesController } from './product-subroutes.controller';
import { Category, CategorySchema } from '../category/category.schema';
import { CounterModule } from '../counter/counter.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Product.name, schema: ProductSchema },
      { name: Category.name, schema: CategorySchema },
    ]),
    CounterModule,
  ],
  controllers: [ProductController, ProductSubroutesController],
  providers: [ProductService],
  exports: [ProductService, MongooseModule],
})
export class ProductModule {}
