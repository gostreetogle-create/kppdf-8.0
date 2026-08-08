import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  AuthenticatedUser,
  CurrentUser,
} from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { AuditAction } from '../../common/interceptors/audit.interceptor';
import {
  CreateSupplyTaskDto,
  UpdateSupplyTaskDto,
} from './dto/create-supply-task.dto';
import { SupplyTaskService } from './supply-task.service';

@Controller('supply-tasks')
export class SupplyTaskController {
  constructor(private readonly service: SupplyTaskService) {}

  @Get()
  @Roles('admin', 'manager', 'user')
  list(
    @Query('orderId') orderId?: string,
    @Query('status') status?: string,
  ) {
    return this.service.findAll({ orderId, status });
  }

  @Get(':id')
  @Roles('admin', 'manager', 'user')
  findOne(@Param('id') id: string) {
    return this.service.findById(id);
  }

  @Post()
  @Roles('admin', 'manager')
  @AuditAction({ action: 'create', entityType: 'SupplyTask' })
  create(@Body() dto: CreateSupplyTaskDto) {
    return this.service.create(dto);
  }

  @Patch(':id')
  @Roles('admin', 'manager')
  @AuditAction({ action: 'update', entityType: 'SupplyTask', idParam: 'id' })
  update(@Param('id') id: string, @Body() dto: UpdateSupplyTaskDto) {
    return this.service.update(id, dto);
  }

  @Post(':id/confirm')
  @Roles('admin', 'manager')
  @AuditAction({ action: 'confirm', entityType: 'SupplyTask', idParam: 'id' })
  confirm(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.service.confirm(id, user.id);
  }

  @Post(':id/ordered')
  @Roles('admin', 'manager')
  @AuditAction({ action: 'ordered', entityType: 'SupplyTask', idParam: 'id' })
  markOrdered(@Param('id') id: string) {
    return this.service.markOrdered(id);
  }

  @Post(':id/received')
  @Roles('admin', 'manager')
  @AuditAction({ action: 'received', entityType: 'SupplyTask', idParam: 'id' })
  markReceived(@Param('id') id: string) {
    return this.service.markReceived(id);
  }

  @Delete(':id')
  @Roles('admin', 'manager')
  @AuditAction({ action: 'delete', entityType: 'SupplyTask', idParam: 'id' })
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
