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
import { StorageItemService } from './storage-item.service';
import { CreateStorageItemDto } from './dto/create-storage-item.dto';
import { UpdateStorageItemDto } from './dto/update-storage-item.dto';
import { AdjustStorageItemDto } from './dto/adjust-storage-item.dto';
import { AuditAction } from '../../common/decorators/audit-action.decorator';

@Controller()
export class StorageItemController {
  constructor(private readonly service: StorageItemService) {}

  @Post('products/:productId/storage-items')
  @Roles('admin', 'manager')
  @AuditAction({ action: 'create', entityType: 'StorageItem' })
  createForProduct(
    @Param('productId') productId: string,
    @Body() dto: CreateStorageItemDto,
  ) {
    return this.service.create({ ...dto, productId });
  }

  @Get('storage-items')
  findAll(
    @Query('warehouseId') warehouseId?: string,
    @Query('productId') productId?: string,
    @Query('lowStock') lowStock?: string,
  ) {
    return this.service.findAll(
      warehouseId,
      productId,
      lowStock === 'true' || lowStock === '1',
    );
  }

  @Get('storage-items/:id')
  findOne(@Param('id') id: string) {
    return this.service.findById(id);
  }

  @Patch('storage-items/:id')
  @Roles('admin', 'manager')
  @AuditAction({ action: 'update', entityType: 'StorageItem' })
  update(@Param('id') id: string, @Body() dto: UpdateStorageItemDto) {
    return this.service.update(id, dto);
  }

  @Post('storage-items/:id/adjust')
  @Roles('admin', 'manager')
  @AuditAction({ action: 'adjust', entityType: 'StorageItem' })
  adjust(@Param('id') id: string, @Body() dto: AdjustStorageItemDto) {
    return this.service.adjust(id, dto);
  }

  @Delete('storage-items/:id')
  @Roles('admin', 'manager')
  @AuditAction({ action: 'delete', entityType: 'StorageItem' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
