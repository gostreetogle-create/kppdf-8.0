import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Material, MaterialSchema } from './material.schema';
import { MaterialService } from './material.service';
import { MaterialController } from './material.controller';
import { CounterModule } from '../counter/counter.module';
import { Category, CategorySchema } from '../category/category.schema';

@Module({
  imports: [
    CounterModule,
    MongooseModule.forFeature([
      { name: Material.name, schema: MaterialSchema },
      { name: Category.name, schema: CategorySchema },
    ]),
  ],
  controllers: [MaterialController],
  providers: [MaterialService],
  exports: [MaterialService, MongooseModule],
})
export class MaterialModule {}
