import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Photo, PhotoSchema } from './photo.schema';
import { PhotosService } from './photos.service';
import { PhotosController } from './photos.controller';

@Module({
  imports: [MongooseModule.forFeature([{ name: Photo.name, schema: PhotoSchema }])],
  controllers: [PhotosController],
  providers: [PhotosService],
  exports: [PhotosService, MongooseModule],
})
export class PhotosModule {}
