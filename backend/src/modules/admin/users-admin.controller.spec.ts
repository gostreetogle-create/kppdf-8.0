import { Types } from 'mongoose';
import { UsersAdminController } from './users-admin.controller';
import { AdminResetPasswordDto } from './dto/admin-reset-password.dto';
import type { UserService } from '../user/user.service';

/**
 * TZ-257.A.1 §3 — UsersAdminController unit spec.
 *
 * Pure unit spec with manual mocks (repository convention — see
 * `last-admin.guard.spec.ts`). Verifies mutation delegation to
 * `UserService`, audit-safe mapped responses (no `passwordHash`), and
 * the reset-password endpoint shape.
 */

function buildController(opts: {
  create?: jest.Mock;
  update?: jest.Mock;
  remove?: jest.Mock;
  adminResetPassword?: jest.Mock;
  findById?: jest.Mock;
}) {
  const create = opts.create ?? jest.fn();
  const update = opts.update ?? jest.fn();
  const remove = opts.remove ?? jest.fn();
  const adminResetPassword = opts.adminResetPassword ?? jest.fn();
  const userService = { create, update, remove, adminResetPassword } as unknown as UserService;
  const userModel = { findById: opts.findById ?? jest.fn() } as any;
  const roleModel = {} as any;
  const controller = new UsersAdminController(userModel, roleModel, userService);
  return { controller, create, update, remove, adminResetPassword, userModel };
}

function clientUserDoc(overrides: Record<string, unknown> = {}) {
  return {
    _id: new Types.ObjectId().toString(),
    username: 'alice',
    email: 'a@example.com',
    displayName: 'Alice',
    role: 'manager',
    isActive: true,
    permissions: [],
    passwordHash: '$2b$10$NEVER_LEAK_ME',
    refreshTokenVersion: 3,
    createdAt: new Date('2026-01-01T00:00:00Z'),
    updatedAt: new Date('2026-01-02T00:00:00Z'),
    ...overrides,
  };
}

describe('UsersAdminController (TZ-257.A.1)', () => {
  describe('mutation delegation', () => {
    it('delegates create to UserService.create and returns redacted user', async () => {
      const { controller, create } = buildController({
        create: jest.fn().mockResolvedValue(clientUserDoc()),
      });
      const dto = {
        username: 'bob',
        email: 'b@x',
        displayName: 'Bob',
        password: 'secret12',
        role: 'user',
      } as any;
      const out = await controller.create(dto);
      expect(create).toHaveBeenCalledWith(dto);
      expect(out).not.toHaveProperty('passwordHash');
      expect(out).not.toHaveProperty('refreshTokenVersion');
      expect(out).toHaveProperty('id');
    });

    it('delegates update to UserService.update and returns redacted user', async () => {
      const { controller, update } = buildController({
        update: jest.fn().mockResolvedValue(clientUserDoc({ role: 'admin' })),
      });
      const dto = { role: 'manager' } as any;
      const out = await controller.update('u1', dto);
      expect(update).toHaveBeenCalledWith('u1', dto);
      expect(out).not.toHaveProperty('passwordHash');
    });

    it('delegates deactivate with isActive false and returns redacted user', async () => {
      const { controller, update } = buildController({
        update: jest.fn().mockResolvedValue(clientUserDoc({ isActive: false })),
      });
      const out = await controller.deactivate('u1');
      expect(update).toHaveBeenCalledWith('u1', { isActive: false });
      expect(out).not.toHaveProperty('passwordHash');
    });

    it('delegates delete to UserService.remove and returns redacted user', async () => {
      const { controller, remove } = buildController({
        remove: jest.fn().mockResolvedValue(clientUserDoc()),
      });
      const out = await controller.remove('u1');
      expect(remove).toHaveBeenCalledWith('u1');
      expect(out).not.toHaveProperty('passwordHash');
    });
  });

  describe('reset-password endpoint (TZ-257.A.1 §2)', () => {
    it('delegates to adminResetPassword with the DTO newPassword and returns redacted user', async () => {
      const { controller, adminResetPassword } = buildController({
        adminResetPassword: jest.fn().mockResolvedValue(clientUserDoc()),
      });
      const dto = new AdminResetPasswordDto();
      dto.newPassword = 'newpass123';
      const out = await controller.resetPassword('u1', dto);
      expect(adminResetPassword).toHaveBeenCalledWith('u1', 'newpass123');
      expect(out).not.toHaveProperty('passwordHash');
      expect(out).not.toHaveProperty('refreshTokenVersion');
    });

    it('never passes an oldPassword to the service (DTO has no oldPassword field)', () => {
      const dto = new AdminResetPasswordDto();
      expect(Object.keys(dto)).not.toContain('oldPassword');
      expect((dto as unknown as Record<string, unknown>)['oldPassword']).toBeUndefined();
    });
  });

  describe('getById', () => {
    it('maps single-user reads through toClientUser (no passwordHash)', async () => {
      const { controller } = buildController({
        findById: jest.fn().mockReturnValue({
          lean: () => ({ exec: () => Promise.resolve(clientUserDoc()) }),
        }),
      });
      const out = await controller.getById('u1');
      expect(out).not.toHaveProperty('passwordHash');
      expect(out).toHaveProperty('username');
    });

    it('throws (non-ForbiddenException) for a missing target on the read path', async () => {
      const { controller } = buildController({
        findById: jest.fn().mockReturnValue({
          lean: () => ({ exec: () => Promise.resolve(null) }),
        }),
      });
      await expect(controller.getById('missing')).rejects.toBeInstanceOf(Error);
    });
  });
});
