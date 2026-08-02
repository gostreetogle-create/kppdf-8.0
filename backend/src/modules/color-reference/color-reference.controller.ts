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
  Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { AuditAction } from '../../common/interceptors/audit.interceptor';
import { Roles } from '../../common/decorators/roles.decorator';
import type { Request } from 'express';
import { ColorReferenceService } from './color-reference.service';
import { CreateColorReferenceDto } from './dto/create-color-reference.dto';
import { UpdateColorReferenceDto } from './dto/update-color-reference.dto';

/**
 * TZ-PRODUCTS-301 — REST surface for color references.
 *
 * RBAC: admins + managers могут читать (нужно для dropdown товара);
 * мутации — admin/manager (по ТЗ). Read endpoints org-scoped по
 * `req.user.organizationId`; system-цвета видны каждой организации.
 * Mutations передают organizationId вызывающего в сервис (IDOR guard).
 */
@ApiTags('Справочники — Цвета (ColorReference)')
@Controller('color-references')
export class ColorReferenceController {
  constructor(private readonly service: ColorReferenceService) {}

  private orgOf(req: Request): string | null | undefined {
    return (req.user as { organizationId?: string | null } | undefined)
      ?.organizationId;
  }

  @Get()
  @Roles('admin', 'manager', 'user')
  @ApiOperation({ summary: 'List color references (org-scoped)' })
  @ApiQuery({ name: 'activeOnly', required: false, description: 'Only active colors' })
  @ApiQuery({ name: 'search', required: false, description: 'Search by name/slug' })
  @ApiResponse({ status: 200, description: 'List of colors' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  list(
    @Query('activeOnly') activeOnly?: string,
    @Query('search') search?: string,
    @Req() req?: Request,
  ) {
    return this.service.findAll({
      activeOnly: activeOnly === 'true',
      search,
      organizationId: this.orgOf(req as Request),
    });
  }

  @Get(':id')
  @Roles('admin', 'manager', 'user')
  @ApiOperation({ summary: 'Get color reference by ID' })
  @ApiResponse({ status: 200 })
  @ApiResponse({ status: 404 })
  findOne(@Param('id') id: string) {
    return this.service.findById(id);
  }

  @Post()
  @Roles('admin', 'manager')
  @AuditAction({ action: 'create', entityType: 'ColorReference' })
  @ApiOperation({ summary: 'Create a color reference (manager+)' })
  @ApiResponse({ status: 201 })
  @ApiResponse({ status: 400, description: 'Invalid hex / validation' })
  @ApiResponse({ status: 409, description: 'Duplicate slug in scope' })
  create(@Body() dto: CreateColorReferenceDto, @Req() req: Request) {
    return this.service.create(dto, this.orgOf(req));
  }

  @Patch(':id')
  @Roles('admin', 'manager')
  @AuditAction({ action: 'update', entityType: 'ColorReference', idParam: 'id' })
  @ApiOperation({ summary: 'Update / rename a color (manager+)' })
  @ApiResponse({ status: 200 })
  @ApiResponse({ status: 403, description: 'Foreign org scope' })
  @ApiResponse({ status: 409, description: 'Duplicate slug / system color' })
  update(@Param('id') id: string, @Body() dto: UpdateColorReferenceDto, @Req() req: Request) {
    return this.service.update(id, dto, this.orgOf(req));
  }

  @Delete(':id')
  @Roles('admin', 'manager')
  @AuditAction({ action: 'delete', entityType: 'ColorReference', idParam: 'id' })
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Soft-delete a color (manager+; 409 when system)' })
  @ApiResponse({ status: 204 })
  @ApiResponse({ status: 403 })
  @ApiResponse({ status: 409, description: 'System color' })
  remove(@Param('id') id: string, @Req() req: Request) {
    return this.service.remove(id, this.orgOf(req));
  }
}
