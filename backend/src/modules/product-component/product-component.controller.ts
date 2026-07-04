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
} from '@nestjs/common';
import { AuditAction } from '../../common/interceptors/audit.interceptor';
import { Roles } from '../../common/decorators/roles.decorator';
import { ProductComponentService, UpsertProductComponentDto } from './product-component.service';

@Controller('products/:productId/components')
export class ProductComponentController {
  constructor(private readonly service: ProductComponentService) {}

  @Get()
  @Roles('admin', 'manager', 'user')
  list(@Param('productId') productId: string) {
    return this.service.findByProduct(productId);
  }

  @Post()
  @Roles('admin', 'manager')
  @AuditAction({ action: 'create-component', entityType: 'ProductComponent' })
  create(@Param('productId') productId: string, @Body() body: Omit<UpsertProductComponentDto, 'productId'>) {
    return this.service.create({ productId, ...body });
  }

  @Patch(':id')
  @Roles('admin', 'manager')
  @AuditAction({ action: 'update-component', entityType: 'ProductComponent' })
  update(@Param('id') id: string, @Body() body: Partial<UpsertProductComponentDto>) {
    return this.service.update(id, body);
  }

  @Delete(':id')
  @Roles('admin', 'manager')
  @AuditAction({ action: 'delete-component', entityType: 'ProductComponent' })
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
