import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { StockMovementService } from './stock-movement.service';
import { CreateStockMovementDto } from './dto/create-stock-movement.dto';
import { AuditAction } from '../../common/decorators/audit-action.decorator';

@Controller()
export class StockMovementController {
  constructor(private readonly service: StockMovementService) {}

  @Post('stock-movements')
  @AuditAction({ action: 'create', entityType: 'StockMovement' })
  create(@Body() dto: CreateStockMovementDto) {
    return this.service.create(dto);
  }

  @Get('stock-movements')
  findAll(
    @Query('warehouseId') warehouseId?: string,
    @Query('productId') productId?: string,
    @Query('type') type?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.service.findAll(
      warehouseId,
      productId,
      type,
      from ? new Date(from) : undefined,
      to ? new Date(to) : undefined,
    );
  }

  @Get('inventory/movements/summary')
  summary(@Query('period') period?: 'day' | 'week' | 'month') {
    return this.service.summary(period ?? 'month');
  }

  @Delete('stock-movements/:id')
  @AuditAction({ action: 'delete', entityType: 'StockMovement' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
