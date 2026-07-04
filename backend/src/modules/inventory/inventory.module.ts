import { Module } from '@nestjs/common';
import { InventoryController } from './inventory.controller';
import { StorageItemModule } from '../storage-item/storage-item.module';

@Module({
  imports: [StorageItemModule],
  controllers: [InventoryController],
})
export class InventoryModule {}
