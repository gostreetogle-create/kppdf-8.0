import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuditAction } from '../../common/interceptors/audit.interceptor';
import { Roles } from '../../common/decorators/roles.decorator';
import { CreatePhotoDto, PhotosService } from './photos.service';

@Controller('photos')
export class PhotosController {
  constructor(private readonly service: PhotosService) {}

  @Get()
  @Roles('admin', 'manager')
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  @Roles('admin', 'manager', 'user')
  findOne(@Param('id') id: string) {
    return this.service.findById(id);
  }

  /** JSON-эндпоинт для регистрации уже загруженного URL (legacy). */
  @Post()
  @Roles('admin', 'manager')
  @AuditAction({ action: 'create', entityType: 'Photo' })
  create(@Body() dto: CreatePhotoDto) {
    return this.service.create(dto);
  }

  /**
   * Multipart upload. Поле формы: `file`. Сохраняет в ./uploads/{uuid}.{ext},
   * создаёт Photo запись со storageUrl `/uploads/{filename}`.
   */
  @Post('upload')
  @Roles('admin', 'manager')
  @UseInterceptors(FileInterceptor('file'))
  @AuditAction({ action: 'create', entityType: 'Photo' })
  async upload(
    @UploadedFile() file: {
      filename: string;
      originalname: string;
      mimetype: string;
      size: number;
    },
  ) {
    if (!file) {
      throw new Error('No file uploaded (field name must be "file")');
    }
    return this.service.create({
      storageUrl: `/uploads/${file.filename}`,
      originalFilename: file.originalname,
      mimeType: file.mimetype,
      sizeBytes: file.size,
      variant: 'original',
    });
  }

  @Delete(':id')
  @Roles('admin', 'manager')
  @AuditAction({ action: 'delete', entityType: 'Photo', idParam: 'id' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    await this.service.remove(id);
  }
}
