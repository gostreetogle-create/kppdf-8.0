import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Res } from '@nestjs/common';
import type { Response } from 'express';
import { DocumentTemplateService } from './document-template.service';
import { CreateDocumentTemplateDto } from './dto/create-document-template.dto';
import { UpdateDocumentTemplateDto } from './dto/update-document-template.dto';
import { AuditAction } from '../../common/decorators/audit-action.decorator';

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

  @Post()
  @AuditAction({ action: 'create', entityType: 'DocumentTemplate' })
  create(@Body() dto: CreateDocumentTemplateDto) {
    return this.service.create(dto);
  }

  @Patch(':id')
  @AuditAction({ action: 'update', entityType: 'DocumentTemplate' })
  update(@Param('id') id: string, @Body() dto: UpdateDocumentTemplateDto) {
    return this.service.update(id, dto);
  }

  @Post(':id/duplicate')
  @AuditAction({ action: 'duplicate', entityType: 'DocumentTemplate' })
  duplicate(@Param('id') id: string) {
    return this.service.duplicate(id);
  }

  @Post(':id/set-default')
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
  @AuditAction({ action: 'delete', entityType: 'DocumentTemplate' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
