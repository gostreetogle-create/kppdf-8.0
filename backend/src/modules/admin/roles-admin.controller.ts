import { Controller, Get, Param } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role, RoleDocument } from '../role/role.schema';
import { toClientRole } from './dto/mapper';
// TZ-257.A audit-emission contract — see block comment at end of file.
// Not yet imported because TZ-257 mainline ships read-only slice; the
// import becomes mandatory when mutators land.
// import { AuditAction } from '../../common/interceptors/audit.interceptor';

/**
 * TZ-257 §ШАГ 2 — roles-admin controller (minimal-viable read surface).
 *
 * Mounted at `/api/admin/roles`. Ships ONLY the read paths since
 * role mutations (create / patch / delete) involve system-role
 * semantics that are deliberately TZ-257.A territory (see spec
 * TZ-257 §ШАГ 5 deferred items).
 *
 * The `isSystem` flag is included so the UI can render system roles
 * read-only, per TZ-257 §ШАГ 0 «System roles `isSystem: true` —
 * read-only after creation».
 */
@Controller('admin/roles')
export class RolesAdminController {
  constructor(
    @InjectModel(Role.name)
    private readonly roleModel: Model<RoleDocument>,
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
