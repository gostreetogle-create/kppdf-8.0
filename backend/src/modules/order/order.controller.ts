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
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { ReserveStockDto } from './dto/reserve-stock.dto';
import { AuditAction } from '../../common/decorators/audit-action.decorator';

@Controller('orders')
export class OrderController {
  constructor(private readonly service: OrderService) {}

  @Get()
  findAll(
    @Query('counterpartyId') counterpartyId?: string,
    @Query('status') status?: string,
    @Query('managerId') managerId?: string,
  ) {
    return this.service.findAll(counterpartyId, status, managerId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findById(id);
  }

  @Post()
  @Roles('admin', 'manager')
  @AuditAction({ action: 'create', entityType: 'Order' })
  create(@Body() dto: CreateOrderDto) {
    return this.service.create(dto);
  }

  @Patch(':id')
  @Roles('admin', 'manager')
  @AuditAction({ action: 'update', entityType: 'Order' })
  update(@Param('id') id: string, @Body() dto: UpdateOrderDto) {
    return this.service.update(id, dto);
  }

  @Post(':id/reserve-stock')
  @Roles('admin', 'manager')
  @AuditAction({ action: 'reserve_stock', entityType: 'Order' })
  reserveStock(@Param('id') id: string, @Body() dto: ReserveStockDto) {
    return this.service.reserveStock(id, dto.warehouseId, dto.zoneName);
  }

  @Post(':id/ship')
  @Roles('admin', 'manager')
  @AuditAction({ action: 'ship', entityType: 'Order' })
  ship(
    @Param('id') id: string,
    @Body() body: { recipient?: string; address?: string; warehouseId?: string; driverInfo?: string },
  ) {
    return this.service.ship(id, body?.recipient, body?.address, body?.warehouseId, body?.driverInfo);
  }

  @Post(':id/cancel')
  @Roles('admin', 'manager')
  @AuditAction({ action: 'cancel', entityType: 'Order' })
  cancel(@Param('id') id: string) {
    return this.service.cancel(id);
  }

  @Delete(':id')
  @Roles('admin', 'manager')
  @AuditAction({ action: 'delete', entityType: 'Order' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
