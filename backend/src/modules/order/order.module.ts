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
import { Quotation, QuotationSchema } from '../quotation/quotation.schema';
import { OrganizationModule } from '../organization/organization.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Order.name, schema: OrderSchema }]),
    // TZ-ORDERS-306: модель КП регистрируется здесь, а не через QuotationModule —
    // QuotationModule сам импортирует OrderModule (convert-to-order), и импорт
    // обратно дал бы циклическую зависимость модулей.
    MongooseModule.forFeature([{ name: Quotation.name, schema: QuotationSchema }]),
    CounterModule,
    ReservationModule,
    ShipmentModule,
    SiteModule,
    OrganizationModule,
  ],
  controllers: [OrderController],
  providers: [OrderService, SessionRunner],
  exports: [OrderService, MongooseModule],
})
export class OrderModule {}
