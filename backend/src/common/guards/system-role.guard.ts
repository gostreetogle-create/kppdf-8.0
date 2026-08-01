import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Reflector } from '@nestjs/core';
import { Role, RoleDocument } from '../../modules/role/role.schema';

/**
 * TZ-257.A — SystemRoleGuard.
 *
 * Refuses mutation/deletion of any role with `isSystem: true`. Also
 * refuses patches that would SET `isSystem: true` on a non-system role
 * (escalation guard). Reads target id from route param `id` (override
 * via `SYSTEM_ROLE_ID_PARAM` metadata if needed in the future).
 *
 * Mutation methods blocked: PATCH, DELETE. POST/copy operations are
 * always forced to create roles with `isSystem: false` regardless of
 * payload (handled in the controller, not here).
 *
 * Error code: `'SYSTEM_ROLE_FROZEN'` (`isSystem: true → blocked`) or
 * `'SYSTEM_ROLE_ESCALATION'` (patch trying to set isSystem: true).
 * Both surface as 403 ForbiddenException.
 */
@Injectable()
export class SystemRoleGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    @InjectModel(Role.name)
    private readonly roleModel: Model<RoleDocument>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<{
      method: string;
      params: Record<string, string>;
      body?: Record<string, unknown>;
    }>();
    // Only enforce on mutating verbs. Reads (GET) skip the guard.
    if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
      return true;
    }
    const id = req.params['id'];
    const role =
      id && Types.ObjectId.isValid(id)
        ? await this.roleModel.findById(id).lean().exec()
        : null;

    if (req.method === 'PATCH' || req.method === 'PUT' || req.method === 'DELETE') {
      if (
        role &&
        (role as { isSystem?: boolean }).isSystem === true
      ) {
        throw new ForbiddenException({
          code: 'SYSTEM_ROLE_FROZEN',
          message: 'System roles are read-only after creation; mutation refused',
        });
      }
    }
    // Escalation guard: PATCH that tries to set isSystem on a non-system role.
    if (req.method === 'PATCH' || req.method === 'PUT') {
      const body = req.body ?? {};
      const attempted = (body as { isSystem?: boolean }).isSystem;
      if (attempted === true && (!role || (role as { isSystem?: boolean }).isSystem !== true)) {
        throw new ForbiddenException({
          code: 'SYSTEM_ROLE_ESCALATION',
          message: 'Cannot set isSystem: true on a non-system role (escalation refused)',
        });
      }
    }
    return true;
  }
}
