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
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Controller('categories')
export class CategoryController {
  constructor(private readonly service: CategoryService) {}

  @Get()
  @Roles('admin', 'manager')
  list(@Query('type') type?: string) {
    return this.service.findAll(type);
  }

  @Get('tree')
  @Roles('admin', 'manager')
  tree(@Query('type') type?: string) {
    return this.service.buildTree(type);
  }

  @Get(':id')
  @Roles('admin', 'manager')
  findOne(@Param('id') id: string) {
    return this.service.findById(id);
  }

  @Post()
  @Roles('admin')
  @AuditAction({ action: 'create', entityType: 'Category' })
  create(@Body() dto: CreateCategoryDto) {
    return this.service.create(dto);
  }

  @Post('reorder')
  @Roles('admin')
  @AuditAction({ action: 'reorder', entityType: 'Category' })
  reorder(@Body('categoryIds') categoryIds: string[]) {
    return this.service.reorder(categoryIds);
  }

  @Post('reorder-children')
  @Roles('admin')
  @AuditAction({ action: 'reorder', entityType: 'Category' })
  reorderChildren(
    @Body('parentId') parentId: string | null,
    @Body('childIds') childIds: string[],
  ) {
    return this.service.reorderChildren(parentId, childIds);
  }

  @Patch(':id')
  @Roles('admin')
  @AuditAction({ action: 'update', entityType: 'Category', idParam: 'id' })
  update(@Param('id') id: string, @Body() dto: UpdateCategoryDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @Roles('admin')
  @AuditAction({ action: 'delete', entityType: 'Category', idParam: 'id' })
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
