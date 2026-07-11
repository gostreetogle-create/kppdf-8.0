import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  ProductModulePhoto,
  ProductModulePhotoSchema,
} from './product-module-photo.schema';
import { ProductModulePhotoService } from './product-module-photo.service';
import { ProductModulePhotoController } from './product-module-photo.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ProductModulePhoto.name, schema: ProductModulePhotoSchema },
    ]),
  ],
  controllers: [ProductModulePhotoController],
  providers: [ProductModulePhotoService],
  exports: [ProductModulePhotoService, MongooseModule],
})
export class ProductModulePhotoModule {}
