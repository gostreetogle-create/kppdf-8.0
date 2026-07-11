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
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductService } from './product.service';

@Controller('products')
export class ProductController {
  constructor(private readonly service: ProductService) {}

  @Get()
  @Roles('admin', 'manager')
  list(
    @Query('page') page = '1',
    @Query('limit') limit = '20',
    @Query('search') search?: string,
    @Query('categoryId') categoryId?: string,
    @Query('status') status?: string,
    @Query('isActive') isActive?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: 'asc' | 'desc',
  ) {
    return this.service.findAll({
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      search,
      categoryId,
      status,
      isActive: isActive === 'true' ? true : isActive === 'false' ? false : undefined,
      sortBy,
      sortOrder,
    });
  }

  @Get(':id')
  @Roles('admin', 'manager', 'user')
  findOne(@Param('id') id: string) {
    return this.service.findById(id);
  }

  @Post()
  @Roles('admin', 'manager')
  @AuditAction({ action: 'create', entityType: 'Product' })
  create(@Body() dto: CreateProductDto) {
    return this.service.create(dto);
  }

  @Patch(':id')
  @Roles('admin', 'manager')
  @AuditAction({ action: 'update', entityType: 'Product', idParam: 'id' })
  update(@Param('id') id: string, @Body() dto: UpdateProductDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @Roles('admin', 'manager')
  @AuditAction({ action: 'delete', entityType: 'Product', idParam: 'id' })
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }

  /**
   * TZ-83 Фаза D.3: atomic attachModule / detachModule endpoints.
   * Используют MongoDB $addToSet / $pull — race-condition-safe,
   * в отличие от naive PATCH с заменой всего массива productModuleIds.
   *
   * Нюанс маршрутизации: Express позволяет коллизию `:id` и `:moduleId`,
   * поэтому detachModule объявлен ПОСЛЕ `findOne` (NestJS роутит по pathname,
   * не по method) — порядок важен для матчинга.
   */
  @Post(':productId/modules')
  @Roles('admin', 'manager')
  @AuditAction({
    action: 'attach-module',
    entityType: 'Product',
    idParam: 'productId',
  })
  attachModule(
    @Param('productId') productId: string,
    @Body() body: { moduleId: string },
  ) {
    return this.service.attachModule(productId, body.moduleId);
  }

  @Delete(':productId/modules/:moduleId')
  @Roles('admin', 'manager')
  @AuditAction({
    action: 'detach-module',
    entityType: 'Product',
    idParam: 'productId',
  })
  @HttpCode(HttpStatus.NO_CONTENT)
  detachModule(
    @Param('productId') productId: string,
    @Param('moduleId') moduleId: string,
  ) {
    return this.service.detachModule(productId, moduleId);
  }
}
