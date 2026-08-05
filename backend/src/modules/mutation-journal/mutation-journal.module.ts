import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MaterialModule } from '../material/material.module';
import {
  MutationJournal,
  MutationJournalSchema,
} from './mutation-journal.schema';
import { MutationJournalController } from './mutation-journal.controller';
import { MutationJournalService } from './mutation-journal.service';

@Module({
  imports: [
    MaterialModule,
    MongooseModule.forFeature([
      { name: MutationJournal.name, schema: MutationJournalSchema },
    ]),
  ],
  controllers: [MutationJournalController],
  providers: [MutationJournalService],
  exports: [MutationJournalService],
})
export class MutationJournalModule {}
