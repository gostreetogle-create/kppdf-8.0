import { Types } from 'mongoose';
import { CounterpartyService } from './counterparty.service';

describe('CounterpartyService (TZ-241 org-scoping)', () => {
  let service: CounterpartyService;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  function makeMockModel() {
    const findExec = jest.fn();
    const countExec = jest.fn();
    return {
      find: jest.fn().mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        exec: findExec,
      }),
      countDocuments: jest.fn().mockReturnValue({
        exec: countExec,
      }),
      _findExec: findExec,
      _countExec: countExec,
    };
  }

  it('findAll without user returns all non-deleted counterparties', async () => {
    const mockModel = makeMockModel();
    service = new CounterpartyService(mockModel as any);
    mockModel._findExec.mockResolvedValue([]);
    mockModel._countExec.mockResolvedValue(0);

    const result = await service.findAll();
    expect(result.items).toEqual([]);
    expect(mockModel.find).toHaveBeenCalledWith({ deletedAt: null });
  });

  it('findAll with org-scoped user filters by organizationId', async () => {
    const orgId = new Types.ObjectId().toString();
    const mockModel = makeMockModel();
    service = new CounterpartyService(mockModel as any);
    mockModel._findExec.mockResolvedValue([]);
    mockModel._countExec.mockResolvedValue(0);

    await service.findAll({}, { organizationId: orgId, role: 'admin' });

    const findCall = mockModel.find.mock.calls[0][0];
    expect(findCall.$or).toBeDefined();
    const orConditions = findCall.$or as Record<string, unknown>[];
    expect(
      orConditions.some(
        (c) => (c as Record<string, unknown>).organizationId !== undefined,
      ),
    ).toBe(true);
  });

  it('findAll with org-scoped user includes system and legacy records', async () => {
    const orgId = new Types.ObjectId().toString();
    const mockModel = makeMockModel();
    service = new CounterpartyService(mockModel as any);
    mockModel._findExec.mockResolvedValue([]);
    mockModel._countExec.mockResolvedValue(0);

    await service.findAll({}, { organizationId: orgId, role: 'admin' });

    const findCall = mockModel.find.mock.calls[0][0];
    const orConditions = findCall.$or as Record<string, unknown>[];
    expect(orConditions).toContainEqual({
      organizationId: null,
      isSystem: true,
    });
    expect(orConditions).toContainEqual({
      organizationId: { $exists: false },
    });
  });

  it('findAll with search and org scope combines both filters', async () => {
    const orgId = new Types.ObjectId().toString();
    const mockModel = makeMockModel();
    service = new CounterpartyService(mockModel as any);
    mockModel._findExec.mockResolvedValue([]);
    mockModel._countExec.mockResolvedValue(0);

    await service.findAll(
      { search: 'acme' },
      { organizationId: orgId, role: 'admin' },
    );

    const findCall = mockModel.find.mock.calls[0][0];
    expect(findCall.$or).toBeDefined();
    const orConditions = findCall.$or as Record<string, unknown>[];
    for (const cond of orConditions) {
      expect((cond as Record<string, unknown>).$or).toBeDefined();
    }
  });

  it('findAll without org scope does not add org-scoping to $or', async () => {
    const mockModel = makeMockModel();
    service = new CounterpartyService(mockModel as any);
    mockModel._findExec.mockResolvedValue([]);
    mockModel._countExec.mockResolvedValue(0);

    await service.findAll({ search: 'acme' });

    const findCall = mockModel.find.mock.calls[0][0];
    expect(findCall.$or).toBeDefined();
    const orConditions = findCall.$or as Record<string, unknown>[];
    for (const cond of orConditions) {
      expect((cond as Record<string, unknown>).organizationId).toBeUndefined();
      expect((cond as Record<string, unknown>).isSystem).toBeUndefined();
    }
  });
});
