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
import {
  AuthenticatedUser,
  CurrentUser,
} from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { OrganizationService } from './organization.service';

@ApiTags('Справочники — Организации')
@Controller('organizations')
export class OrganizationController {
  constructor(private readonly service: OrganizationService) {}

  @Get()
  @Roles('admin', 'manager')
  @ApiOperation({ summary: 'List all organizations with pagination and filters' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page' })
  @ApiQuery({ name: 'search', required: false, description: 'Search by name' })
  @ApiQuery({ name: 'type', required: false, description: 'Filter by organization type' })
  @ApiResponse({ status: 200, description: 'Paginated list of organizations' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  list(
    @Query('page') page = '1',
    @Query('limit') limit = '20',
    @Query('search') search?: string,
    @Query('type') type?: string,
    @CurrentUser() user?: AuthenticatedUser,
  ) {
    return this.service.findAll(
      { page: parseInt(page, 10), limit: parseInt(limit, 10), search, type },
      user,
    );
  }

  /** TZ-PARTY-301 — «наша фирма» for documents. Declared before `:id`. */
  @Get('current')
  @Roles('admin', 'manager', 'user')
  @ApiOperation({ summary: 'Get the organization used as our own company' })
  @ApiResponse({ status: 200, description: 'Our organization' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Our organization is not configured' })
  findCurrent(@CurrentUser() user?: AuthenticatedUser) {
    return this.service.findCurrent(user);
  }

  @Get(':id')
  @Roles('admin', 'manager', 'user')
  @ApiOperation({ summary: 'Get organization by ID' })
  @ApiResponse({ status: 200, description: 'Organization found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Organization not found' })
  findOne(@Param('id') id: string, @CurrentUser() user?: AuthenticatedUser) {
    return this.service.findById(id, user);
  }

  @Post()
  @Roles('admin', 'manager')
  @AuditAction({ action: 'create', entityType: 'Organization' })
  @ApiOperation({ summary: 'Create a new organization' })
  @ApiResponse({ status: 201, description: 'Organization created' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  create(@Body() dto: CreateOrganizationDto) {
    return this.service.create(dto);
  }

  @Patch(':id')
  @Roles('admin', 'manager')
  @AuditAction({ action: 'update', entityType: 'Organization', idParam: 'id' })
  @ApiOperation({ summary: 'Update an existing organization' })
  @ApiResponse({ status: 200, description: 'Organization updated' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Organization not found' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateOrganizationDto,
    @CurrentUser() user?: AuthenticatedUser,
  ) {
    return this.service.update(id, dto, user);
  }

  @Delete(':id')
  @Roles('admin', 'manager')
  @AuditAction({ action: 'delete', entityType: 'Organization', idParam: 'id' })
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete an organization' })
  @ApiResponse({ status: 204, description: 'Organization deleted' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Organization not found' })
  remove(@Param('id') id: string, @CurrentUser() user?: AuthenticatedUser) {
    return this.service.remove(id, user);
  }
}
