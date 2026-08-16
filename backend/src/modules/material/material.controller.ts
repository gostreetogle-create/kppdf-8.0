import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { AuditAction } from '../../common/interceptors/audit.interceptor';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser, AuthenticatedUser } from '../../common/decorators/current-user.decorator';
import { CreateMaterialDto, MATERIAL_KINDS } from './dto/create-material.dto';
import { UpdateMaterialDto } from './dto/update-material.dto';
import { MaterialService } from './material.service';

@ApiTags('Справочники — Материалы')
@Controller('materials')
export class MaterialController {
  constructor(private readonly service: MaterialService) {}

  @Get()
  @Roles('admin', 'director', 'manager')
  @ApiOperation({ summary: 'List all materials with pagination and filters' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page' })
  @ApiQuery({ name: 'search', required: false, description: 'Search by name' })
  @ApiQuery({ name: 'categoryId', required: false, description: 'Filter by category' })
  @ApiQuery({ name: 'materialKind', required: false, enum: MATERIAL_KINDS, description: 'Filter by catalog kind' })
  @ApiResponse({ status: 200, description: 'Paginated list of materials' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  list(@CurrentUser() user: AuthenticatedUser, @Query('page') page = '1', @Query('limit') limit = '20', @Query('search') search?: string, @Query('categoryId') categoryId?: string, @Query('materialKind') materialKind?: CreateMaterialDto['materialKind']) {
    return this.service.findAll({ page: parseInt(page, 10), limit: parseInt(limit, 10), search, categoryId, materialKind }, user.organizationId);
  }

  @Get(':id/where-used')
  @Roles('admin', 'director', 'manager', 'user')
  @ApiOperation({ summary: 'List catalog parents that use this material' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, description: 'Page size, max 100' })
  getWhereUsed(@Param('id') id: string, @Query('page') page = '1', @Query('limit') limit = '20', @CurrentUser() user: AuthenticatedUser) {
    return this.service.getWhereUsed(id, { page: parseInt(page, 10), limit: parseInt(limit, 10), organizationId: user.organizationId });
  }

  @Get(':id')
  @Roles('admin', 'director', 'manager', 'user')
  findOne(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) { return this.service.findById(id, user.organizationId); }

  @Post()
  @Roles('admin', 'manager')
  @AuditAction({ action: 'create', entityType: 'Material' })
  create(@Body() dto: CreateMaterialDto, @CurrentUser() user: AuthenticatedUser) { return this.service.create(dto, user.organizationId); }

  @Patch(':id')
  @Roles('admin', 'manager')
  @AuditAction({ action: 'update', entityType: 'Material', idParam: 'id' })
  update(@Param('id') id: string, @Body() dto: UpdateMaterialDto, @CurrentUser() user: AuthenticatedUser) { return this.service.update(id, dto, user.organizationId); }

  @Delete(':id')
  @Roles('admin', 'manager')
  @AuditAction({ action: 'delete', entityType: 'Material', idParam: 'id' })
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) { return this.service.remove(id, user.organizationId); }

  @Post(':id/duplicate')
  @Roles('admin', 'manager')
  @AuditAction({ action: 'duplicate', entityType: 'Material', idParam: 'id' })
  @HttpCode(HttpStatus.CREATED)
  duplicate(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) { return this.service.duplicate(id, user.organizationId); }
}
