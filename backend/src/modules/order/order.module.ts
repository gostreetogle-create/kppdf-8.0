import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Order, OrderSchema } from './order.schema';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { CounterModule } from '../counter/counter.module';
import { ReservationModule } from '../reservation/reservation.module';
import { ShipmentModule } from '../shipment/shipment.module';
import { SessionRunner } from '../../common/db/session-runner';
import { SiteModule } from '../site/site.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Order.name, schema: OrderSchema }]),
    CounterModule,
    ReservationModule,
    ShipmentModule,
    SiteModule,
  ],
  controllers: [OrderController],
  providers: [OrderService, SessionRunner],
  exports: [OrderService, MongooseModule],
})
export class OrderModule {}
