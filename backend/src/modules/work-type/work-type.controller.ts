import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { Roles } from '../../common/decorators/roles.decorator';
import { WorkTypeService } from './work-type.service';
import { CreateWorkTypeDto } from './dto/create-work-type.dto';
import { UpdateWorkTypeDto } from './dto/update-work-type.dto';
import { AuditAction } from '../../common/decorators/audit-action.decorator';

@Controller('work-types')
export class WorkTypeController {
  constructor(private readonly service: WorkTypeService) {}

  @Get()
  findAll(@Query('workCenterId') workCenterId?: string) {
    return this.service.findAll(workCenterId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findById(id);
  }

  @Post()
  @Roles('admin', 'manager')
  @AuditAction({ action: 'create', entityType: 'WorkType' })
  create(@Body() dto: CreateWorkTypeDto) {
    return this.service.create(dto);
  }

  @Patch(':id')
  @Roles('admin', 'manager')
  @AuditAction({ action: 'update', entityType: 'WorkType' })
  update(@Param('id') id: string, @Body() dto: UpdateWorkTypeDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @Roles('admin', 'manager')
  @AuditAction({ action: 'delete', entityType: 'WorkType' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
