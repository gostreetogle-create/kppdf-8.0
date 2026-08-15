import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { Roles } from '../../common/decorators/roles.decorator';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { AuthenticatedUser, CurrentUser } from '../../common/decorators/current-user.decorator';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { SetOrderLineReadyDto } from './dto/set-order-line-ready.dto';
import { PatchEstimateDaysDto } from './dto/patch-estimate-days.dto';
import { PatchEstimateStartDto } from './dto/patch-estimate-start.dto';
import { ReserveStockDto } from './dto/reserve-stock.dto';
import { AuditAction } from '../../common/decorators/audit-action.decorator';
import { RequireOrgScope } from '../../common/decorators/require-org-scope.decorator';
import { OrgScopeGuardInterceptor } from '../../common/interceptors/org-scope.interceptor';

@ApiTags('Закупки — Заказы')
@RequireOrgScope()
@UseInterceptors(OrgScopeGuardInterceptor)
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

  @Post(':id/stub-proposal')
  @Roles('admin', 'manager')
  @AuditAction({ action: 'stub_proposal', entityType: 'Order' })
  @ApiOperation({
    summary: 'Создать черновик КП (заглушку) для прямого заказа',
    description:
      'Идемпотентно: если у заказа уже есть КП, возвращает его с created=false. ' +
      'Организацию берём из JWT → «наша фирма» → единственная (TZ-PARTY-301).',
  })
  @ApiResponse({ status: 201, description: 'КП-заглушка создана или уже существовала' })
  @ApiResponse({ status: 400, description: 'Заказ отменён или без позиций' })
  @ApiResponse({ status: 404, description: 'Заказ не найден / «наша фирма» не настроена' })
  async createStubProposal(@Param('id') id: string, @CurrentUser() user?: AuthenticatedUser) {
    const { quotation, created } = await this.service.ensureStubProposal(
      id,
      user ? { organizationId: user.organizationId, role: user.role } : undefined,
    );
    return { quotationId: quotation._id.toString(), created, quotation };
  }

  @Patch(':id/items/:lineIndex/ready')
  @Roles('admin', 'manager')
  @AuditAction({ action: 'line_ready', entityType: 'Order', idParam: 'id' })
  setLineReady(
    @Param('id') id: string,
    @Param('lineIndex') lineIndex: string,
    @Body() dto: SetOrderLineReadyDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.service.setLineReady(id, lineIndex, dto.readyForWork, user.id);
  }

  @Patch(':id/items/:lineIndex/status')
  @Roles('admin', 'manager')
  @AuditAction({ action: 'line_status', entityType: 'Order', idParam: 'id' })
  @ApiOperation({ summary: 'Change status of a specific order item' })
  @ApiResponse({ status: 200, description: 'Item status updated' })
  @ApiResponse({ status: 404, description: 'Order or line not found' })
  setItemStatus(
    @Param('id') id: string,
    @Param('lineIndex') lineIndex: string,
    @Body() body: { status: 'pending' | 'in_production' | 'ready' | 'shipped' },
  ) {
    return this.service.setItemStatus(id, lineIndex, body.status);
  }

  @Patch(':id/estimate-days')
  @Permissions('production:write')
  @AuditAction({ action: 'estimate_days', entityType: 'Order', idParam: 'id' })
  @ApiOperation({
    summary: 'Upsert or clear order-level estimate days override (Gantt)',
    description:
      'Composite key (orderItemIndex, moduleId, workTypeId). days: null removes override. ' +
      'Does not mutate WorkType catalog. Requires production:write (admin * passes).',
  })
  @ApiResponse({ status: 200, description: 'Order with updated estimateDayOverrides' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden — missing production:write' })
  @ApiResponse({ status: 404, description: 'Order or line not found' })
  patchEstimateDays(@Param('id') id: string, @Body() dto: PatchEstimateDaysDto) {
    return this.service.patchEstimateDays(id, dto);
  }

  @Patch(':id/estimate-start')
  @Permissions('production:write')
  @AuditAction({ action: 'estimate_start', entityType: 'Order', idParam: 'id' })
  @ApiOperation({
    summary: 'Upsert or clear per-bar Gantt start offset (parallel)',
    description:
      'Composite key (orderItemIndex, moduleId, workTypeId). offsetDays from visualAnchor; null clears. ' +
      'Requires production:write (admin * passes).',
  })
  @ApiResponse({ status: 200, description: 'Order with updated estimateStartOffsets' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden — missing production:write' })
  @ApiResponse({ status: 404, description: 'Order or line not found' })
  patchEstimateStart(@Param('id') id: string, @Body() dto: PatchEstimateStartDto) {
    return this.service.patchEstimateStart(id, dto);
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
