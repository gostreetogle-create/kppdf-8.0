import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
} from '@nestjs/common';
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

  @Post()
  @Roles('admin', 'manager')
  @AuditAction({ action: 'create', entityType: 'Photo' })
  create(@Body() dto: CreatePhotoDto) {
    return this.service.create(dto);
  }

  /**
   * TODO: multipart file upload via @nestjs/platform-express + multer.
   * For now, clients POST pre-uploaded URLs (e.g. from S3 / external CDN).
   */
  @Post('upload')
  @Roles('admin', 'manager')
  upload() {
    return {
      error: 'Not implemented yet. POST JSON to /photos with pre-uploaded storageUrl.',
    };
  }

  @Delete(':id')
  @Roles('admin', 'manager')
  @AuditAction({ action: 'delete', entityType: 'Photo', idParam: 'id' })
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
