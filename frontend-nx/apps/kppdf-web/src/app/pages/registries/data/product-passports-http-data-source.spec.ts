import { of } from 'rxjs';
import type { PiProductPassportsService, ProductPassport } from '@kppdf/data-access';
import { createProductPassportsHttpDataSource } from './product-passports-http-data-source';

const ROWS: ProductPassport[] = [
  {
    _id: 'pp-1',
    productId: 'prod-1',
    passportNumber: 'P-100',
    name: 'Изделие А',
    isActive: true,
  },
  {
    _id: 'pp-2',
    productId: 'prod-2',
    passportNumber: 'P-200',
    name: 'Изделие Б',
    isActive: true,
  },
];

function mockService(overrides: Partial<PiProductPassportsService> = {}): PiProductPassportsService {
  return {
    list: jest.fn().mockReturnValue(of({ ok: true as const, data: ROWS })),
    getById: jest.fn(),
    getByProductId: jest.fn(),
    ...overrides,
  } as unknown as PiProductPassportsService;
}

describe('createProductPassportsHttpDataSource (TZ-NX-PRODUCT-PASSPORT-REGISTRY-READ)', () => {
  it('passes productId to API and applies client search', async () => {
    const list = jest.fn().mockReturnValue(of({ ok: true as const, data: ROWS }));
    const dataSource = createProductPassportsHttpDataSource(mockService({ list }));

    const result = await dataSource.query({
      filters: { productId: 'prod-1', search: 'P-100' },
      page: 1,
      pageSize: 25,
      sort: null,
    });

    expect(list).toHaveBeenCalledWith({ productId: 'prod-1' });
    expect(result.rows).toHaveLength(1);
    expect(result.rows[0]?.passportNumber).toBe('P-100');
  });

  it('never sends page/limit to API', async () => {
    const list = jest.fn().mockReturnValue(of({ ok: true as const, data: [] }));
    await createProductPassportsHttpDataSource(mockService({ list })).query({
      filters: {},
      page: 2,
      pageSize: 10,
      sort: null,
    });
    expect(list).toHaveBeenCalledWith({ productId: undefined });
  });
});
