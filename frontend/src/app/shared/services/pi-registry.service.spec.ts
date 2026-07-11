import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  provideHttpClientTesting,
  HttpTestingController,
} from '@angular/common/http/testing';
import { API_BASE_URL } from '../../core/api.tokens';
import { RegistryService } from './pi-registry.service';

/**
 * TZ-86 Phase B.5 — RegistryService unit tests.
 *
 * Smoke: getDataSources() returns the canonical { sources: [...] } envelope
 *        with 5 entity types (organization/counterparty/product/material/work-type).
 *
 * Pattern mirrors pi-work-types.service.spec.ts (TZ-83 precedent), simplified
 * since this service exposes only one endpoint.
 */
describe('RegistryService', () => {
  let svc: RegistryService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: API_BASE_URL, useValue: 'http://test/api' },
        RegistryService,
      ],
    });
    svc = TestBed.inject(RegistryService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('getDataSources() returns { sources: [...] } with 5 entries', () => {
    svc.getDataSources().subscribe((res) => {
      if (res.ok) {
        expect(res.data.sources.length).toBe(5);
        const keys = res.data.sources.map((s) => s.key);
        expect(keys).toEqual([
          'organization',
          'counterparty',
          'product',
          'material',
          'work-type',
        ]);
        const organization = res.data.sources.find((s) => s.key === 'organization');
        expect(organization?.label).toBe('Организация');
        expect(organization?.group).toBe('contacts');
        expect(organization?.fields.length).toBeGreaterThan(0);
        expect(organization?.fields[0].label).toBe('Наименование');
        expect(organization?.fields[0].type).toBe('text');
      }
    });
    const req = httpMock.expectOne('http://test/api/registry/data-sources');
    expect(req.request.method).toBe('GET');
    req.flush({
      sources: [
        {
          key: 'organization',
          label: 'Организация',
          group: 'contacts',
          fields: [{ key: 'name', label: 'Наименование', type: 'text' }],
        },
        {
          key: 'counterparty',
          label: 'Контрагент',
          group: 'contacts',
          fields: [{ key: 'name', label: 'Наименование', type: 'text' }],
        },
        {
          key: 'product',
          label: 'Продукция',
          group: 'catalog',
          fields: [{ key: 'name', label: 'Наименование', type: 'text' }],
        },
        {
          key: 'material',
          label: 'Материал',
          group: 'catalog',
          fields: [{ key: 'name', label: 'Наименование', type: 'text' }],
        },
        {
          key: 'work-type',
          label: 'Вид работ',
          group: 'work',
          fields: [{ key: 'name', label: 'Наименование', type: 'text' }],
        },
      ],
    });
  });

  it('URL has no query parameters (registry is static, filters applied client-side)', () => {
    svc.getDataSources().subscribe();
    const req = httpMock.expectOne((r) => r.url === 'http://test/api/registry/data-sources');
    expect(req.request.params.keys().length).toBe(0);
    req.flush({ sources: [] });
  });
});
