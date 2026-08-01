import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DocumentTemplate, DocumentTemplateSchema } from './document-template.schema';
import { DocumentTemplateService } from './document-template.service';
import { DocumentTemplateController } from './document-template.controller';
import { TemplateBlockModule } from '../template-block/template-block.module';
import { QuotationModule } from '../quotation/quotation.module';
import { ContractModule } from '../contract/contract.module';
import { OrderModule } from '../order/order.module';
import { CounterModule } from '../counter/counter.module';
import { OrganizationModule } from '../organization/organization.module';
import { CounterpartyModule } from '../counterparty/counterparty.module';
import { ProductModule } from '../product/product.module';
import { MaterialModule } from '../material/material.module';
import { WorkTypeModule } from '../work-type/work-type.module';
import { TableTemplateModule } from '../table-template/table-template.module';
import { TextBlockModule } from '../text-block/text-block.module';
import { OwnershipGuard } from '../../common/guards/ownership/ownership.guard';

/**
 * TZ-86 Phase A.4 — DocumentTemplateModule extended.
 *
 * TZ-251 §ШАГ 2 — Ownership guard is registered as a per-module provider
 * because it needs `@InjectModel(DocumentTemplate.name)` to work. Mongoose
 * models are module-scoped (the `forFeature` registration below), so a
 * guard that needs to read from this model must live in this module's DI
 * scope. A future cross-entity registry (TZ-251.A) can lift it to a
 * generic provider.
 *
 * @UseGuards(OwnershipGuard) on the controller class activates the guard
 * for every route in this controller. The `@OwnerOnly(entityKey)`
 * metadata is read INSIDE the guard's `canActivate()` — routes that
 * don't carry `@OwnerOnly` short-circuit to true.
 */
@Module({
  imports: [
    MongooseModule.forFeature([{ name: DocumentTemplate.name, schema: DocumentTemplateSchema }]),
    TemplateBlockModule,
    QuotationModule,
    ContractModule,
    OrderModule,
    CounterModule,
    // TZ-86 Phase A.4 — data source models for build()
    OrganizationModule,
    CounterpartyModule,
    ProductModule,
    MaterialModule,
    WorkTypeModule,
    TableTemplateModule,
    TextBlockModule,
  ],
  controllers: [DocumentTemplateController],
  providers: [DocumentTemplateService, OwnershipGuard],
  exports: [DocumentTemplateService, MongooseModule],
})
export class DocumentTemplateModule {}
