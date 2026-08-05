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
import { CurrentUser, AuthenticatedUser } from '../../common/decorators/current-user.decorator';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { CreateCompositionLineDto, UpdateCompositionLineDto } from '../catalog/composition-line.dto';
import { CatalogGraphService, MAX_DEPTH } from '../catalog-graph/catalog-graph.service';
import { ProductService } from './product.service';

@ApiTags('Справочники — Продукты')
@Controller('products')
export class ProductController {
  constructor(
    private readonly service: ProductService,
    private readonly catalogGraph: CatalogGraphService,
  ) {}

  @Get()
  @Roles('admin', 'manager')
  @ApiOperation({ summary: 'List all products with pagination and filters' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page' })
  @ApiQuery({ name: 'search', required: false, description: 'Search by name' })
  @ApiQuery({ name: 'categoryId', required: false, description: 'Filter by category' })
  @ApiQuery({ name: 'status', required: false, description: 'Filter by status' })
  @ApiQuery({ name: 'isActive', required: false, description: 'Filter by active flag' })
  @ApiQuery({ name: 'sortBy', required: false, description: 'Sort field' })
  @ApiQuery({ name: 'sortOrder', required: false, description: 'Sort direction: asc | desc' })
  @ApiResponse({ status: 200, description: 'Paginated list of products' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  list(
    @Query('page') page = '1', @Query('limit') limit = '20', @Query('search') search?: string,
    @Query('categoryId') categoryId?: string, @Query('status') status?: string,
    @Query('isActive') isActive?: string, @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: 'asc' | 'desc',
  ) {
    return this.service.findAll({
      page: parseInt(page, 10), limit: parseInt(limit, 10), search, categoryId, status,
      isActive: isActive === 'true' ? true : isActive === 'false' ? false : undefined,
      sortBy, sortOrder,
    });
  }

  @Get(':id/where-used')
  @Roles('admin', 'manager', 'user')
  @ApiOperation({ summary: 'List products that use this product' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page, max 100' })
  getWhereUsed(@Param('id') id: string, @Query('page') page = '1', @Query('limit') limit = '20', @CurrentUser() user: AuthenticatedUser) {
    return this.catalogGraph.getWhereUsed('product', id, { page: parseInt(page, 10), limit: parseInt(limit, 10), organizationId: user.organizationId });
  }

  @Get(':id/composition')
  @Roles('admin', 'manager', 'user')
  getComposition(@Param('id') id: string) { return this.service.getComposition(id); }

  @Post(':id/composition')
  @Roles('admin', 'manager')
  @AuditAction({ action: 'add-composition-line', entityType: 'Product', idParam: 'id' })
  addComposition(@Param('id') id: string, @Body() dto: CreateCompositionLineDto) { return this.service.addComposition(id, dto); }

  @Patch(':id/composition/:lineId')
  @Roles('admin', 'manager')
  @AuditAction({ action: 'update-composition-line', entityType: 'Product', idParam: 'id' })
  updateComposition(@Param('id') id: string, @Param('lineId') lineId: string, @Body() dto: UpdateCompositionLineDto) {
    return this.service.updateComposition(id, lineId, dto);
  }

  @Delete(':id/composition/:lineId')
  @Roles('admin', 'manager')
  @HttpCode(HttpStatus.NO_CONTENT)
  @AuditAction({ action: 'remove-composition-line', entityType: 'Product', idParam: 'id' })
  async removeComposition(@Param('id') id: string, @Param('lineId') lineId: string) { await this.service.removeComposition(id, lineId); }

  @Get(':id/tree')
  @Roles('admin', 'manager', 'user')
  getTree(@Param('id') id: string, @Query('maxDepth') maxDepth?: string) {
    return this.catalogGraph.getTree('product', id, maxDepth === undefined ? MAX_DEPTH : Number(maxDepth));
  }

  @Get(':id')
  @Roles('admin', 'manager', 'user')
  @ApiOperation({ summary: 'Get product by ID' })
  @ApiResponse({ status: 200, description: 'Product found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  findOne(@Param('id') id: string) { return this.service.findById(id); }

  @Post()
  @Roles('admin', 'manager')
  @AuditAction({ action: 'create', entityType: 'Product' })
  @ApiOperation({ summary: 'Create a new product' })
  @ApiResponse({ status: 201, description: 'Product created' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  create(@Body() dto: CreateProductDto) { return this.service.create(dto); }

  @Patch(':id')
  @Roles('admin', 'manager')
  @AuditAction({ action: 'update', entityType: 'Product', idParam: 'id' })
  @ApiOperation({ summary: 'Update an existing product' })
  @ApiResponse({ status: 200, description: 'Product updated' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  update(@Param('id') id: string, @Body() dto: UpdateProductDto) { return this.service.update(id, dto); }

  @Delete(':id')
  @Roles('admin', 'manager')
  @AuditAction({ action: 'delete', entityType: 'Product', idParam: 'id' })
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a product' })
  @ApiResponse({ status: 204, description: 'Product deleted' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  remove(@Param('id') id: string) { return this.service.remove(id); }

  @Post(':productId/modules')
  @Roles('admin', 'manager')
  @AuditAction({ action: 'attach-module', entityType: 'Product', idParam: 'productId' })
  @ApiOperation({ summary: 'Attach a module to a product' })
  @ApiResponse({ status: 201, description: 'Module attached' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Product or module not found' })
  attachModule(@Param('productId') productId: string, @Body() body: { moduleId: string }) {
    return this.service.attachModule(productId, body.moduleId);
  }

  @Delete(':productId/modules/:moduleId')
  @Roles('admin', 'manager')
  @AuditAction({ action: 'detach-module', entityType: 'Product', idParam: 'productId' })
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Detach a module from a product' })
  @ApiResponse({ status: 204, description: 'Module detached' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  detachModule(@Param('productId') productId: string, @Param('moduleId') moduleId: string) {
    return this.service.detachModule(productId, moduleId);
  }
}
