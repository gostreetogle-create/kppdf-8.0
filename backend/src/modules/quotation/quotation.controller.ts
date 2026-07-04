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
import { QuotationService } from './quotation.service';
import { CreateQuotationDto } from './dto/create-quotation.dto';
import { UpdateQuotationDto } from './dto/update-quotation.dto';
import { AuditAction } from '../../common/decorators/audit-action.decorator';

@Controller('quotations')
export class QuotationController {
  constructor(private readonly service: QuotationService) {}

  @Get()
  findAll(
    @Query('counterpartyId') counterpartyId?: string,
    @Query('status') status?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.service.findAll(
      counterpartyId,
      status,
      from ? new Date(from) : undefined,
      to ? new Date(to) : undefined,
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findById(id);
  }

  @Post()
  @AuditAction({ action: 'create', entityType: 'Quotation' })
  create(@Body() dto: CreateQuotationDto) {
    return this.service.create(dto);
  }

  @Patch(':id')
  @AuditAction({ action: 'update', entityType: 'Quotation' })
  update(@Param('id') id: string, @Body() dto: UpdateQuotationDto) {
    return this.service.update(id, dto);
  }

  @Post(':id/duplicate')
  @AuditAction({ action: 'duplicate', entityType: 'Quotation' })
  duplicate(@Param('id') id: string) {
    return this.service.duplicate(id);
  }

  @Post(':id/convert-to-contract')
  @AuditAction({ action: 'convert_to_contract', entityType: 'Quotation' })
  convertToContract(@Param('id') id: string, @Body() body: { title?: string }) {
    return this.service.convertToContract(id, body?.title);
  }

  @Post(':id/convert-to-order')
  @AuditAction({ action: 'convert_to_order', entityType: 'Quotation' })
  convertToOrder(
    @Param('id') id: string,
    @Body() body: { deliveryAddress?: string; managerId?: string },
  ) {
    return this.service.convertToOrder(id, body?.deliveryAddress, body?.managerId);
  }

  @Delete(':id')
  @AuditAction({ action: 'delete', entityType: 'Quotation' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
