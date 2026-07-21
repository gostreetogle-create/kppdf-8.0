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
import { CreateMaterialDto } from './dto/create-material.dto';
import { UpdateMaterialDto } from './dto/update-material.dto';
import { MaterialService } from './material.service';

@ApiTags('Справочники — Материалы')
@Controller('materials')
export class MaterialController {
  constructor(private readonly service: MaterialService) {}

  @Get()
  @Roles('admin', 'manager')
  @ApiOperation({ summary: 'List all materials with pagination and filters' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page' })
  @ApiQuery({ name: 'search', required: false, description: 'Search by name' })
  @ApiQuery({ name: 'categoryId', required: false, description: 'Filter by category' })
  @ApiResponse({ status: 200, description: 'Paginated list of materials' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  list(
    @Query('page') page = '1',
    @Query('limit') limit = '20',
    @Query('search') search?: string,
    @Query('categoryId') categoryId?: string,
  ) {
    return this.service.findAll({ page: parseInt(page, 10), limit: parseInt(limit, 10), search, categoryId });
  }

  @Get(':id')
  @Roles('admin', 'manager', 'user')
  @ApiOperation({ summary: 'Get material by ID' })
  @ApiResponse({ status: 200, description: 'Material found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Material not found' })
  findOne(@Param('id') id: string) {
    return this.service.findById(id);
  }

  @Post()
  @Roles('admin', 'manager')
  @AuditAction({ action: 'create', entityType: 'Material' })
  @ApiOperation({ summary: 'Create a new material' })
  @ApiResponse({ status: 201, description: 'Material created' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  create(@Body() dto: CreateMaterialDto) {
    return this.service.create(dto);
  }

  @Patch(':id')
  @Roles('admin', 'manager')
  @AuditAction({ action: 'update', entityType: 'Material', idParam: 'id' })
  @ApiOperation({ summary: 'Update an existing material' })
  @ApiResponse({ status: 200, description: 'Material updated' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Material not found' })
  update(@Param('id') id: string, @Body() dto: UpdateMaterialDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @Roles('admin', 'manager')
  @AuditAction({ action: 'delete', entityType: 'Material', idParam: 'id' })
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a material' })
  @ApiResponse({ status: 204, description: 'Material deleted' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Material not found' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
