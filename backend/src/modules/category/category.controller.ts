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
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { AuditAction } from '../../common/interceptors/audit.interceptor';
import { Roles } from '../../common/decorators/roles.decorator';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@ApiTags('Справочники — Категории')
@Controller('categories')
export class CategoryController {
  constructor(private readonly service: CategoryService) {}

  @Get()
  @Roles('admin', 'manager')
  @ApiOperation({ summary: 'List all categories' })
  @ApiQuery({ name: 'type', required: false, description: 'Filter by category type: material | product | general' })
  @ApiResponse({ status: 200, description: 'List of categories' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  list(@Query('type') type?: string) {
    return this.service.findAll(type);
  }

  @Get('tree')
  @Roles('admin', 'manager')
  @ApiOperation({ summary: 'Get categories as a nested tree structure' })
  @ApiQuery({ name: 'type', required: false, description: 'Filter by category type' })
  @ApiResponse({ status: 200, description: 'Category tree' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  tree(@Query('type') type?: string) {
    return this.service.buildTree(type);
  }

  @Get(':id')
  @Roles('admin', 'manager')
  @ApiOperation({ summary: 'Get category by ID' })
  @ApiResponse({ status: 200, description: 'Category found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Category not found' })
  findOne(@Param('id') id: string) {
    return this.service.findById(id);
  }

  @Post()
  @Roles('admin')
  @AuditAction({ action: 'create', entityType: 'Category' })
  @ApiOperation({ summary: 'Create a new category (admin only)' })
  @ApiResponse({ status: 201, description: 'Category created' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  create(@Body() dto: CreateCategoryDto) {
    return this.service.create(dto);
  }

  @Post('reorder')
  @Roles('admin')
  @AuditAction({ action: 'reorder', entityType: 'Category' })
  @ApiOperation({ summary: 'Reorder top-level categories' })
  @ApiResponse({ status: 200, description: 'Categories reordered' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  reorder(@Body('categoryIds') categoryIds: string[]) {
    return this.service.reorder(categoryIds);
  }

  @Post('reorder-children')
  @Roles('admin')
  @AuditAction({ action: 'reorder', entityType: 'Category' })
  @ApiOperation({ summary: 'Reorder child categories under a parent' })
  @ApiResponse({ status: 200, description: 'Children reordered' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  reorderChildren(
    @Body('parentId') parentId: string | null,
    @Body('childIds') childIds: string[],
  ) {
    return this.service.reorderChildren(parentId, childIds);
  }

  @Patch(':id')
  @Roles('admin')
  @AuditAction({ action: 'update', entityType: 'Category', idParam: 'id' })
  @ApiOperation({ summary: 'Update an existing category (admin only)' })
  @ApiResponse({ status: 200, description: 'Category updated' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Category not found' })
  update(@Param('id') id: string, @Body() dto: UpdateCategoryDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @Roles('admin')
  @AuditAction({ action: 'delete', entityType: 'Category', idParam: 'id' })
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a category (admin only)' })
  @ApiResponse({ status: 204, description: 'Category deleted' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Category not found' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
