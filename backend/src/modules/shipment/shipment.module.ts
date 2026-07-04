import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Shipment, ShipmentSchema } from './shipment.schema';
import { ShipmentService } from './shipment.service';
import { ShipmentController } from './shipment.controller';
import { CounterModule } from '../counter/counter.module';
import { StockMovementModule } from '../stock-movement/stock-movement.module';
import { ReservationModule } from '../reservation/reservation.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Shipment.name, schema: ShipmentSchema }]),
    CounterModule,
    StockMovementModule,
    ReservationModule,
  ],
  controllers: [ShipmentController],
  providers: [ShipmentService],
  exports: [ShipmentService, MongooseModule],
})
export class ShipmentModule {}
