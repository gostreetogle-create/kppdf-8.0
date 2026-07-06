import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { MongooseModule } from '@nestjs/mongoose';
import { randomUUID } from 'crypto';
import { Photo, PhotoSchema } from './photo.schema';
import { PhotosService } from './photos.service';
import { PhotosController } from './photos.controller';

const UPLOAD_DIR = process.env.UPLOAD_DIR ?? './uploads';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Photo.name, schema: PhotoSchema }]),
    MulterModule.register({
      storage: diskStorage({
        destination: UPLOAD_DIR,
        filename: (_req, file, cb) => {
          // {uuid}.{ext} — random prefix avoids collisions and path traversal.
          const id = randomUUID();
          cb(null, `${id}${extname(file.originalname ?? '')}`);
        },
      }),
      limits: {
        fileSize: 10 * 1024 * 1024, // 10 MB per upload
        files: 1,
      },
      fileFilter: (_req, file, cb) => {
        // Только картинки — никаких .exe/.zip/etc.
        if (!/^image\/(jpeg|png|webp|gif|avif|svg\+xml)$/.test(file.mimetype)) {
          cb(new Error(`Unsupported mimetype: ${file.mimetype}`), false);
          return;
        }
        cb(null, true);
      },
    }),
  ],
  controllers: [PhotosController],
  providers: [PhotosService],
  exports: [PhotosService, MongooseModule],
})
export class PhotosModule {}
