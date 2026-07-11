import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { Roles } from '../../common/decorators/roles.decorator';
import { ProductionOrderService } from './production-order.service';
import { CreateProductionOrderDto } from './dto/create-production-order.dto';
import { UpdateProductionOrderDto } from './dto/update-production-order.dto';
import { AuditAction } from '../../common/decorators/audit-action.decorator';
import { OrderTask, OrderTaskDocument } from '../order-task/order-task.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

@Controller('production-orders')
export class ProductionOrderController {
  constructor(
    private readonly service: ProductionOrderService,
    @InjectModel(OrderTask.name)
    private readonly orderTaskModel: Model<OrderTaskDocument>,
  ) {}

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findById(id);
  }

  @Get(':id/tasks')
  async findTasks(@Param('id') id: string) {
    if (!Types.ObjectId.isValid(id)) return [];
    return this.orderTaskModel
      .find({ productionOrderId: new Types.ObjectId(id) })
      .populate('workTypeId')
      .populate('workCenterId')
      .populate('workerId')
      .populate('componentId')
      .populate('dependsOnTaskIds')
      .sort({ sortOrder: 1 })
      .exec();
  }

  @Post()
  @Roles('admin', 'manager')
  @AuditAction({ action: 'create', entityType: 'ProductionOrder' })
  create(@Body() dto: CreateProductionOrderDto) {
    return this.service.create(dto);
  }

  @Patch(':id')
  @Roles('admin', 'manager')
  @AuditAction({ action: 'update', entityType: 'ProductionOrder' })
  update(@Param('id') id: string, @Body() dto: UpdateProductionOrderDto) {
    return this.service.update(id, dto);
  }

  @Post(':id/start')
  @Roles('admin', 'manager')
  @AuditAction({ action: 'start', entityType: 'ProductionOrder' })
  start(@Param('id') id: string) {
    return this.service.start(id);
  }

  @Post(':id/close')
  @Roles('admin', 'manager')
  @AuditAction({ action: 'close', entityType: 'ProductionOrder' })
  close(@Param('id') id: string) {
    return this.service.close(id);
  }

  @Delete(':id')
  @Roles('admin', 'manager')
  @AuditAction({ action: 'delete', entityType: 'ProductionOrder' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
