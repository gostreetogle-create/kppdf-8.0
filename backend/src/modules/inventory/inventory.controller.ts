import { Controller, Get } from '@nestjs/common';
import { StorageItemService } from '../storage-item/storage-item.service';

@Controller('inventory')
export class InventoryController {
  constructor(private readonly storage: StorageItemService) {}

  @Get('low-stock')
  lowStock() {
    return this.storage.findAll(undefined, undefined, true);
  }
}
