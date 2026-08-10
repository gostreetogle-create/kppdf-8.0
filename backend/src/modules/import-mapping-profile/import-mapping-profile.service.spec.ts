import { ConflictException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { ImportMappingProfileService } from './import-mapping-profile.service';

const user = {
  id: '507f1f77bcf86cd799439011',
  username: 'manager',
  role: 'manager',
  organizationId: '507f1f77bcf86cd799439022',
};

function modelWith(overrides: Record<string, unknown> = {}) {
  const updateMany = jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue(undefined) });
  const find = jest.fn().mockReturnValue({ sort: jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue([]) }) });
  const findOne = jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue(null) });
  return {
    create: jest.fn(),
    updateMany,
    find,
    findOne,
    ...overrides,
  } as any;
}

describe('ImportMappingProfileService (TZD-37)', () => {
  it('lists only the current organization and defaults first', async () => {
    const model = modelWith();
    const service = new ImportMappingProfileService(model);
    await service.list(user);
    expect(model.find).toHaveBeenCalledWith({ organizationId: expect.anything() });
  });

  it('requires an organization for profile storage', async () => {
    const service = new ImportMappingProfileService(modelWith());
    await expect(service.list({ ...user, organizationId: undefined })).rejects.toBeInstanceOf(
      ForbiddenException,
    );
  });

  it('clears the previous default before creating a default profile', async () => {
    const create = jest.fn().mockResolvedValue({ name: 'X' });
    const model = modelWith({ create });
    const service = new ImportMappingProfileService(model);
    await service.create(
      { name: 'X', columnMap: { Артикул: 'article' }, isDefault: true },
      user,
    );
    expect(model.updateMany).toHaveBeenCalledWith(
      { organizationId: expect.anything(), isDefault: true },
      { $set: { isDefault: false } },
    );
    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'X', isDefault: true, targetEntity: 'material' }),
    );
  });

  it('updates a default and unsets other defaults', async () => {
    const save = jest.fn().mockResolvedValue(undefined);
    const doc: any = {
      _id: { toString: () => '507f1f77bcf86cd799439033' },
      name: 'Old',
      isDefault: false,
      save,
    };
    const model = modelWith({
      findOne: jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue(doc) }),
    });
    const service = new ImportMappingProfileService(model);
    await service.update('507f1f77bcf86cd799439033', { isDefault: true, name: 'New' }, user);
    expect(model.updateMany).toHaveBeenCalled();
    expect(doc.name).toBe('New');
    expect(doc.isDefault).toBe(true);
    expect(save).toHaveBeenCalled();
  });

  it('maps duplicate key to a Russian conflict', async () => {
    const model = modelWith({ create: jest.fn().mockRejectedValue({ code: 11000 }) });
    const service = new ImportMappingProfileService(model);
    await expect(
      service.create({ name: 'X', columnMap: {} }, user),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('returns not found for invalid or foreign profile ids', async () => {
    const service = new ImportMappingProfileService(modelWith());
    await expect(service.update('bad-id', { name: 'X' }, user)).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});
