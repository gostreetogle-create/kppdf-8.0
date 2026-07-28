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
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Roles } from '../../common/decorators/roles.decorator';
import { TemplateBlockService } from './template-block.service';
import { CreateTemplateBlockDto } from './dto/create-template-block.dto';
import { UpdateTemplateBlockDto } from './dto/update-template-block.dto';
import { ReorderBlocksDto } from './dto/reorder-blocks.dto';
import { AuditAction } from '../../common/decorators/audit-action.decorator';

@Controller()
export class TemplateBlockController {
  constructor(private readonly service: TemplateBlockService) {}

  @Get('template-blocks')
  findAll(@Query('templateId') templateId?: string) {
    return this.service.findAll(templateId);
  }

  @Get('template-blocks/:id')
  findOne(@Param('id') id: string) {
    return this.service.findById(id);
  }

  @Post('document-templates/:id/blocks')
  @Roles('admin', 'manager')
  @AuditAction({ action: 'create', entityType: 'TemplateBlock' })
  add(@Param('id') templateId: string, @Body() dto: Omit<CreateTemplateBlockDto, 'templateId'>) {
    return this.service.create({ ...dto, templateId });
  }

  @Post('document-templates/:id/blocks/reorder')
  @Roles('admin', 'manager')
  @AuditAction({ action: 'reorder', entityType: 'TemplateBlock' })
  reorder(@Param('id') templateId: string, @Body() dto: ReorderBlocksDto) {
    return this.service.reorder(templateId, dto.blockIds);
  }

  @Patch('template-blocks/:id')
  @Roles('admin', 'manager')
  @AuditAction({ action: 'update', entityType: 'TemplateBlock' })
  update(@Param('id') id: string, @Body() dto: UpdateTemplateBlockDto) {
    return this.service.update(id, dto);
  }

  @Delete('template-blocks/:id')
  @Roles('admin', 'manager')
  @AuditAction({ action: 'delete', entityType: 'TemplateBlock' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }

  /**
   * TZ-251 — Upload an image for a TemplateBlock. Multipart form data,
   * field name `file`. Persists under `./uploads/document-templates/<id>/`
   * and returns the relative URL the frontend prepends with `API_BASE_URL`.
   *
   * Two-layer validation: Multer's FileInterceptor (below) enforces the MIME
   * whitelist + 5MB limit during buffering; the service re-checks as
   * defense-in-depth + 404s on missing block + mkdir recursive + atomic write.
   *
   * NB: no HTTPS upload rate limit here (covered by global ThrottlerModule).
   * Each upload creates a NEW file on disk; cleanup on block hard-delete is
   * a TZ-251.1 followup.
   */
  @Post('template-blocks/:id/upload')
  @Roles('admin', 'manager')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 5 * 1024 * 1024 },
      fileFilter: (_req, file, cb) => {
        if (
          file.mimetype === 'image/png' ||
          file.mimetype === 'image/jpeg' ||
          file.mimetype === 'image/webp'
        ) {
          cb(null, true);
        } else {
          cb(
            new BadRequestException(
              `Unsupported MIME type: ${file.mimetype}. Allowed: PNG, JPEG, WEBP`,
            ),
            false,
          );
        }
      },
    }),
  )
  @AuditAction({ action: 'upload-image', entityType: 'TemplateBlock' })
  async uploadImage(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.service.uploadImage(id, file);
  }
}
