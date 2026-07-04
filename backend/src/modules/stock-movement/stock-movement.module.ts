import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { StockMovement, StockMovementSchema } from './stock-movement.schema';
import { StockMovementService } from './stock-movement.service';
import { StockMovementController } from './stock-movement.controller';
import { StorageItem, StorageItemSchema } from '../storage-item/storage-item.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: StockMovement.name, schema: StockMovementSchema },
      { name: StorageItem.name, schema: StorageItemSchema },
    ]),
  ],
  controllers: [StockMovementController],
  providers: [StockMovementService],
  exports: [StockMovementService, MongooseModule],
})
export class StockMovementModule {}
