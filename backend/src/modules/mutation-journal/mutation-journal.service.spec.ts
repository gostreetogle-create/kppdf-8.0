import { BadRequestException } from '@nestjs/common';
import { MutationJournalService } from './mutation-journal.service';

function buildService(opts: {
  create?: jest.Mock;
  findByIdDoc?: any;
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

  const findById = jest.fn().mockImplementation(() => ({
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
