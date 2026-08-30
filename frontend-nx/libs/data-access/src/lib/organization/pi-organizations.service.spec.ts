import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { API_BASE_URL } from '@kppdf/util-http';
import { PiOrganizationsService } from './pi-organizations.service';

describe('PiOrganizationsService (TZ-NX-ORGANIZATION-REGISTRY-READ)', () => {
  let service: PiOrganizationsService;
  let httpMock: HttpTestingController;
  const baseUrl = '/api';
  const listUrl = `${baseUrl}/organizations`;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: API_BASE_URL, useValue: baseUrl },
      ],
    }).compileComponents();

    service = TestBed.inject(PiOrganizationsService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('list() defaults page=1 limit=25 and sends search/type', () => {
    service.list({ search: 'ромаш', type: 'supplier' }).subscribe();
    const req = httpMock.expectOne((r) => r.url === listUrl);
    expect(req.request.params.get('page')).toBe('1');
    expect(req.request.params.get('limit')).toBe('25');
    expect(req.request.params.get('search')).toBe('ромаш');
    expect(req.request.params.get('type')).toBe('supplier');
    expect(req.request.params.has('organizationId')).toBe(false);
    req.flush({ items: [], total: 0, page: 1, limit: 25 });
  });

  it('list() clamps limit to 100', () => {
    service.list({ limit: 500 }).subscribe();
    const req = httpMock.expectOne((r) => r.url === listUrl);
    expect(req.request.params.get('limit')).toBe('100');
    req.flush({ items: [], total: 0, page: 1, limit: 100 });
  });

  it('getById() GETs /organizations/:id', () => {
    service.getById('507f1f77bcf86cd799439011').subscribe();
    const req = httpMock.expectOne(`${baseUrl}/organizations/507f1f77bcf86cd799439011`);
    expect(req.request.method).toBe('GET');
    req.flush({ _id: '507f1f77bcf86cd799439011', name: 'ООО Тест', inn: '7701234567', type: ['supplier'] });
  });
});
