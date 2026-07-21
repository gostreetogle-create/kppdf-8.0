import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { API_BASE_URL } from '../../core/api.tokens';
import { OrganizationsService } from './organizations.service';

describe('OrganizationsService', () => {
  let svc: OrganizationsService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: API_BASE_URL, useValue: 'http://test/api' },
        OrganizationsService,
      ],
    });
    svc = TestBed.inject(OrganizationsService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('list() GETs /api/organizations with default page/limit', () => {
    svc.list().subscribe((res) => {
      if (res.ok) {
        expect(res.data.items.length).toBe(2);
        expect(res.data.total).toBe(2);
      }
    });
    const req = httpMock.expectOne(
      (r) => r.url === 'http://test/api/organizations' && r.method === 'GET',
    );
    expect(req.request.params.get('page')).toBe('1');
    expect(req.request.params.get('limit')).toBe('50');
    req.flush({
      items: [
        { _id: 'o1', name: 'Acme' },
        { _id: 'o2', name: 'Beta' },
      ],
      total: 2,
    });
  });

  it('list({search}) passes search param', () => {
    svc.list({ search: 'acme' }).subscribe();
    const req = httpMock.expectOne(
      (r) => r.url === 'http://test/api/organizations' && r.method === 'GET',
    );
    expect(req.request.params.get('search')).toBe('acme');
    req.flush({ items: [], total: 0 });
  });

  it('findById() GETs /api/organizations/:id', () => {
    svc.findById('o1').subscribe((res) => {
      if (res.ok) expect(res.data.name).toBe('Acme');
    });
    const req = httpMock.expectOne('http://test/api/organizations/o1');
    expect(req.request.method).toBe('GET');
    req.flush({ _id: 'o1', name: 'Acme', inn: '123' });
  });

  it('create() POSTs body and returns organization', () => {
    svc.create({ name: 'Gamma', inn: '999' } as never).subscribe((res) => {
      if (res.ok) expect(res.data.name).toBe('Gamma');
    });
    const req = httpMock.expectOne('http://test/api/organizations');
    expect(req.request.method).toBe('POST');
    req.flush({ _id: 'o3', name: 'Gamma', inn: '999' });
  });

  it('remove() DELETEs /api/organizations/:id', () => {
    svc.remove('o1').subscribe((res) => {
      if (res.ok) expect(res.data).toBeUndefined();
    });
    const req = httpMock.expectOne('http://test/api/organizations/o1');
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });
});
