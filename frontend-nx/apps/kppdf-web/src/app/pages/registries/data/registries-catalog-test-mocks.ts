import { of } from 'rxjs';
import { jest } from '@jest/globals';
import type {
  PiOrganizationsService,
  PiProductPassportsService,
} from '@kppdf/data-access';

export function mockOrganizationsService(): PiOrganizationsService {
  return {
    list: jest.fn().mockReturnValue(
      of({ ok: true, data: { items: [], total: 0, page: 1, limit: 25 } }),
    ),
    getById: jest.fn(),
  } as unknown as PiOrganizationsService;
}

export function mockProductPassportsService(): PiProductPassportsService {
  return {
    list: jest.fn().mockReturnValue(of({ ok: true, data: [] })),
    getById: jest.fn(),
    getByProductId: jest.fn(),
  } as unknown as PiProductPassportsService;
}
