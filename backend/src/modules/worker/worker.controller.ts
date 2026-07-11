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
import { WorkerService } from './worker.service';
import { CreateWorkerDto } from './dto/create-worker.dto';
import { UpdateWorkerDto } from './dto/update-worker.dto';
import { AuditAction } from '../../common/decorators/audit-action.decorator';

@Controller('workers')
export class WorkerController {
  constructor(private readonly service: WorkerService) {}

  @Get()
  findAll(
    @Query('workTypeId') workTypeId?: string,
    @Query('isActive') isActive?: string,
  ) {
    const active =
      isActive === undefined ? undefined : isActive === 'true' || isActive === '1';
    return this.service.findAll(workTypeId, active);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findById(id);
  }

  @Post()
  @Roles('admin', 'manager')
  @AuditAction({ action: 'create', entityType: 'Worker' })
  create(@Body() dto: CreateWorkerDto) {
    return this.service.create(dto);
  }

  @Patch(':id')
  @Roles('admin', 'manager')
  @AuditAction({ action: 'update', entityType: 'Worker' })
  update(@Param('id') id: string, @Body() dto: UpdateWorkerDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @Roles('admin', 'manager')
  @AuditAction({ action: 'delete', entityType: 'Worker' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
