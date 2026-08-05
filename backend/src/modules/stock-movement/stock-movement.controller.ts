import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { Roles } from '../../common/decorators/roles.decorator';
import { StockMovementService } from './stock-movement.service';
import { CreateStockMovementDto } from './dto/create-stock-movement.dto';
import { AuditAction } from '../../common/decorators/audit-action.decorator';

@Controller()
export class StockMovementController {
  constructor(private readonly service: StockMovementService) {}

  @Post('stock-movements')
  @Roles('admin', 'manager')
  @AuditAction({ action: 'create', entityType: 'StockMovement' })
  create(@Body() dto: CreateStockMovementDto) {
    return this.service.create(dto);
  }

  @Get('stock-movements')
  async findAll(
    @Query('warehouseId') warehouseId?: string,
    @Query('productId') productId?: string,
    @Query('materialId') materialId?: string,
    @Query('type') type?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    // Canonical envelope { items, total } — matches storage-items / low-stock.
    const items = await this.service.findAll(
      warehouseId,
      productId,
      type,
      from ? new Date(from) : undefined,
      to ? new Date(to) : undefined,
      materialId,
    );
    return { items, total: items.length };
  }

  @Get('inventory/movements/summary')
  summary(@Query('period') period?: 'day' | 'week' | 'month') {
    return this.service.summary(period ?? 'month');
  }

  @Delete('stock-movements/:id')
  @Roles('admin', 'manager')
  @AuditAction({ action: 'delete', entityType: 'StockMovement' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
