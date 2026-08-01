/**
 * TZ-257.A — SystemRoleGuard unit tests.
 *
 * Covers 4 AC cases:
 *  1. target role has `isSystem: false` → mutator returns true.
 *  2. target role has `isSystem: true` AND mutator is patch/delete → throws ForbiddenException('SYSTEM_ROLE_FROZEN').
 *  3. target role has `isSystem: true` AND mutator is read (GET) → returns true.
 *  4. PATCH attempting to set `isSystem: true` on a non-system role → throws ForbiddenException('SYSTEM_ROLE_ESCALATION').
 *
 * Mongoose `Role` model is mocked via the standard DI token; no real Mongo.
 */
import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { ForbiddenException } from '@nestjs/common';
import { SystemRoleGuard } from './system-role.guard';
import { Role } from '../../modules/role/role.schema';

function buildModelMock(existing: Record<string, unknown> | null = null) {
  return {
    findById: jest.fn().mockReturnValue({
      lean: () => ({
        exec: jest.fn().mockResolvedValue(existing),
      }),
    }),
  };
}

describe('SystemRoleGuard (TZ-257.A)', () => {
  function makeContext(method: string, params: Record<string, string>, body?: unknown) {
    return {
      switchToHttp: () => ({
        getRequest: () => ({ method, params, body }),
      }),
    } as unknown as Parameters<SystemRoleGuard['canActivate']>[0];
  }

  async function boot(model: ReturnType<typeof buildModelMock>) {
    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [
        SystemRoleGuard,
        { provide: getModelToken(Role.name), useValue: model },
      ],
    }).compile();
    return moduleRef.get(SystemRoleGuard);
  }

  it('allows PATCH on a non-system role (isSystem: false)', async () => {
    const guard = await boot(buildModelMock({ isSystem: false, name: 'editor' }));
    await expect(
      guard.canActivate(makeContext('PATCH', { id: '64a0000000000000000000aa' }, { displayName: 'X' })),
    ).resolves.toBe(true);
  });

  it('refuses PATCH on a system role with code SYSTEM_ROLE_FROZEN', async () => {
    const guard = await boot(buildModelMock({ isSystem: true, name: 'admin' }));
    await expect(
      guard.canActivate(makeContext('PATCH', { id: '64a0000000000000000000bb' }, { displayName: 'X' })),
    ).rejects.toThrow(ForbiddenException);
    try {
      await guard.canActivate(
        makeContext('PATCH', { id: '64a0000000000000000000bb' }, { displayName: 'X' }),
      );
    } catch (err) {
      expect((err as ForbiddenException).getResponse()).toMatchObject({
        code: 'SYSTEM_ROLE_FROZEN',
      });
    }
  });

  it('refuses DELETE on a system role with code SYSTEM_ROLE_FROZEN', async () => {
    const guard = await boot(buildModelMock({ isSystem: true, name: 'admin' }));
    await expect(
      guard.canActivate(makeContext('DELETE', { id: '64a0000000000000000000cc' }, {})),
    ).rejects.toThrow(ForbiddenException);
  });

  it('GET (read) bypasses the guard, even on a system role', async () => {
    const guard = await boot(buildModelMock({ isSystem: true, name: 'admin' }));
    await expect(
      guard.canActivate(makeContext('GET', { id: '64a0000000000000000000dd' }, {})),
    ).resolves.toBe(true);
  });

  it('refuses PATCH trying to set isSystem: true on a non-system role (escalation)', async () => {
    const guard = await boot(buildModelMock({ isSystem: false, name: 'editor' }));
    await expect(
      guard.canActivate(
        makeContext(
          'PATCH',
          { id: '64a0000000000000000000ee' },
          { isSystem: true },
        ),
      ),
    ).rejects.toThrow(ForbiddenException);
    try {
      await guard.canActivate(
        makeContext(
          'PATCH',
          { id: '64a0000000000000000000ee' },
          { isSystem: true },
        ),
      );
    } catch (err) {
      expect((err as ForbiddenException).getResponse()).toMatchObject({
        code: 'SYSTEM_ROLE_ESCALATION',
      });
    }
  });
});
