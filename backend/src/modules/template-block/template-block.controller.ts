import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
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
  @AuditAction({ action: 'create', entityType: 'TemplateBlock' })
  add(@Param('id') templateId: string, @Body() dto: Omit<CreateTemplateBlockDto, 'templateId'>) {
    return this.service.create({ ...dto, templateId });
  }

  @Post('document-templates/:id/blocks/reorder')
  @AuditAction({ action: 'reorder', entityType: 'TemplateBlock' })
  reorder(@Param('id') templateId: string, @Body() dto: ReorderBlocksDto) {
    return this.service.reorder(templateId, dto.blockIds);
  }

  @Patch('template-blocks/:id')
  @AuditAction({ action: 'update', entityType: 'TemplateBlock' })
  update(@Param('id') id: string, @Body() dto: UpdateTemplateBlockDto) {
    return this.service.update(id, dto);
  }

  @Delete('template-blocks/:id')
  @AuditAction({ action: 'delete', entityType: 'TemplateBlock' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
