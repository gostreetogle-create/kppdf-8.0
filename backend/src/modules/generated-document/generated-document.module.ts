import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  GeneratedDocument,
  GeneratedDocumentSchema,
} from './generated-document.schema';
import { GeneratedDocumentService } from './generated-document.service';
import { GeneratedDocumentController } from './generated-document.controller';
import { DocumentTemplateModule } from '../document-template/document-template.module';
import { CounterModule } from '../counter/counter.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: GeneratedDocument.name, schema: GeneratedDocumentSchema },
    ]),
    DocumentTemplateModule,
    CounterModule,
  ],
  controllers: [GeneratedDocumentController],
  providers: [GeneratedDocumentService],
  exports: [GeneratedDocumentService, MongooseModule],
})
export class GeneratedDocumentModule {}
