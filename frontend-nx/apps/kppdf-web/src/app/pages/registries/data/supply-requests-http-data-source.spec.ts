import { of } from 'rxjs';
import type { PiSupplyRequestsService, SupplyRequest } from '@kppdf/data-access';
import type { RegistryQueryState } from '../model/registry.types';
import { createSupplyRequestsHttpDataSource } from './supply-requests-http-data-source';

const SAMPLE: SupplyRequest = {
  _id: 'sr-1',
  title: 'Болт М8',
  qty: 10,
  status: 'in_progress',
  priority: 'normal',
};

function mockService(overrides: Partial<PiSupplyRequestsService> = {}): PiSupplyRequestsService {
  return {
    list: jest.fn().mockReturnValue(of({ ok: true as const, data: [SAMPLE] })),
    getById: jest.fn(),
    ...overrides,
  } as unknown as PiSupplyRequestsService;
}

describe('createSupplyRequestsHttpDataSource (TZ-NX-SUPPLY-REQUEST-REGISTRY-READ)', () => {
  it('maps filters to API and slices client-side', async () => {
    const list = jest.fn().mockReturnValue(of({ ok: true as const, data: [SAMPLE] }));
    const dataSource = createSupplyRequestsHttpDataSource(mockService({ list }));

    const state: RegistryQueryState = {
      filters: { search: ' болт ', status: 'in_progress', priority: 'normal', orderId: 'oid-1' },
      page: 1,
      pageSize: 25,
      sort: null,
    };

    const result = await dataSource.query(state);

    expect(list).toHaveBeenCalledWith({
      search: 'болт',
      status: 'in_progress',
      priority: 'normal',
      orderId: 'oid-1',
    });
    expect(result).toEqual({ rows: [SAMPLE], total: 1 });
  });

  it('never sends page/limit to the service', async () => {
    const list = jest.fn().mockReturnValue(of({ ok: true as const, data: [] }));
    await createSupplyRequestsHttpDataSource(mockService({ list })).query({
      filters: {},
      page: 3,
      pageSize: 50,
      sort: null,
    });
    expect(list).toHaveBeenCalledWith({
      search: undefined,
      status: undefined,
      priority: undefined,
      orderId: undefined,
    });
  });
});
