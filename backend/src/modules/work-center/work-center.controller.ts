import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { WorkCenterService } from './work-center.service';
import { CreateWorkCenterDto } from './dto/create-work-center.dto';
import { UpdateWorkCenterDto } from './dto/update-work-center.dto';
import { AuditAction } from '../../common/decorators/audit-action.decorator';

@Controller('work-centers')
export class WorkCenterController {
  constructor(private readonly service: WorkCenterService) {}

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findById(id);
  }

  @Post()
  @AuditAction({ action: 'create', entityType: 'WorkCenter' })
  create(@Body() dto: CreateWorkCenterDto) {
    return this.service.create(dto);
  }

  @Patch(':id')
  @AuditAction({ action: 'update', entityType: 'WorkCenter' })
  update(@Param('id') id: string, @Body() dto: UpdateWorkCenterDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @AuditAction({ action: 'delete', entityType: 'WorkCenter' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
