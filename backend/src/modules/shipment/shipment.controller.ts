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
import { ShipmentService } from './shipment.service';
import { CreateShipmentDto } from './dto/create-shipment.dto';
import { UpdateShipmentDto } from './dto/update-shipment.dto';
import { AddDocDto } from './dto/add-doc.dto';
import { AuditAction } from '../../common/decorators/audit-action.decorator';

@Controller('shipments')
export class ShipmentController {
  constructor(private readonly service: ShipmentService) {}

  @Get()
  findAll(
    @Query('orderId') orderId?: string,
    @Query('status') status?: string,
    @Query('date') date?: string,
  ) {
    return this.service.findAll(orderId, status, date ? new Date(date) : undefined);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findById(id);
  }

  @Post()
  @AuditAction({ action: 'create', entityType: 'Shipment' })
  create(@Body() dto: CreateShipmentDto) {
    return this.service.create(dto);
  }

  @Patch(':id')
  @AuditAction({ action: 'update', entityType: 'Shipment' })
  update(@Param('id') id: string, @Body() dto: UpdateShipmentDto) {
    return this.service.update(id, dto);
  }

  @Post(':id/dispatch')
  @AuditAction({ action: 'dispatch', entityType: 'Shipment' })
  dispatch(@Param('id') id: string) {
    return this.service.dispatch(id);
  }

  @Post(':id/add-doc')
  @AuditAction({ action: 'add_doc', entityType: 'Shipment' })
  addDoc(@Param('id') id: string, @Body() dto: AddDocDto) {
    return this.service.addDoc(id, dto);
  }

  @Delete(':id')
  @AuditAction({ action: 'delete', entityType: 'Shipment' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
