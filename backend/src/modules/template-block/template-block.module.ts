import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TemplateBlock, TemplateBlockSchema } from './template-block.schema';
import { TemplateBlockService } from './template-block.service';
import { TemplateBlockController } from './template-block.controller';
import { SessionRunner } from '../../common/db/session-runner';

@Module({
  imports: [MongooseModule.forFeature([{ name: TemplateBlock.name, schema: TemplateBlockSchema }])],
  controllers: [TemplateBlockController],
  providers: [TemplateBlockService, SessionRunner],
  exports: [TemplateBlockService, MongooseModule],
})
export class TemplateBlockModule {}
