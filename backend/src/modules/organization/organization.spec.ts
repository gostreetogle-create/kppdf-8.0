import { NotFoundException } from '@nestjs/common';
import { Types } from 'mongoose';
import { OrganizationService } from './organization.service';

describe('OrganizationService (TZ-PARTY-301 tenant hygiene)', () => {
  const ownOrgId = new Types.ObjectId().toString();
  const otherOrgId = new Types.ObjectId().toString();

  function makeModel(overrides: Record<string, unknown> = {}) {
    return {
      create: jest.fn().mockImplementation((payload: unknown) => Promise.resolve(payload)),
      find: jest.fn().mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([]),
      }),
      countDocuments: jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue(0) }),
      findOne: jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue(null) }),
      updateOne: jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue({}) }),
      ...overrides,
    };
  }

  function makeDoc(id: string) {
    const doc: Record<string, unknown> = { _id: new Types.ObjectId(id), name: 'ООО Наша' };
    doc.save = jest.fn().mockResolvedValue(doc);
    return doc;
  }

  it('list hides organizations of other tenants and deleted rows', async () => {
    const model = makeModel();
    const service = new OrganizationService(model as any);

    await service.findAll({}, { organizationId: ownOrgId, role: 'manager' });

    const filter = model.find.mock.calls[0][0] as Record<string, unknown>;
    expect(filter.deletedAt).toBeNull();
    expect(String(filter._id)).toBe(ownOrgId);
  });

  it('list without a bound organization stays unscoped for bootstrap', async () => {
    const model = makeModel();
    const service = new OrganizationService(model as any);

    await service.findAll({});

    const filter = model.find.mock.calls[0][0] as Record<string, unknown>;
    expect(filter._id).toBeUndefined();
    expect(filter.deletedAt).toBeNull();
  });

  it('findById hides another tenant organization behind 404 (IDOR)', async () => {
    const model = makeModel();
    const service = new OrganizationService(model as any);

    await expect(
      service.findById(otherOrgId, { organizationId: ownOrgId, role: 'manager' }),
    ).rejects.toBeInstanceOf(NotFoundException);
    expect(model.findOne).not.toHaveBeenCalled();
  });

  it('findById returns the own organization and skips deleted rows', async () => {
    const doc = makeDoc(ownOrgId);
    const model = makeModel({
      findOne: jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue(doc) }),
    });
    const service = new OrganizationService(model as any);

    await expect(
      service.findById(ownOrgId, { organizationId: ownOrgId, role: 'manager' }),
    ).resolves.toBe(doc);
    expect(model.findOne).toHaveBeenCalledWith({ _id: ownOrgId, deletedAt: null });
  });

  it('current resolves the organization bound to the user', async () => {
    const doc = makeDoc(ownOrgId);
    const model = makeModel({
      findOne: jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue(doc) }),
    });
    const service = new OrganizationService(model as any);

    await expect(
      service.findCurrent({ organizationId: ownOrgId, role: 'manager' }),
    ).resolves.toBe(doc);
  });

  it('current falls back to the organization flagged as our company', async () => {
    const doc = makeDoc(ownOrgId);
    const model = makeModel({
      findOne: jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue(doc) }),
    });
    const service = new OrganizationService(model as any);

    await expect(service.findCurrent()).resolves.toBe(doc);
    expect(model.findOne).toHaveBeenCalledWith({ isOurCompany: true, deletedAt: null });
  });

  it('current falls back to the only organization in the instance', async () => {
    const doc = makeDoc(ownOrgId);
    const model = makeModel({
      find: jest.fn().mockReturnValue({
        limit: jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue([doc]) }),
      }),
    });
    const service = new OrganizationService(model as any);

    await expect(service.findCurrent()).resolves.toBe(doc);
  });

  it('current asks the operator to choose when several organizations exist', async () => {
    const model = makeModel({
      find: jest.fn().mockReturnValue({
        limit: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue([makeDoc(ownOrgId), makeDoc(otherOrgId)]),
        }),
      }),
    });
    const service = new OrganizationService(model as any);

    await expect(service.findCurrent()).rejects.toBeInstanceOf(NotFoundException);
  });

  it('remove soft-deletes by writing deletedAt', async () => {
    const doc = makeDoc(ownOrgId);
    const model = makeModel({
      findOne: jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue(doc) }),
    });
    const service = new OrganizationService(model as any);

    await service.remove(ownOrgId, { organizationId: ownOrgId, role: 'admin' });

    const [filter, update] = model.updateOne.mock.calls[0] as [
      Record<string, unknown>,
      Record<string, Record<string, unknown>>,
    ];
    expect(filter._id).toBe(doc._id);
    expect(update.$set.deletedAt).toBeInstanceOf(Date);
  });

  it('remove refuses another tenant organization', async () => {
    const model = makeModel();
    const service = new OrganizationService(model as any);

    await expect(
      service.remove(otherOrgId, { organizationId: ownOrgId, role: 'admin' }),
    ).rejects.toBeInstanceOf(NotFoundException);
    expect(model.updateOne).not.toHaveBeenCalled();
  });
});
