import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { SystemRoleGuard } from '../../common/guards/system-role.guard';
import { AuditAction } from '../../common/interceptors/audit.interceptor';
import { Role, RoleDocument } from '../role/role.schema';
import { RoleService } from '../role/role.service';
import { AdminCreateRoleDto } from './dto/admin-role.dto';
import { AdminUpdateRoleDto } from './dto/admin-role.dto';
import { toClientRole } from './dto/mapper';

/**
 * TZ-256.B — roles-admin controller (full CRUD surface).
 *
 * Mounted at `/api/admin/roles`. Read paths ship since TZ-257; the
 * mutation paths (create / patch / delete) land here per TZ-256.B
 * (real /admin body — Roles CRUD remainder after TZ-257.A.1 shipped
 * Users CRUD).
 *
 * System-role semantics: system roles (`isSystem: true`) are
 * read-only after creation per TZ-257 §ШАГ 0. `SystemRoleGuard`
 * refuses PATCH/DELETE on system roles (403 `SYSTEM_ROLE_FROZEN`)
 * and escalation patches (403 `SYSTEM_ROLE_ESCALATION`). POST always
 * forces `isSystem: false` regardless of payload.
 *
 * TZ-257.B DTO-whitelist: mutations accept ONLY `AdminCreateRoleDto` /
 * `AdminUpdateRoleDto` (name/label/description/permissions). Internal
 * fields (`isSystem`, `sortOrder`, `sectionIds`, `isActive`) are not
 * declared, so the global `ValidationPipe({ whitelist: true,
 * forbidNonWhitelisted: true })` rejects them with 400 before any
 * controller/guard logic runs.
 *
 * All endpoints gated by the global guard stack (JwtAuthGuard →
 * PermissionsGuard → RolesGuard) plus per-method `@UseGuards` where
 * invariants apply. Every mutator emits an audit log via
 * `@AuditAction` (see contract block at end of file).
 */
@Controller('admin/roles')
export class RolesAdminController {
  constructor(
    @InjectModel(Role.name)
    private readonly roleModel: Model<RoleDocument>,
    private readonly roleService: RoleService,
  ) {}

  /**
   * GET /api/admin/roles
   * List all roles with their permission assignments.
   */
  @Get()
  @Permissions('role:read')
  @Roles('admin')
  async list(): Promise<ReturnType<typeof toClientRole>[]> {
    const docs = await this.roleModel.find().sort({ name: 1 }).lean().exec();
    return docs.map((d) => toClientRole(d as Record<string, unknown>));
  }

  /**
   * POST /api/admin/roles
   * Create a custom role. `isSystem` is ALWAYS forced to `false` —
   * system roles are bootstrapped by seed only (TZ-257 §ШАГ 0).
   */
  @Post()
  @Permissions('role:write')
  @Roles('admin')
  @AuditAction({ action: 'admin.role.created', entityType: 'Role' })
  async create(@Body() dto: AdminCreateRoleDto): Promise<ReturnType<typeof toClientRole>> {
    const doc = await this.roleService.create({ ...dto, isSystem: false });
    return toClientRole(doc as unknown as Record<string, unknown>);
  }

  /**
   * PATCH /api/admin/roles/:id
   * Update a custom role. System roles and escalation patches are
   * refused by `SystemRoleGuard`.
   */
  @Patch(':id')
  @Permissions('role:write')
  @Roles('admin')
  @UseGuards(SystemRoleGuard)
  @AuditAction({ action: 'admin.role.updated', entityType: 'Role', idParam: 'id' })
  async update(
    @Param('id') id: string,
    @Body() dto: AdminUpdateRoleDto,
  ): Promise<ReturnType<typeof toClientRole>> {
    const doc = await this.roleService.update(id, dto);
    return toClientRole(doc as unknown as Record<string, unknown>);
  }

  /**
   * DELETE /api/admin/roles/:id
   * Delete a custom role. System roles are refused by
   * `SystemRoleGuard`; the service additionally re-checks `isSystem`.
   */
  @Delete(':id')
  @Permissions('role:admin')
  @Roles('admin')
  @UseGuards(SystemRoleGuard)
  @AuditAction({ action: 'admin.role.deleted', entityType: 'Role', idParam: 'id' })
  async remove(@Param('id') id: string): Promise<{ success: true }> {
    await this.roleService.remove(id);
    return { success: true };
  }

  /**
   * GET /api/admin/roles/:id
   * Single role read.
   */
  @Get(':id')
  @Permissions('role:read')
  @Roles('admin')
  async getById(@Param('id') id: string): Promise<ReturnType<typeof toClientRole>> {
    const doc = await this.roleModel.findById(id).lean().exec();
    if (!doc) {
      throw new Error(`Role ${id} not found`);
    }
    return toClientRole(doc as Record<string, unknown>);
  }
}

/**
 * TZ-257.A AUDIT-EMISSION CONTRACT — applies to every mutator that
 * lands in TZ-257.A on this controller. Mirrors the contract from
 * `users-admin.controller.ts`.
 *
 * System roles (`isSystem: true`) MUST refuse `@UseGuards`-mutating
 * requests with 403 — apply either an inline check via
 * `this.roleModel.findById(id)` pre-mutation or a small `SystemRoleGuard`
 * (added in TZ-257.A).
 *
 *   // POST /api/admin/roles — create role (always isSystem: false)
 *   @Post()
 *   @Permissions('role:admin')
 *   @Roles('admin')
 *   @AuditAction({ action: 'admin.role.created', entityType: 'Role' })
 *   async create(@Body() dto: CreateRoleDto): Promise<ClientRole> {...}
 *
 *   // PATCH /api/admin/roles/:id — edit role (refuse if isSystem)
 *   @Patch(':id')
 *   @Permissions('role:write')
 *   @Roles('admin')
 *   @AuditAction({
 *     action: 'admin.role.updated',
 *     entityType: 'Role',
 *     idParam: 'id',
 *   })
 *   async update(@Param('id') id: string, @Body() dto: UpdateRoleDto): Promise<ClientRole> {...}
 *
 *   // DELETE /api/admin/roles/:id — refuse if isSystem
 *   @Delete(':id')
 *   @Permissions('role:admin')
 *   @Roles('admin')
 *   @AuditAction({
 *     action: 'admin.role.deleted',
 *     entityType: 'Role',
 *     idParam: 'id',
 *   })
 *   async remove(@Param('id') id: string): Promise<void> {...}
 *
 * The interceptor auto-emits the audit log; no manual `AuditService.log()`
 * calls are needed in mutators. If `details.before` snapshot is needed
 * for diff, inject `AuditService` manually and call it BEFORE the
 * mutation with `details: { before: snapshot, meta: { actor: req.user.username } }`.
 */
