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
import { PurchaseRequestService } from './purchase-request.service';
import { CreatePurchaseRequestDto } from './dto/create-purchase-request.dto';
import { UpdatePurchaseRequestDto } from './dto/update-purchase-request.dto';
import { AuditAction } from '../../common/decorators/audit-action.decorator';
import { IsOptional, IsString } from 'class-validator';
import { IsObjectId } from '../../common/decorators/is-object-id.decorator';

class ConvertDto {
  @IsObjectId()
  supplierId!: string;

  @IsOptional() @IsString() title?: string;
}

@Controller('purchase-requests')
export class PurchaseRequestController {
  constructor(private readonly service: PurchaseRequestService) {}

  @Get()
  findAll(@Query('status') status?: string) {
    return this.service.findAll(status);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findById(id);
  }

  @Post()
  @AuditAction({ action: 'create', entityType: 'PurchaseRequest' })
  create(@Body() dto: CreatePurchaseRequestDto) {
    return this.service.create(dto);
  }

  @Patch(':id')
  @AuditAction({ action: 'update', entityType: 'PurchaseRequest' })
  update(@Param('id') id: string, @Body() dto: UpdatePurchaseRequestDto) {
    return this.service.update(id, dto);
  }

  @Post(':id/convert-to-purchase-order')
  @AuditAction({ action: 'convert', entityType: 'PurchaseRequest' })
  convert(@Param('id') id: string, @Body() dto: ConvertDto) {
    return this.service.convertToPurchaseOrder(id, dto.supplierId, dto.title);
  }

  @Delete(':id')
  @AuditAction({ action: 'delete', entityType: 'PurchaseRequest' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
