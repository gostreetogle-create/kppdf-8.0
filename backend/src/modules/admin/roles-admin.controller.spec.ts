import { Types } from 'mongoose';
import { RolesAdminController } from './roles-admin.controller';
import { CreateRoleDto } from '../role/dto/create-role.dto';
import { UpdateRoleDto } from '../role/dto/update-role.dto';
import type { RoleService } from '../role/role.service';

/**
 * TZ-256.B — RolesAdminController unit spec.
 *
 * Pure unit spec with manual mocks (repository convention — see
 * `users-admin.controller.spec.ts`). Verifies mutation delegation to
 * `RoleService`, the `isSystem: false` create-forcing, and the
 * audit-safe client-role mapping (no internal fields).
 */

function buildController(opts: {
  create?: jest.Mock;
  update?: jest.Mock;
  remove?: jest.Mock;
  find?: jest.Mock;
  findById?: jest.Mock;
}) {
  const create = opts.create ?? jest.fn();
  const update = opts.update ?? jest.fn();
  const remove = opts.remove ?? jest.fn();
  const roleService = { create, update, remove } as unknown as RoleService;
  const roleModel = {
    find: opts.find ?? jest.fn(),
    findById: opts.findById ?? jest.fn(),
  } as any;
  const controller = new RolesAdminController(roleModel, roleService);
  return { controller, create, update, remove, roleModel };
}

function roleDoc(overrides: Record<string, unknown> = {}) {
  return {
    _id: new Types.ObjectId().toString(),
    name: 'manager',
    label: 'Менеджер',
    description: 'Оператор',
    permissions: ['orders.read'],
    isSystem: false,
    sortOrder: 100,
    sectionIds: [],
    isActive: true,
    createdAt: new Date('2026-01-01T00:00:00Z'),
    updatedAt: new Date('2026-01-02T00:00:00Z'),
    ...overrides,
  };
}

describe('RolesAdminController (TZ-256.B)', () => {
  describe('mutation delegation', () => {
    it('delegates create to RoleService.create with isSystem forced false and returns client role', async () => {
      const { controller, create } = buildController({
        create: jest.fn().mockResolvedValue(roleDoc()),
      });
      const dto = new CreateRoleDto();
      dto.name = 'clerk';
      dto.label = 'Клерк';
      dto.permissions = ['orders.read'];
      // Attempt to smuggle isSystem: true — must be forced to false.
      const out = await controller.create({ ...dto, isSystem: true } as unknown as CreateRoleDto);
      expect(create).toHaveBeenCalledWith(expect.objectContaining({ isSystem: false }));
      expect(out).toHaveProperty('id');
      expect(out).toHaveProperty('name', 'manager');
      expect(out).not.toHaveProperty('sectionIds');
    });

    it('delegates update to RoleService.update and returns client role', async () => {
      const { controller, update } = buildController({
        update: jest.fn().mockResolvedValue(roleDoc({ label: 'Старший менеджер' })),
      });
      const dto = new UpdateRoleDto();
      dto.label = 'Старший менеджер';
      const out = await controller.update('r1', dto);
      expect(update).toHaveBeenCalledWith('r1', dto);
      expect(out).toHaveProperty('label', 'Старший менеджер');
      expect(out).not.toHaveProperty('sortOrder');
    });

    it('delegates remove to RoleService.remove and returns success marker', async () => {
      const { controller, remove } = buildController({
        remove: jest.fn().mockResolvedValue(undefined),
      });
      const out = await controller.remove('r1');
      expect(remove).toHaveBeenCalledWith('r1');
      expect(out).toEqual({ success: true });
    });
  });

  describe('read paths', () => {
    it('maps list docs through toClientRole', async () => {
      const { controller } = buildController({
        find: jest.fn().mockReturnValue({
          sort: () => ({ lean: () => ({ exec: () => Promise.resolve([roleDoc()]) }) }),
        }),
      });
      const out = await controller.list();
      expect(out).toHaveLength(1);
      expect(out[0]).toHaveProperty('name', 'manager');
      expect(out[0]).not.toHaveProperty('sectionIds');
    });

    it('throws for a missing target on the single-read path', async () => {
      const { controller } = buildController({
        findById: jest.fn().mockReturnValue({
          lean: () => ({ exec: () => Promise.resolve(null) }),
        }),
      });
      await expect(controller.getById('missing')).rejects.toBeInstanceOf(Error);
    });
  });
});
