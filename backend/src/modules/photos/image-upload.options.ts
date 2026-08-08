import type { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { randomUUID } from 'crypto';

export const UPLOAD_DIR = process.env.UPLOAD_DIR ?? './uploads';

/** Один лимит и один список mime на все загрузки картинок. */
export const IMAGE_UPLOAD_MAX_BYTES = 10 * 1024 * 1024;
export const IMAGE_UPLOAD_MIME = /^image\/(jpeg|png|webp|gif|avif|svg\+xml)$/;

/**
 * TZ-ORG-ASSETS-301: конфиг вынесен из `photos.module.ts`, потому что теперь
 * картинки принимает не только `POST /photos/upload`, но и хранилище файлов
 * организации. Дублировать лимит/mime в двух модулях — способ разъехаться.
 */
export const imageUploadMulterOptions: MulterOptions = {
  storage: diskStorage({
    destination: UPLOAD_DIR,
    filename: (_req, file, cb) => {
      // {uuid}.{ext} — random prefix avoids collisions and path traversal.
      const id = randomUUID();
      cb(null, `${id}${extname(file.originalname ?? '')}`);
    },
  }),
  limits: {
    fileSize: IMAGE_UPLOAD_MAX_BYTES,
    files: 1,
  },
  fileFilter: (_req, file, cb) => {
    // Только картинки — никаких .exe/.zip/etc.
    if (!IMAGE_UPLOAD_MIME.test(file.mimetype)) {
      cb(new Error(`Unsupported mimetype: ${file.mimetype}`), false);
      return;
    }
    cb(null, true);
  },
};
