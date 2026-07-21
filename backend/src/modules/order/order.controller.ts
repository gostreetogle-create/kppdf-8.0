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
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { Roles } from '../../common/decorators/roles.decorator';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { ReserveStockDto } from './dto/reserve-stock.dto';
import { AuditAction } from '../../common/decorators/audit-action.decorator';

@ApiTags('Закупки — Заказы')
@Controller('orders')
export class OrderController {
  constructor(private readonly service: OrderService) {}

  @Get()
  @ApiOperation({ summary: 'List all orders with optional filters' })
  @ApiQuery({ name: 'counterpartyId', required: false, description: 'Filter by counterparty' })
  @ApiQuery({ name: 'status', required: false, description: 'Filter by status' })
  @ApiQuery({ name: 'managerId', required: false, description: 'Filter by manager' })
  @ApiResponse({ status: 200, description: 'List of orders' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findAll(
    @Query('counterpartyId') counterpartyId?: string,
    @Query('status') status?: string,
    @Query('managerId') managerId?: string,
  ) {
    return this.service.findAll(counterpartyId, status, managerId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get order by ID' })
  @ApiResponse({ status: 200, description: 'Order found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  findOne(@Param('id') id: string) {
    return this.service.findById(id);
  }

  @Post()
  @Roles('admin', 'manager')
  @AuditAction({ action: 'create', entityType: 'Order' })
  @ApiOperation({ summary: 'Create a new order' })
  @ApiResponse({ status: 201, description: 'Order created' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  create(@Body() dto: CreateOrderDto) {
    return this.service.create(dto);
  }

  @Patch(':id')
  @Roles('admin', 'manager')
  @AuditAction({ action: 'update', entityType: 'Order' })
  @ApiOperation({ summary: 'Update an existing order' })
  @ApiResponse({ status: 200, description: 'Order updated' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  update(@Param('id') id: string, @Body() dto: UpdateOrderDto) {
    return this.service.update(id, dto);
  }

  @Post(':id/reserve-stock')
  @Roles('admin', 'manager')
  @AuditAction({ action: 'reserve_stock', entityType: 'Order' })
  @ApiOperation({ summary: 'Reserve stock for an order' })
  @ApiResponse({ status: 200, description: 'Stock reserved' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  reserveStock(@Param('id') id: string, @Body() dto: ReserveStockDto) {
    return this.service.reserveStock(id, dto.warehouseId, dto.zoneName);
  }

  @Post(':id/ship')
  @Roles('admin', 'manager')
  @AuditAction({ action: 'ship', entityType: 'Order' })
  @ApiOperation({ summary: 'Ship an order' })
  @ApiResponse({ status: 200, description: 'Order shipped' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  ship(
    @Param('id') id: string,
    @Body() body: { recipient?: string; address?: string; warehouseId?: string; driverInfo?: string },
  ) {
    return this.service.ship(id, body?.recipient, body?.address, body?.warehouseId, body?.driverInfo);
  }

  @Post(':id/cancel')
  @Roles('admin', 'manager')
  @AuditAction({ action: 'cancel', entityType: 'Order' })
  @ApiOperation({ summary: 'Cancel an order' })
  @ApiResponse({ status: 200, description: 'Order cancelled' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  cancel(@Param('id') id: string) {
    return this.service.cancel(id);
  }

  @Delete(':id')
  @Roles('admin', 'manager')
  @AuditAction({ action: 'delete', entityType: 'Order' })
  @ApiOperation({ summary: 'Delete an order' })
  @ApiResponse({ status: 200, description: 'Order deleted' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
