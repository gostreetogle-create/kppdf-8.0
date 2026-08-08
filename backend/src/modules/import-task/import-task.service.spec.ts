import { BadRequestException } from '@nestjs/common';
import { ImportTaskService } from './import-task.service';

function buildService(opts: {
  create?: jest.Mock;
  findByIdDoc?: any;
  aggregate?: jest.Mock;
  countDocuments?: jest.Mock;
} = {}) {
  const create = opts.create ?? jest.fn();
  const findById = jest.fn().mockImplementation(() => ({
    exec: jest.fn().mockResolvedValue(opts.findByIdDoc ?? null),
  }));
  const aggregate =
    opts.aggregate ?? jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue([]) });
  const countDocuments =
    opts.countDocuments ?? jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue(0) });

  const model = {
    create,
    findById,
    aggregate,
    countDocuments,
  } as any;

  const service = new ImportTaskService(model);
  return { service, create, findById, model };
}

const user = {
  id: '507f1f77bcf86cd799439011',
  username: 'mgr',
  role: 'manager',
  organizationId: '507f1f77bcf86cd799439022',
};

const threeRows = [
  { rowIndex: 0, raw: { name: 'A' }, name: 'A', unit: 'шт' },
  { rowIndex: 1, raw: { name: 'B' }, name: 'B' },
  { rowIndex: 2, raw: { name: 'C' }, name: 'C', article: 'X1' },
];

describe('ImportTaskService (TZD-22)', () => {
  it('create with 3 rows → ready_for_ai, proposalIds=[], aiReport=null', async () => {
    const { service, create } = buildService({
      create: jest.fn().mockResolvedValue({
        _id: '507f1f77bcf86cd799439033',
        createdByUserId: user.id,
        organizationId: user.organizationId,
        source: { fileName: 't.xlsx', fileType: 'xlsx' },
        status: 'ready_for_ai',
        rows: threeRows,
        summary: 't.xlsx · 3 строк',
        aiReport: null,
        proposalIds: [],
        toObject() {
          return this;
        },
      }),
    });

    const view = await service.create(
      {
        source: { fileName: 't.xlsx', fileType: 'xlsx' },
        rows: threeRows,
      },
      user,
    );

    expect(view.status).toBe('ready_for_ai');
    expect(view.rowCount).toBe(3);
    expect(view.proposalIds).toEqual([]);
    expect(view.aiReport).toBeNull();
    expect(create).toHaveBeenCalled();
    const arg = create.mock.calls[0][0];
    expect(arg.status).toBe('ready_for_ai');
    expect(arg.proposalIds).toEqual([]);
    expect(arg.aiReport).toBeNull();
  });

  it('create rejects >500 rows', async () => {
    const { service } = buildService();
    const rows = Array.from({ length: 501 }, (_, i) => ({
      rowIndex: i,
      raw: { name: `R${i}` },
      name: `R${i}`,
    }));
    await expect(
      service.create(
        { source: { fileName: 'big.csv', fileType: 'csv' }, rows },
        user,
      ),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('list returns summary/rowCount without requiring full rows in items', async () => {
    const { service } = buildService({
      aggregate: jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue([
          {
            _id: '507f1f77bcf86cd799439033',
            source: { fileName: 't.xlsx', fileType: 'xlsx' },
            status: 'ready_for_ai',
            summary: 't.xlsx · 3 строк',
            rowCount: 3,
            createdAt: new Date('2026-08-08T00:00:00Z'),
          },
        ]),
      }),
      countDocuments: jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(1),
      }),
    });

    const result = await service.list(user, { limit: 10 });
    expect(result.total).toBe(1);
    expect(result.items[0].rowCount).toBe(3);
    expect(result.items[0].summary).toContain('t.xlsx');
    expect((result.items[0] as any).rows).toBeUndefined();
  });

  it('patchStatus ready_for_ai → cancelled and reopen', async () => {
    const save = jest.fn().mockResolvedValue(undefined);
    const doc: any = {
      _id: '507f1f77bcf86cd799439033',
      status: 'ready_for_ai',
      createdByUserId: { toString: () => user.id },
      organizationId: { toString: () => user.organizationId },
      source: { fileName: 't.xlsx', fileType: 'xlsx' },
      rows: threeRows,
      proposalIds: [],
      aiReport: null,
      save,
      toObject() {
        return { ...this, _id: this._id };
      },
    };
    const { service } = buildService({ findByIdDoc: doc });

    const cancelled = await service.patchStatus(
      '507f1f77bcf86cd799439033',
      { status: 'cancelled' },
      user,
    );
    expect(cancelled.status).toBe('cancelled');
    expect(save).toHaveBeenCalled();

    doc.status = 'cancelled';
    const reopened = await service.patchStatus(
      '507f1f77bcf86cd799439033',
      { status: 'ready_for_ai' },
      user,
    );
    expect(reopened.status).toBe('ready_for_ai');
  });

  it('patchStatus rejects done → analyzing', async () => {
    const doc: any = {
      _id: '507f1f77bcf86cd799439033',
      status: 'done',
      createdByUserId: { toString: () => user.id },
      organizationId: { toString: () => user.organizationId },
      source: { fileName: 't.xlsx', fileType: 'xlsx' },
      rows: [],
      proposalIds: [],
      save: jest.fn(),
      toObject() {
        return this;
      },
    };
    const { service } = buildService({ findByIdDoc: doc });
    await expect(
      service.patchStatus(
        '507f1f77bcf86cd799439033',
        { status: 'analyzing' },
        user,
      ),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('create does not depend on Material / journal (model.create only)', async () => {
    const { service, create, model } = buildService({
      create: jest.fn().mockResolvedValue({
        _id: '507f1f77bcf86cd799439033',
        status: 'ready_for_ai',
        rows: threeRows,
        source: { fileName: 't.xlsx', fileType: 'xlsx' },
        proposalIds: [],
        aiReport: null,
        toObject() {
          return this;
        },
      }),
    });
    await service.create(
      { source: { fileName: 't.xlsx', fileType: 'xlsx' }, rows: threeRows },
      user,
    );
    expect(create).toHaveBeenCalledTimes(1);
    expect(model.findById).not.toHaveBeenCalled();
  });
});
