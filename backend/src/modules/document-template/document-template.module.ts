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

/**
 * TZ-86 Phase A.4 — DocumentTemplateModule extended.
 *
 * Imports `OrganizationModule`, `CounterpartyModule`, `ProductModule`,
 * `MaterialModule`, `WorkTypeModule` so DocumentTemplateService can inject
 * these models for the dataBinding-aware build() flow.
 *
 * Each imported module exports `MongooseModule` so its `forFeature` models
 * are re-registered in this module's DI scope — no shadow registration
 * needed.
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
  ],
  controllers: [DocumentTemplateController],
  providers: [DocumentTemplateService],
  exports: [DocumentTemplateService, MongooseModule],
})
export class DocumentTemplateModule {}
