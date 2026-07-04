import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ProductComponent, ProductComponentSchema } from './product-component.schema';
import { ProductComponentService } from './product-component.service';
import { ProductComponentController } from './product-component.controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: ProductComponent.name, schema: ProductComponentSchema }]),
  ],
  controllers: [ProductComponentController],
  providers: [ProductComponentService],
  exports: [ProductComponentService, MongooseModule],
})
export class ProductComponentModule {}
