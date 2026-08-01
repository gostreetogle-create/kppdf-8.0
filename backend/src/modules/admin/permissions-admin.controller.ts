import { Controller, Get } from '@nestjs/common';
import { PERMISSIONS } from '../../common/seed/permissions.constants';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { Roles } from '../../common/decorators/roles.decorator';

/**
 * TZ-257.B — permissions catalog for the admin role editor.
 *
 * Serves the canonical `PERMISSIONS` constant (single source of truth
 * used by the seeder, `PermissionsBootValidator` and role validation)
 * grouped by `section`. The admin role-form dialog renders this as a
 * checkbox catalogue so editors pick from the real permission keys
 * instead of free-typing.
 *
 * Response shape:
 *   { sections: [{ section: 'user', permissions: [{ key, action, description }] }, …] }
 *
 * Gated by the global guard stack: JwtAuthGuard → PermissionsGuard
 * (`role:read`) → RolesGuard (`admin`). Static catalogue — no DB
 * round-trip, no audit needed (read-only).
 */
@Controller('admin/permissions')
export class PermissionsAdminController {
  @Get()
  @Permissions('role:read')
  @Roles('admin')
  catalog(): {
    sections: Array<{
      section: string;
      permissions: Array<{ key: string; action: string; description: string }>;
    }>;
  } {
    const bySection = new Map<
      string,
      Array<{ key: string; action: string; description: string }>
    >();
    for (const p of PERMISSIONS) {
      const list = bySection.get(p.section) ?? [];
      list.push({ key: p.key, action: p.action, description: p.description });
      bySection.set(p.section, list);
    }
    const sections = Array.from(bySection.entries()).map(([section, permissions]) => ({
      section,
      permissions,
    }));
    return { sections };
  }
}
