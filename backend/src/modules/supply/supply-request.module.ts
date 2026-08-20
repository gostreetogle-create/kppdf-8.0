import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SupplyRequest, SupplyRequestSchema } from './supply-request.schema';
import { SupplyRequestController } from './supply-request.controller';
import { SupplyRequestService } from './supply-request.service';
import { SupplyModule } from './supply.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: SupplyRequest.name, schema: SupplyRequestSchema },
    ]),
    // SupplyTaskService для spawn'а задачи реестра при «Заказано».
    SupplyModule,
  ],
  controllers: [SupplyRequestController],
  providers: [SupplyRequestService],
  exports: [SupplyRequestService],
})
export class SupplyRequestModule {}
