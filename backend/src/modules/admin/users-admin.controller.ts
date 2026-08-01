import { Controller, Get, Param, Query } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { User, UserDocument } from '../user/user.schema';
import { Role, RoleDocument } from '../role/role.schema';
import { toClientUser } from './dto/mapper';
// TZ-257.A audit-emission contract — see block comment below. Not yet
// imported here because TZ-257 mainline ships read-only slice; the
// import becomes mandatory when mutators land.
// import { AuditAction } from '../../common/interceptors/audit.interceptor';

/**
 * TZ-257 §ШАГ 1 — users-admin controller (minimal-viable read surface).
 *
 * Mounted at `/api/admin/users`. This initial slice ships ONLY the
 * read paths (`list`, `getById`) with mandatory `passwordHash`
 * redaction. Mutations (create / patch / change-password / activate /
 * deactivate / delete) ship in TZ-257.A and will apply `@UseGuards(LastAdminGuard)`
 * on the mutating endpoints only.
 *
 * DTO mapping policy (TZ-257 §ШАГ 1 acceptance criterion
 * "passwordHash NEVER returned to client"):
 *
 *   - `passwordHash` field → ALWAYS stripped via `toClientUser()` mapper.
 *   - `refreshTokenVersion` → dropped (not exposed); TZ-257.A may add
 *     a "rotated at" marker if a UI sentinel becomes necessary.
 *   - `__v` Mongoose versionKey → preserved (helps with optimistic
 *     locking).
 *
 * All endpoints gated by:
 *   1. JwtAuthGuard (APP_GUARD, global)       → 401
 *   2. PermissionsGuard (APP_GUARD, global)   → 403
 *   3. RolesGuard (APP_GUARD, global)         → 403 (legacy)
 *
 * LastAdminGuard is NOT applied at class level here — the guard is a
 * no-op for read paths (no `:id` mutation), and misleading
 * class-level decoration purchases zero security for the cost of
 * confusion. Per-method @UseGuards(LastAdminGuard) is added in TZ-257.A
 * alongside the mutators.
 *
 * Permissions posture:
 *   - LIST (`GET /`) gated by `@Permissions('user:admin')` — a regular
 *     `user:read` is reserved for self-service lookups; the LIST path
 *     enumerates ALL users and is admin-only.
 *   - GET `:id` gated by `@Permissions('user:read')` — self profile reads
 *     by the user themselves; route-level Idempotency is handled by
 *     Nest `findById` throwing NotFoundException on missing id.
 */
@Controller('admin/users')
export class UsersAdminController {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
    @InjectModel(Role.name)
    private readonly roleModel: Model<RoleDocument>,
  ) {}

  /**
   * GET /api/admin/users
   * List all users with `passwordHash` REDACTED. Pagination via
   * `?limit=` + `?offset=`. Optional `?role=` filter (matches user.role).
   *
   * Permission gate: `@Permissions('user:admin')` — admin-only because
   * the LIST enumerates every user. `user:read` is reserved for
   * self-service lookups in TZ-257.A.
   */
  @Get()
  @Permissions('user:admin')
  @Roles('admin')
  async list(
    @Query('limit') limitRaw?: string,
    @Query('offset') offsetRaw?: string,
    @Query('role') role?: string,
  ): Promise<ReturnType<typeof toClientUser>[]> {
    const limit = Math.min(parseInt(limitRaw ?? '50', 10) || 50, 200);
    const offset = parseInt(offsetRaw ?? '0', 10) || 0;
    const filter: Record<string, unknown> = {};
    if (role) filter.role = role;
    const docs = await this.userModel
      .find(filter)
      .skip(offset)
      .limit(limit)
      .sort({ createdAt: -1 })
      .lean()
      .exec();
    return docs.map((d) => toClientUser(d as Record<string, unknown>));
  }

  /**
   * GET /api/admin/users/:id
   * Single user read with `passwordHash` REDACTED. Returns 404 via
   * Mongoose `findById` when id is missing (NestJS auto-converts to
   * NotFoundException).
   *
   * Permission gate: `@Permissions('user:read')` — also gated by
   * `@Roles('admin')` — single-record reads are appropriate for the
   * self-service lookup flow (TZ-257.A may add a non-admin
   * `/api/users/me` mirror).
   */
  @Get(':id')
  @Permissions('user:read')
  @Roles('admin')
  async getById(@Param('id') id: string): Promise<ReturnType<typeof toClientUser>> {
    const doc = await this.userModel.findById(id).lean().exec();
    if (!doc) {
      // 404 is implicit; Nest's default exception filter handles.
      throw new Error(`User ${id} not found`);
    }
    return toClientUser(doc as Record<string, unknown>);
  }
}

/**
 * TZ-257.A AUDIT-EMISSION CONTRACT — applies to every mutator that
 * lands in TZ-257.A on this controller.
 *
 * The global `AuditInterceptor` (registered as `APP_INTERCEPTOR` in
 * `app.module.ts`) inspects each handler for `@AuditAction({ action,
 * entityType, idParam? })`. For POST/PATCH/PUT/DELETE handlers with
 * this decorator it auto-emits an `AuditLog` after the response
 * resolves:
 *
 *   - `action`           — string written verbatim to `AuditLog.action`.
 *   - `entityType`       — written to `AuditLog.entityType`.
 *   - `entityId`         — resolved from the route param named in
 *                          `idParam` (e.g. `idParam: 'id'`), or
 *                          from the response body's `_id`/`id` field.
 *   - `userId`/`userName`— auto-filled from AsyncLocalStorage via
 *                          `UserContextInterceptor` (TZ-04).
 *   - `details.after`    — auto-captured from the response body via
 *                          `safeSnapshot()` (drops `passwordHash`,
 *                          `password`, `refreshToken`).
 *
 * TZ-257.A mutator decorators MUST follow this shape verbatim:
 *
 *   // POST /api/admin/users — create user
 *   @Post()
 *   @Permissions('user:admin')
 *   @Roles('admin')
 *   @UseGuards(LastAdminGuard) // n/a for create, omitted in practice
 *   @AuditAction({ action: 'admin.user.created', entityType: 'User' })
 *   async create(@Body() dto: CreateUserDto): Promise<ClientUser> {...}
 *
 *   // PATCH /api/admin/users/:id — edit user
 *   @Patch(':id')
 *   @Permissions('user:admin')
 *   @Roles('admin')
 *   @UseGuards(LastAdminGuard) // YES when target.role === 'admin'
 *   @AuditAction({
 *     action: 'admin.user.updated',
 *     entityType: 'User',
 *     idParam: 'id',
 *   })
 *   async update(@Param('id') id: string, @Body() dto: UpdateUserDto): Promise<ClientUser> {...}
 *
 *   // POST /api/admin/users/:id/deactivate — last-admin invariant
 *   @Post(':id/deactivate')
 *   @Permissions('user:admin')
 *   @Roles('admin')
 *   @UseGuards(LastAdminGuard)
 *   @AuditAction({
 *     action: 'admin.user.deactivated',
 *     entityType: 'User',
 *     idParam: 'id',
 *   })
 *   async deactivate(@Param('id') id: string): Promise<ClientUser> {...}
 *
 *   // DELETE /api/admin/users/:id — last-admin invariant
 *   @Delete(':id')
 *   @Permissions('user:admin')
 *   @Roles('admin')
 *   @UseGuards(LastAdminGuard)
 *   @AuditAction({
 *     action: 'admin.user.deleted',
 *     entityType: 'User',
 *     idParam: 'id',
 *   })
 *   async remove(@Param('id') id: string): Promise<void> {...}
 *
 * No manual `AuditService.log()` calls are needed in the mutators —
 * the interceptor handles emit. If a future TZ needs to log BEFORE
 * the mutation (e.g. capture `details.before` for diff), inject
 * `AuditService` directly and call `this.audit.log(...)` with an
 * explicit `before`/`after` shape; the action key should still
 * match the canonical strings above.
 */
