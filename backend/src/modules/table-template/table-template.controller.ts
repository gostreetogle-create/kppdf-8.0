import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { TableTemplateService } from './table-template.service';
import { CreateTableTemplateDto } from './dto/create-table-template.dto';
import { UpdateTableTemplateDto } from './dto/update-table-template.dto';
import { AuditAction } from '../../common/decorators/audit-action.decorator';

@Controller('table-templates')
export class TableTemplateController {
  constructor(private readonly service: TableTemplateService) {}

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findById(id);
  }

  @Post()
  @AuditAction({ action: 'create', entityType: 'TableTemplate' })
  create(@Body() dto: CreateTableTemplateDto) {
    return this.service.create(dto);
  }

  @Patch(':id')
  @AuditAction({ action: 'update', entityType: 'TableTemplate' })
  update(@Param('id') id: string, @Body() dto: UpdateTableTemplateDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @AuditAction({ action: 'delete', entityType: 'TableTemplate' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
