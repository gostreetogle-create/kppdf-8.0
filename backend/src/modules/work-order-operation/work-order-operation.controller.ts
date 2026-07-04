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
import { WorkOrderOperationService } from './work-order-operation.service';
import { CreateWorkOrderOperationDto } from './dto/create-work-order-operation.dto';
import { UpdateWorkOrderOperationDto } from './dto/update-work-order-operation.dto';
import { AuditAction } from '../../common/decorators/audit-action.decorator';

@Controller('work-order-operations')
export class WorkOrderOperationController {
  constructor(private readonly service: WorkOrderOperationService) {}

  @Get()
  findAll(@Query('workOrderId') workOrderId?: string) {
    return this.service.findAll(workOrderId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findById(id);
  }

  @Post()
  @AuditAction({ action: 'create', entityType: 'WorkOrderOperation' })
  create(@Body() dto: CreateWorkOrderOperationDto) {
    return this.service.create(dto);
  }

  @Patch(':id')
  @AuditAction({ action: 'update', entityType: 'WorkOrderOperation' })
  update(@Param('id') id: string, @Body() dto: UpdateWorkOrderOperationDto) {
    return this.service.update(id, dto);
  }

  @Post(':id/start')
  @AuditAction({ action: 'start', entityType: 'WorkOrderOperation' })
  start(@Param('id') id: string) {
    return this.service.start(id);
  }

  @Post(':id/complete')
  @AuditAction({ action: 'complete', entityType: 'WorkOrderOperation' })
  complete(
    @Param('id') id: string,
    @Body() body: { actualDuration?: number; completedBy?: string },
  ) {
    return this.service.complete(id, body?.actualDuration, body?.completedBy);
  }

  @Delete(':id')
  @AuditAction({ action: 'delete', entityType: 'WorkOrderOperation' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
