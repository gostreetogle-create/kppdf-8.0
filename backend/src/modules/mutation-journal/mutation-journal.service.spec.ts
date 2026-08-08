import { BadRequestException } from '@nestjs/common';
import { MutationJournalService } from './mutation-journal.service';

function buildService(opts: {
  create?: jest.Mock;
  findByIdDoc?: any;
  findById?: jest.Mock;
  findOne?: jest.Mock;
  countDocuments?: jest.Mock;
  deleteMany?: jest.Mock;
  materialsCreate?: jest.Mock;
  materialsUpdate?: jest.Mock;
  materialsRemove?: jest.Mock;
  materialsFindById?: jest.Mock;
  ringSize?: number;
} = {}) {
  const create = opts.create ?? jest.fn();
  const findOne = opts.findOne ?? jest.fn();
  const countDocuments = opts.countDocuments ?? jest.fn().mockResolvedValue(0);
  const deleteMany = opts.deleteMany ?? jest.fn().mockResolvedValue({ deletedCount: 0 });

  const leanChain = {
    sort: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    lean: jest.fn().mockReturnThis(),
    exec: jest.fn().mockResolvedValue([]),
  };

  const findById =
    opts.findById ??
    jest.fn().mockImplementation(() => ({
      exec: jest.fn().mockResolvedValue(opts.findByIdDoc ?? null),
    }));

  const model = {
    create,
    findById,
    findOne: jest.fn().mockImplementation(() => ({
      sort: jest.fn().mockReturnThis(),
      exec: findOne,
    })),
    find: jest.fn().mockReturnValue(leanChain),
    countDocuments: jest.fn(() => ({ exec: countDocuments })),
    deleteMany: jest.fn(() => ({ exec: deleteMany })),
  } as any;

  const materials = {
    create: opts.materialsCreate ?? jest.fn(),
    update: opts.materialsUpdate ?? jest.fn(),
    remove: opts.materialsRemove ?? jest.fn(),
    findById: opts.materialsFindById ?? jest.fn(),
  } as any;

  process.env.MUTATION_JOURNAL_RING_SIZE = String(opts.ringSize ?? 50);
  const service = new MutationJournalService(model, materials);
  return { service, create, findById, findOne, materials, model, leanChain, countDocuments, deleteMany };
}

const user = {
  id: '507f1f77bcf86cd799439011',
  username: 'mgr',
  role: 'manager',
  organizationId: '507f1f77bcf86cd799439022',
};

describe('MutationJournalService (TZD-13)', () => {
  it('propose material.create does not call MaterialService.create', async () => {
    const { service, create, materials } = buildService({
      create: jest.fn().mockResolvedValue({
        _id: '507f1f77bcf86cd799439033',
        status: 'proposed',
        kind: 'material.create',
        toolName: 'kppdf_propose_material_create',
        payload: { name: 'Oak' },
        entityType: 'Material',
        expiresAt: new Date(Date.now() + 60_000),
      }),
    });

    const view = await service.propose(
      { kind: 'material.create', create: { name: 'Oak', unit: 'шт' } },
      user,
    );
    expect(view.proposalId).toBe('507f1f77bcf86cd799439033');
    expect(view.status).toBe('proposed');
    expect(materials.create).not.toHaveBeenCalled();
    expect(create).toHaveBeenCalled();
  });

  it('confirm create applies material and marks applied', async () => {
    const save = jest.fn().mockResolvedValue(undefined);
    const doc: any = {
      _id: '507f1f77bcf86cd799439033',
      status: 'proposed',
      kind: 'material.create',
      toolName: 't',
      actorUserId: user.id,
      organizationId: user.organizationId,
      entityType: 'Material',
      payload: { name: 'Oak', unit: 'шт' },
      expiresAt: new Date(Date.now() + 60_000),
      save,
    };
    const { service, materials } = buildService({
      findByIdDoc: doc,
      materialsCreate: jest.fn().mockResolvedValue({
        _id: '507f1f77bcf86cd799439044',
        name: 'Oak',
        toObject: () => ({ _id: '507f1f77bcf86cd799439044', name: 'Oak' }),
      }),
    });

    const view = await service.confirm('507f1f77bcf86cd799439033', user);
    expect(materials.create).toHaveBeenCalledWith({ name: 'Oak', unit: 'шт' });
    expect(doc.status).toBe('applied');
    expect(view.mutationId).toBe('507f1f77bcf86cd799439033');
    expect(save).toHaveBeenCalled();
  });

  it('undo create soft-deletes material', async () => {
    const save = jest.fn().mockResolvedValue(undefined);
    const doc: any = {
      _id: '507f1f77bcf86cd799439033',
      status: 'applied',
      kind: 'material.create',
      toolName: 't',
      actorUserId: user.id,
      organizationId: user.organizationId,
      entityType: 'Material',
      entityId: '507f1f77bcf86cd799439044',
      save,
    };
    const { service, materials } = buildService({
      findByIdDoc: doc,
      materialsRemove: jest.fn().mockResolvedValue(undefined),
    });

    await service.undo('507f1f77bcf86cd799439033', user);
    expect(materials.remove).toHaveBeenCalledWith('507f1f77bcf86cd799439044');
    expect(doc.status).toBe('undone');
  });

  it('rejects confirm of non-proposed', async () => {
    const { service } = buildService({
      findByIdDoc: {
        _id: '507f1f77bcf86cd799439033',
        status: 'applied',
        actorUserId: user.id,
        organizationId: user.organizationId,
      },
    });
    await expect(service.confirm('507f1f77bcf86cd799439033', user)).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it('proposeBatch 50 items → 50 ids, no SoT writes (TZD-18)', async () => {
    const { service, materials, create } = buildService({
      create: jest.fn().mockImplementation((_payload: any) =>
        Promise.resolve({
          _id: '507f1f77bcf86cd799439100',
          status: 'proposed',
          kind: 'material.create',
          toolName: 'kppdf_propose_material_batch',
          entityType: 'Material',
          payload: { name: 'X' },
          expiresAt: new Date(Date.now() + 60_000),
        }),
      ),
      findById: jest.fn().mockImplementation(() => ({
        exec: jest.fn().mockResolvedValue(null),
      })),
    });

    const items = Array.from({ length: 50 }, (_, i) => ({
      kind: 'material.create' as const,
      create: { name: `M${i}` },
    }));
    const result = await service.proposeBatch({ items }, user);

    expect(result.proposalIds).toHaveLength(50);
    expect(result.errors).toEqual([]);
    expect(materials.create).not.toHaveBeenCalled();
    expect(create).toHaveBeenCalledTimes(50);
  });

  it('proposeBatch rolls back created proposals on item error (TZD-18)', async () => {
    const createdDoc: any = {
      _id: '507f1f77bcf86cd799439100',
      status: 'proposed',
      kind: 'material.create',
      toolName: 't',
      actorUserId: user.id,
      organizationId: user.organizationId,
      entityType: 'Material',
      payload: { name: 'Good' },
      expiresAt: new Date(Date.now() + 60_000),
      save: jest.fn(),
    };
    const { service, create } = buildService({
      create: jest.fn().mockImplementation((_payload: any) =>
        Promise.resolve({
          _id: '507f1f77bcf86cd799439100',
          status: 'proposed',
          kind: 'material.create',
          toolName: 't',
          actorUserId: user.id,
          organizationId: user.organizationId,
          entityType: 'Material',
          payload: { name: 'Good' },
          expiresAt: new Date(Date.now() + 60_000),
          toObject: () => ({ _id: '507f1f77bcf86cd799439100' }),
        }),
      ),
      findByIdDoc: createdDoc,
    });

    const result = await service.proposeBatch(
      {
        items: [
          { kind: 'material.create', create: { name: 'Good' } },
          // второй item падает: без имени
          { kind: 'material.create', create: { name: '  ' } },
        ],
      },
      user,
    );

    expect(result.proposalIds).toEqual([]);
    expect(result.errors).toHaveLength(1);
    expect(createdDoc.status).toBe('cancelled'); // откат созданного
    expect(create).toHaveBeenCalledTimes(1);
  });

  it('proposeBatch idempotencyKey returns existing proposals on retry (TZD-18)', async () => {
    const { service, create } = buildService({
      create: jest.fn().mockImplementation((_payload: any) =>
        Promise.resolve({
          _id: '507f1f77bcf86cd799439200',
          status: 'proposed',
          kind: 'material.create',
          toolName: 't',
          entityType: 'Material',
          payload: { name: 'X' },
          expiresAt: new Date(Date.now() + 60_000),
        }),
      ),
    });
    const leanChain = {
      sort: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      lean: jest.fn().mockReturnThis(),
      exec: jest
        .fn()
        .mockResolvedValueOnce([{ _id: '507f1f77bcf86cd799439200' }])
        .mockResolvedValueOnce([]),
    };
    (service as any).model.find = jest.fn().mockReturnValue(leanChain);

    const first = await service.proposeBatch(
      { items: [{ kind: 'material.create', create: { name: 'X' } }], idempotencyKey: 'k1' },
      user,
    );
    expect(first.proposalIds).toEqual(['507f1f77bcf86cd799439200']);
    expect(first.note).toContain('idempotency hit');
    expect(create).not.toHaveBeenCalled();
  });

  it('confirmBatch applies materials; cancelBatch does not write SoT (TZD-18)', async () => {
    const makeDoc = (id: string) => {
      const doc: any = {
        _id: id,
        status: 'proposed',
        kind: 'material.create',
        toolName: 't',
        actorUserId: user.id,
        organizationId: user.organizationId,
        entityType: 'Material',
        payload: { name: 'Oak', unit: 'шт' },
        expiresAt: new Date(Date.now() + 60_000),
        save: jest.fn(),
      };
      return doc;
    };
    const doc1 = makeDoc('507f1f77bcf86cd799439301');
    const doc2 = makeDoc('507f1f77bcf86cd799439302');
    const doc3 = makeDoc('507f1f77bcf86cd799439303');
    const findById = jest.fn().mockImplementation((id: string) => ({
      exec: jest.fn().mockResolvedValue(
        id === '507f1f77bcf86cd799439301'
          ? doc1
          : id === '507f1f77bcf86cd799439302'
            ? doc2
            : doc3,
      ),
    }));
    const { service, materials } = buildService({
      findById,
      materialsCreate: jest.fn().mockImplementation((p: any) =>
        Promise.resolve({
          _id: '507f1f77bcf86cd799439400',
          name: p.name,
          toObject: () => ({ name: p.name }),
        }),
      ),
    });

    const confirmed = await service.confirmBatch(
      {
        ids: [
          '507f1f77bcf86cd799439301',
          '507f1f77bcf86cd799439302',
        ],
      },
      user,
    );
    expect(confirmed.applied).toBe(2);
    expect(confirmed.failed).toEqual([]);
    expect(materials.create).toHaveBeenCalledTimes(2);
    expect(doc1.status).toBe('applied');

    const cancelled = await service.cancelBatch(
      { ids: ['507f1f77bcf86cd799439303'] },
      user,
    );
    expect(cancelled.cancelled).toBe(1);
    expect(doc3.status).toBe('cancelled');
    expect(materials.create).toHaveBeenCalledTimes(2); // cancel не пишет SoT
  });

  it('enforceRing deletes overflow', async () => {
    const save = jest.fn().mockResolvedValue(undefined);
    const doc: any = {
      _id: '507f1f77bcf86cd799439033',
      status: 'proposed',
      kind: 'material.create',
      toolName: 't',
      actorUserId: user.id,
      organizationId: user.organizationId,
      entityType: 'Material',
      payload: { name: 'X', unit: 'шт' },
      expiresAt: new Date(Date.now() + 60_000),
      save,
    };
    const { service, deleteMany, leanChain, materials } = buildService({
      findByIdDoc: doc,
      materialsCreate: jest.fn().mockResolvedValue({
        _id: '507f1f77bcf86cd799439044',
        toObject: () => ({ _id: '507f1f77bcf86cd799439044' }),
      }),
      ringSize: 2,
      countDocuments: jest.fn().mockResolvedValue(3),
    });
    leanChain.exec = jest.fn().mockResolvedValueOnce([{ _id: 'old1' }]);

    await service.confirm('507f1f77bcf86cd799439033', user);
    expect(deleteMany).toHaveBeenCalled();
    expect(materials.create).toHaveBeenCalled();
  });
});
