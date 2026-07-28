import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { Roles } from '../../common/decorators/roles.decorator';
import { AuditAction } from '../../common/decorators/audit-action.decorator';
import { CurrentUser, AuthenticatedUser } from '../../common/decorators/current-user.decorator';
import { WarehouseAccessService } from './warehouse-access.service';
import { CreateWarehouseAccessDto } from './dto/create-warehouse-access.dto';

@ApiTags('Справочники — Доступ к складам')
@Controller('warehouse-accesses')
export class WarehouseAccessController {
  constructor(private readonly service: WarehouseAccessService) {}

  @Get()
  @ApiOperation({
    summary: 'List active warehouse-access grants (filtered by warehouseId or roleId)',
  })
  @ApiQuery({ name: 'warehouseId', required: false })
  @ApiQuery({ name: 'roleId', required: false })
  @ApiResponse({ status: 200, description: 'List of active grants' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async list(
    @Query('warehouseId') warehouseId?: string,
    @Query('roleId') roleId?: string,
  ) {
    if (warehouseId) return this.service.findByWarehouseId(warehouseId);
    if (roleId) return this.service.findByRoleId(roleId);
    return [];
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get warehouse-access grant by ID' })
  @ApiResponse({ status: 200, description: 'Grant found' })
  @ApiResponse({ status: 404, description: 'Not found' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @Roles('admin', 'manager')
  @AuditAction({ action: 'create', entityType: 'WarehouseAccess' })
  @ApiOperation({ summary: 'Grant warehouse access to a role' })
  @ApiResponse({ status: 201, description: 'Grant created' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 409, description: 'Active grant exists for (warehouseId+roleId+permission)' })
  async create(
    @Body() dto: CreateWarehouseAccessDto,
    @CurrentUser() me: AuthenticatedUser,
  ) {
    return this.service.grant(dto, me.id);
  }

  @Post(':id/revoke')
  @Roles('admin', 'manager')
  @AuditAction({ action: 'revoke', entityType: 'WarehouseAccess' })
  @ApiOperation({ summary: 'Revoke an active grant (soft-delete)' })
  @ApiResponse({ status: 200, description: 'Grant revoked' })
  @ApiResponse({ status: 404, description: 'Not found' })
  revoke(@Param('id') id: string) {
    return this.service.revoke(id);
  }

  @Post(':id/reactivate')
  @Roles('admin', 'manager')
  @AuditAction({ action: 'reactivate', entityType: 'WarehouseAccess' })
  @ApiOperation({ summary: 'Reactivate a previously revoked grant' })
  @ApiResponse({ status: 200, description: 'Grant reactivated' })
  @ApiResponse({ status: 404, description: 'Not found' })
  reactivate(@Param('id') id: string) {
    return this.service.reactivate(id);
  }

  @Delete(':id')
  @Roles('admin')
  @AuditAction({ action: 'delete', entityType: 'WarehouseAccess' })
  @ApiOperation({ summary: 'Hard-delete a warehouse-access grant (admin only)' })
  @ApiResponse({ status: 200, description: 'Grant deleted' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Not found' })
  remove(@Param('id') id: string) {
    return this.service.hardDelete(id);
  }
}
