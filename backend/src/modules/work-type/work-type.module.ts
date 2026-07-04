import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { WorkType, WorkTypeSchema } from './work-type.schema';
import { WorkTypeService } from './work-type.service';
import { WorkTypeController } from './work-type.controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: WorkType.name, schema: WorkTypeSchema }]),
  ],
  controllers: [WorkTypeController],
  providers: [WorkTypeService],
  exports: [WorkTypeService, MongooseModule],
})
export class WorkTypeModule {}
