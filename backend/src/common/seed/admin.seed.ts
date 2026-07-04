import {
  Injectable,
  Logger,
  OnApplicationBootstrap,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RoleService } from '../../modules/role/role.service';
import { UserService } from '../../modules/user/user.service';
import { PermissionsService } from '../../modules/permissions/permissions.service';

const SYSTEM_ROLES = [
  {
    name: 'admin',
    label: 'Administrator',
    description: 'Full access to all resources',
    permissions: ['*'], // wildcard; RolesGuard and Permission check expand it later
    isSystem: true,
    sortOrder: 0,
  },
  {
    name: 'manager',
    label: 'Manager',
    description: 'Read/write most resources, no user management',
    permissions: [],
    isSystem: true,
    sortOrder: 10,
  },
  {
    name: 'user',
    label: 'User',
    description: 'Self-service profile only',
    permissions: [],
    isSystem: true,
    sortOrder: 100,
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
      if (existing) continue;

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
    const password = this.config.get<string>('admin.password') ?? '';

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
        `⚠️  Default admin user created (username: "${username}"). ` +
          `CHANGE THE PASSWORD IMMEDIATELY in production!`,
      );
    } catch (err) {
      this.logger.error(
        `Failed to seed default admin: ${(err as Error).message}`,
      );
    }
  }
}
