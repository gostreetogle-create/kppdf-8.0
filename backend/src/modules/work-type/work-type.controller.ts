import {
  Body,
  Controller,
  Get,
  Delete,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Roles } from '../../common/decorators/roles.decorator';
import { WorkTypeService } from './work-type.service';
import { CreateWorkTypeDto } from './dto/create-work-type.dto';
import { UpdateWorkTypeDto } from './dto/update-work-type.dto';
import { AuditAction } from '../../common/decorators/audit-action.decorator';
import { CurrentUser, AuthenticatedUser } from '../../common/decorators/current-user.decorator';
import { CatalogGraphService } from '../catalog-graph/catalog-graph.service';

@ApiTags('Справочники — Виды работ')
@Controller('work-types')
export class WorkTypeController {
  constructor(private readonly service: WorkTypeService, private readonly catalogGraph: CatalogGraphService) {}

  @Get()
  findAll(@Query('workCenterId') workCenterId?: string) { return this.service.findAll(workCenterId); }

  @Get(':id/where-used')
  @Roles('admin', 'manager', 'user')
  @ApiOperation({ summary: 'List modules that use this work type' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, description: 'Page size, max 100' })
  @ApiResponse({ status: 200, description: 'Paginated work-type backlinks' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  getWhereUsed(@Param('id') id: string, @Query('page') page = '1', @Query('limit') limit = '20', @CurrentUser() user: AuthenticatedUser) {
    return this.catalogGraph.getWhereUsed('workType', id, { page: parseInt(page, 10), limit: parseInt(limit, 10), organizationId: user.organizationId });
  }

  @Get(':id')
  findOne(@Param('id') id: string) { return this.service.findById(id); }

  @Post()
  @Roles('admin', 'manager')
  @AuditAction({ action: 'create', entityType: 'WorkType' })
  create(@Body() dto: CreateWorkTypeDto) { return this.service.create(dto); }

  @Patch(':id')
  @Roles('admin', 'manager')
  @AuditAction({ action: 'update', entityType: 'WorkType' })
  update(@Param('id') id: string, @Body() dto: UpdateWorkTypeDto) { return this.service.update(id, dto); }

  @Delete(':id')
  @Roles('admin', 'manager')
  @AuditAction({ action: 'delete', entityType: 'WorkType' })
  remove(@Param('id') id: string) { return this.service.remove(id); }
}
