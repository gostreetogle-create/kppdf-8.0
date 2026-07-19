import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { Roles } from '../../common/decorators/roles.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';
import { memoryStorage } from 'multer';
import { DocumentTemplateService } from './document-template.service';
import { CreateDocumentTemplateDto } from './dto/create-document-template.dto';
import { UpdateDocumentTemplateDto } from './dto/update-document-template.dto';
import { BuildDocumentDto } from './dto/build-document.dto';
import { AuditAction } from '../../common/decorators/audit-action.decorator';

/**
 * TZ-86 Phase A.4 — DocumentTemplateController extended.
 *
 * New route: `POST /api/document-templates/:id/build`
 *   body = `BuildDocumentDto` ({ organizationId?, counterpartyId?, etc. })
 *   response = `text/html; charset=utf-8` rendered document.
 *
 * No `@AuditAction` decorator on /build — render is read-only-ish (no DB
 * writes), AuditInterceptor matches only decorated metadata. Adding a
 * decorator here would pollute audit-log with every preview render.
 */
@Controller('document-templates')
export class DocumentTemplateController {
  constructor(private readonly service: DocumentTemplateService) {}

  @Get()
  findAll(
    @Query('organizationId') organizationId?: string,
    @Query('docTypeId') docTypeId?: string,
    @Query('isDefault') isDefault?: string,
  ) {
    return this.service.findAll(
      organizationId,
      docTypeId,
      isDefault === undefined ? undefined : isDefault === 'true',
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findById(id);
  }

  @Get(':id/expanded')
  expanded(@Param('id') id: string) {
    return this.service.findExpanded(id);
  }

  /**
   * TZ-86 Phase A.4 — DataBinding-aware HTML build.
   * Returns inline HTML (text/html). Service injects resolved sourceIds
   * via parallel Mongoose lookups before delegating to existing renderHtml.
   */
  @Post(':id/build')
  @Roles('admin', 'manager')
  async build(
    @Param('id') id: string,
    @Body() dto: BuildDocumentDto,
    @Res() res: Response,
  ): Promise<void> {
    const html = await this.service.build(id, dto);
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(html);
  }

  /**
   * TZ-86 Phase A.6 — Upload background image (5 MB max, png|jpeg|webp).
   *
   * Multipart contract:
   *   - URL:    POST /api/document-templates/:id/upload-background
   *   - Field:  `file` (mandatory; required by FileInterceptor)
   *   - Limits: fileSize ≤ 5 MB, files ≤ 1, MIME ∈ {image/png, image/jpeg, image/webp}
   *   - Body:   nothing else (Auth header carries JWT).
   *
   * Response: `{ url: '/uploads/...', backgroundImage: string[] }`.
   *
   * Validation:
   *   - FileFilter rejects non-whitelisted MIMEs → BadRequestException → 400.
   *   - limit.fileSize triggers MulterError('LIMIT_FILE_SIZE') → caught by
   *     `MulterExceptionFilter` (registered in main.ts) → 413 Payload Too Large.
   *   - Service enforces MAX_BACKGROUND_IMAGES=5 → 409 Conflict on overflow.
   *   - Template not found → 404 (DocumentTemplateService.findById throws).
   *
   * Storage strategy: `memoryStorage()` so the buffer sits in RAM until the
   * service has validated the template ID and 5-image cap. Then we write the
   * file manually under `uploads/document-templates/{id}/{uuidv4}.{ext}` —
   * main.ts's `useStaticAssets` exposes those URLs at `/uploads/*`.
   */
  @Post(':id/upload-background')
  @Roles('admin', 'manager')
  @AuditAction({ action: 'upload_background', entityType: 'DocumentTemplate' })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      fileFilter: (_req, file, cb) => {
        const allowed = ['image/png', 'image/jpeg', 'image/webp'];
        if (!allowed.includes(file.mimetype)) {
          return cb(
            new BadRequestException(
              `Недопустимый MIME-тип файла: ${file.mimetype}. Разрешено: image/png | image/jpeg | image/webp.`,
            ),
            false,
          );
        }
        cb(null, true);
      },
      limits: { fileSize: 5 * 1024 * 1024, files: 1 },
    }),
  )
  async uploadBackground(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<{ url: string; backgroundImage: string[] }> {
    const url = await this.service.uploadBackground(id, file);
    const template = await this.service.findById(id);
    return { url, backgroundImage: template.backgroundImage };
  }

  @Post()
  @Roles('admin', 'manager')
  @AuditAction({ action: 'create', entityType: 'DocumentTemplate' })
  create(@Body() dto: CreateDocumentTemplateDto) {
    return this.service.create(dto);
  }

  @Patch(':id')
  @Roles('admin', 'manager')
  @AuditAction({ action: 'update', entityType: 'DocumentTemplate' })
  update(@Param('id') id: string, @Body() dto: UpdateDocumentTemplateDto) {
    return this.service.update(id, dto);
  }

  @Post(':id/duplicate')
  @Roles('admin', 'manager')
  @AuditAction({ action: 'duplicate', entityType: 'DocumentTemplate' })
  duplicate(@Param('id') id: string) {
    return this.service.duplicate(id);
  }

  @Post(':id/set-default')
  @Roles('admin', 'manager')
  @AuditAction({ action: 'set_default', entityType: 'DocumentTemplate' })
  setDefault(@Param('id') id: string) {
    return this.service.setDefault(id);
  }

  @Get(':id/preview')
  async preview(
    @Param('id') id: string,
    @Query('dataId') dataId: string | undefined,
    @Res() res: Response,
  ) {
    const html = await this.service.preview(id, dataId);
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(html);
  }

  @Delete(':id')
  @Roles('admin', 'manager')
  @AuditAction({ action: 'delete', entityType: 'DocumentTemplate' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }

  @Delete(':id/backgrounds/:index')
  @Roles('admin', 'manager')
  @AuditAction({ action: 'remove_background', entityType: 'DocumentTemplate' })
  removeBackground(
    @Param('id') id: string,
    @Param('index') index: string,
  ) {
    return this.service.removeBackground(id, parseInt(index, 10));
  }

  @Patch(':id/backgrounds/default')
  @Roles('admin', 'manager')
  @AuditAction({ action: 'set_default_background', entityType: 'DocumentTemplate' })
  setDefaultBackground(
    @Param('id') id: string,
    @Body('index') index: number,
  ) {
    return this.service.setDefaultBackground(id, index);
  }

  @Patch(':id/orientation')
  @Roles('admin', 'manager')
  @AuditAction({ action: 'set_orientation', entityType: 'DocumentTemplate' })
  setOrientation(
    @Param('id') id: string,
    @Body('orientation') orientation: 'portrait' | 'landscape',
  ) {
    return this.service.setOrientation(id, orientation);
  }
}
