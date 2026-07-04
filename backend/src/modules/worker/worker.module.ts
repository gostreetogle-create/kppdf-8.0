import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Worker, WorkerSchema } from './worker.schema';
import { WorkerService } from './worker.service';
import { WorkerController } from './worker.controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Worker.name, schema: WorkerSchema }]),
  ],
  controllers: [WorkerController],
  providers: [WorkerService],
  exports: [WorkerService, MongooseModule],
})
export class WorkerModule {}
