import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { ReservationService } from './reservation.service';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { AuditAction } from '../../common/decorators/audit-action.decorator';

@Controller('reservations')
export class ReservationController {
  constructor(private readonly service: ReservationService) {}

  @Get()
  findAll(@Query('orderId') orderId?: string) {
    return this.service.findAll(orderId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findById(id);
  }

  @Post()
  @AuditAction({ action: 'create', entityType: 'Reservation' })
  create(@Body() dto: CreateReservationDto) {
    return this.service.create(dto);
  }

  @Post(':id/release')
  @AuditAction({ action: 'release', entityType: 'Reservation' })
  release(@Param('id') id: string) {
    return this.service.release(id);
  }

  @Post(':id/fulfill')
  @AuditAction({ action: 'fulfill', entityType: 'Reservation' })
  fulfill(@Param('id') id: string) {
    return this.service.fulfill(id);
  }

  @Delete(':id')
  @AuditAction({ action: 'delete', entityType: 'Reservation' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
