import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { AuditAction } from '../../common/interceptors/audit.interceptor';
import { Roles } from '../../common/decorators/roles.decorator';
import { ProductModuleService, UpsertProductModuleDto } from './product-module.service';

@Controller('modules')
export class ProductModuleController {
  constructor(private readonly service: ProductModuleService) {}

  @Get()
  @Roles('admin', 'manager')
  list(@Query('productId') productId?: string) {
    return this.service.findAll(productId);
  }

  @Get(':id')
  @Roles('admin', 'manager')
  findOne(@Param('id') id: string) {
    return this.service.findById(id);
  }

  @Post()
  @Roles('admin', 'manager')
  @AuditAction({ action: 'create', entityType: 'ProductModule' })
  create(@Body() dto: UpsertProductModuleDto) {
    return this.service.create(dto);
  }

  @Patch(':id')
  @Roles('admin', 'manager')
  @AuditAction({ action: 'update', entityType: 'ProductModule', idParam: 'id' })
  update(@Param('id') id: string, @Body() dto: Partial<UpsertProductModuleDto>) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @Roles('admin', 'manager')
  @AuditAction({ action: 'delete', entityType: 'ProductModule', idParam: 'id' })
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
