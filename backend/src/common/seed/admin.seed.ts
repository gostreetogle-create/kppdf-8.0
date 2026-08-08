import {
  Injectable,
  Logger,
  OnApplicationBootstrap,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RoleService } from '../../modules/role/role.service';
import { UserService } from '../../modules/user/user.service';
import { PermissionsService } from '../../modules/permissions/permissions.service';

/** TZ-ACCESS-301: page ACL ? default pages per system role. */
const ADMIN_PAGES = [
  'products', 'modules', 'materials', 'work-types',
  'organizations', 'proposals', 'contracts', 'orders',
  'counterparties', 'design', 'supply', 'shipping',
  'dictionaries', 'categories', 'doc-template-categories', 'text-block-categories', 'color-references',
  'doc-templates', 'doc-texts', 'doc-tables', 'doc-documents',
  'inventory', 'storage-items', 'stock-movements',
  'people',
  'production',
  'import-todos',
  'admin-users', 'admin-roles',
] as const;

const DIRECTOR_PAGES = [
  'products', 'modules', 'materials', 'work-types',
  'organizations', 'proposals', 'contracts', 'orders',
  'counterparties', 'design', 'supply', 'shipping',
  'dictionaries', 'categories', 'doc-template-categories', 'text-block-categories', 'color-references',
  'doc-templates', 'doc-texts', 'doc-tables', 'doc-documents',
  'inventory', 'storage-items', 'stock-movements',
  'people',
  'production',
  'import-todos',
  // no admin-*
] as const;

const MANAGER_PAGES = [
  'products', 'modules', 'materials', 'work-types',
  'organizations', 'proposals', 'contracts', 'orders',
  'counterparties', 'design', 'supply', 'shipping',
  'dictionaries', 'doc-template-categories', 'text-block-categories',
  'doc-templates', 'doc-texts', 'doc-tables', 'doc-documents',
  'inventory', 'storage-items', 'stock-movements',
  'people',
  'production',
  'import-todos',
] as const;

/** TZ-PRODUCTION-303 lock J � cockpit FE capability gate for director/manager. */
const DIRECTOR_PERMISSIONS = ['production:read'] as const;
const MANAGER_PERMISSIONS = ['production:read'] as const;

const WORKER_PAGES = [
  'doc-texts',
  'doc-documents',
] as const;

const SYSTEM_ROLES = [
  {
    name: 'admin',
    label: 'Administrator',
    description: 'Full access to all resources',
    permissions: ['*'], // wildcard; RolesGuard and Permission check expand it later
    isSystem: true,
    sortOrder: 0,
    pages: [...ADMIN_PAGES],
  },
  {
    name: 'director',
    label: 'Director',
    description: 'Full operational access, no user/role management',
    permissions: [...DIRECTOR_PERMISSIONS],
    isSystem: true,
    sortOrder: 5,
    pages: [...DIRECTOR_PAGES],
  },
  {
    name: 'manager',
    label: 'Manager',
    description: 'Read/write most resources, no user management',
    permissions: [...MANAGER_PERMISSIONS],
    isSystem: true,
    sortOrder: 10,
    pages: [...MANAGER_PAGES],
  },
  {
    name: 'user',
    label: 'User',
    description: 'Worker ? self-service + document access',
    permissions: [],
    isSystem: true,
    sortOrder: 100,
    pages: [...WORKER_PAGES],
  },
] as const;

/**
 * Seeds system roles and a default admin user on first application boot.
 * Idempotent: only creates if the collection is empty.
 */
@Injectable()
export class AdminSeed implements OnApplicationBootstrap {
  private readonly logger = new Logger(AdminSeed.name);

  constructor(
    private readonly roles: RoleService,
    private readonly users: UserService,
    private readonly permissions: PermissionsService,
    private readonly config: ConfigService,
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    await this.seedRoles();
    await this.seedAdmin();
  }

  private async seedRoles(): Promise<void> {
    for (const r of SYSTEM_ROLES) {
      const existing = await this.roles.findByName(r.name);
      if (existing) {
        // TZ-ACCESS-303: merge newly catalogued pageKeys into system roles
        // (idempotent � only adds missing keys, never removes director grants).
        const desired = [...(r.pages ?? [])];
        const have = new Set(existing.pages ?? []);
        const missing = desired.filter((p) => !have.has(p));
        const desiredPerms = [...(r.permissions ?? [])].filter((p) => p !== '*');
        const havePerms = new Set(existing.permissions ?? []);
        const missingPerms = desiredPerms.filter((p) => !havePerms.has(p));
        if (missing.length > 0 || missingPerms.length > 0) {
          try {
            const patch: { pages?: string[]; permissions?: string[] } = {};
            if (missing.length > 0) {
              patch.pages = [...(existing.pages ?? []), ...missing];
            }
            if (missingPerms.length > 0) {
              patch.permissions = [...(existing.permissions ?? []), ...missingPerms];
            }
            await this.roles.update(existing.id, patch);
            this.logger.log(
              `System role merged: ${r.name}` +
                (missing.length ? ` pages(+${missing.join(',')})` : '') +
                (missingPerms.length ? ` perms(+${missingPerms.join(',')})` : ''),
            );
          } catch (err) {
            this.logger.warn(
              `Could not merge role ${r.name}: ${(err as Error).message}`,
            );
          }
        }
        continue;
      }

      // For 'admin' role, expand '*' to all permission keys
      const permissions =
        r.permissions[0] === '*'
          ? await this.permissions.getAllKeys()
          : r.permissions;

      try {
        await this.roles.create({
          name: r.name,
          label: r.label,
          description: r.description,
          permissions: [...permissions],
          sortOrder: r.sortOrder,
          isSystem: r.isSystem,
          isActive: true,
          sectionIds: [],
          pages: [...(r.pages ?? [])],
        });
        this.logger.log(`System role created: ${r.name}`);
      } catch (err) {
        this.logger.warn(
          `Could not create role ${r.name}: ${(err as Error).message}`,
        );
      }
    }
  }

  private async seedAdmin(): Promise<void> {
    const userCount = await this.users.count();
    if (userCount > 0) {
      this.logger.debug('Users already exist; skipping admin seed');
      return;
    }

    const username = this.config.get<string>('admin.username') ?? 'admin';
    // TZ-91 �4 Phase A.4: warn + skip if ADMIN_PASSWORD < 8 chars (avoid weak admin on fresh bootstrap).
    const password = this.config.get<string>('admin.password') ?? '';
    if (!password || password.length < 8) {
      this.logger.warn(
        `[ADMIN-SEED] ADMIN_PASSWORD too short or unset (${password?.length ?? 0} chars, need >= 8). ` +
        `Admin user NOT created. Set ADMIN_PASSWORD in .env (>= 8 chars) then restart. ` +
        `Bootstrap CONTINUES ? app will run without admin until password is fixed.`,
      );
      return;
    }

    // TZ-238: bootstrap admin is a system user with no organizationId
    try {
      await this.users.create({
        username,
        email: `${username}@kppdf.local`,
        displayName: 'Default Administrator',
        password,
        role: 'admin',
        permissions: [],
        isActive: true,
        fullName: 'Default Administrator',
      });
      this.logger.warn(
        `??  Default admin user created (username: "${username}"). ` +
          `CHANGE THE PASSWORD IMMEDIATELY in production!`,
      );
    } catch (err) {
      this.logger.error(
        `Failed to seed default admin: ${(err as Error).message}`,
      );
    }
  }
}
