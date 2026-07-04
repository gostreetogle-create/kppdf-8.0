import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Contract, ContractSchema } from './contract.schema';
import { ContractService } from './contract.service';
import { ContractController } from './contract.controller';
import { CounterModule } from '../counter/counter.module';
import { OrderModule } from '../order/order.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Contract.name, schema: ContractSchema }]),
    CounterModule,
    OrderModule,
  ],
  controllers: [ContractController],
  providers: [ContractService],
  exports: [ContractService, MongooseModule],
})
export class ContractModule {}
