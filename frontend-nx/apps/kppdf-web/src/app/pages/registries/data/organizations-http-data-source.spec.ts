import { of } from 'rxjs';
import type { Organization, PiOrganizationsService } from '@kppdf/data-access';
import type { RegistryQueryState } from '../model/registry.types';
import { createOrganizationsHttpDataSource } from './organizations-http-data-source';

const SAMPLE: Organization = {
  _id: 'org-1',
  name: 'ООО Поставщик',
  inn: '7701234567',
  type: ['supplier'],
};

function mockService(overrides: Partial<PiOrganizationsService> = {}): PiOrganizationsService {
  return {
    list: jest.fn().mockReturnValue(
      of({ ok: true as const, data: { items: [SAMPLE], total: 1, page: 1, limit: 25 } }),
    ),
    getById: jest.fn(),
    ...overrides,
  } as unknown as PiOrganizationsService;
}

describe('createOrganizationsHttpDataSource (TZ-NX-ORGANIZATION-REGISTRY-READ)', () => {
  it('maps registry state to server pagination params', async () => {
    const list = jest.fn().mockReturnValue(
      of({ ok: true as const, data: { items: [SAMPLE], total: 1, page: 2, limit: 25 } }),
    );
    const dataSource = createOrganizationsHttpDataSource(mockService({ list }));

    const state: RegistryQueryState = {
      filters: { search: ' пост ', type: 'supplier' },
      page: 2,
      pageSize: 25,
      sort: null,
    };

    const result = await dataSource.query(state);

    expect(list).toHaveBeenCalledWith({
      page: 2,
      limit: 25,
      search: 'пост',
      type: 'supplier',
    });
    expect(result).toEqual({ rows: [SAMPLE], total: 1 });
  });
});
