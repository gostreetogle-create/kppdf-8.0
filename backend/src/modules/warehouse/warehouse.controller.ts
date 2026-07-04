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
import { WarehouseService } from './warehouse.service';
import { CreateWarehouseDto } from './dto/create-warehouse.dto';
import { UpdateWarehouseDto } from './dto/update-warehouse.dto';
import { AuditAction } from '../../common/decorators/audit-action.decorator';

@Controller('warehouses')
export class WarehouseController {
  constructor(private readonly service: WarehouseService) {}

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findById(id);
  }

  @Get(':id/inventory')
  inventory(@Param('id') id: string) {
    return this.service.inventory(id);
  }

  @Get(':id/movements')
  movements(
    @Param('id') id: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.service.movements(
      id,
      from ? new Date(from) : undefined,
      to ? new Date(to) : undefined,
    );
  }

  @Get(':id/zones')
  zones(@Param('id') id: string) {
    return this.service.zones(id);
  }

  @Post()
  @AuditAction({ action: 'create', entityType: 'Warehouse' })
  create(@Body() dto: CreateWarehouseDto) {
    return this.service.create(dto);
  }

  @Patch(':id')
  @AuditAction({ action: 'update', entityType: 'Warehouse' })
  update(@Param('id') id: string, @Body() dto: UpdateWarehouseDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @AuditAction({ action: 'delete', entityType: 'Warehouse' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
