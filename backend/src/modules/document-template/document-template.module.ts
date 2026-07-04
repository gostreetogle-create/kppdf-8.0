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

@Module({
  imports: [
    MongooseModule.forFeature([{ name: DocumentTemplate.name, schema: DocumentTemplateSchema }]),
    TemplateBlockModule,
    QuotationModule,
    ContractModule,
    OrderModule,
    CounterModule,
  ],
  controllers: [DocumentTemplateController],
  providers: [DocumentTemplateService],
  exports: [DocumentTemplateService, MongooseModule],
})
export class DocumentTemplateModule {}
