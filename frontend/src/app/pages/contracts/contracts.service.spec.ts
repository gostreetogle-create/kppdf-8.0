import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { API_BASE_URL } from '../../core/api.tokens';
import { ContractsService } from './contracts.service';

describe('ContractsService', () => {
  let svc: ContractsService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: API_BASE_URL, useValue: 'http://test/api' },
        ContractsService,
      ],
    });
    svc = TestBed.inject(ContractsService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('list() GETs /api/contracts and returns flat array', () => {
    svc.list().subscribe((res) => {
      if (res.ok) {
        expect(res.data.length).toBe(2);
        expect(res.data[0].number).toBe('CTR-001');
      }
    });
    const req = httpMock.expectOne('http://test/api/contracts');
    expect(req.request.method).toBe('GET');
    req.flush([
      { _id: 'c1', number: 'CTR-001', status: 'draft', items: [] },
      { _id: 'c2', number: 'CTR-002', status: 'active', items: [] },
    ]);
  });

  it('findById() GETs /api/contracts/:id', () => {
    svc.findById('c1').subscribe((res) => {
      if (res.ok) expect(res.data.number).toBe('CTR-001');
    });
    const req = httpMock.expectOne('http://test/api/contracts/c1');
    expect(req.request.method).toBe('GET');
    req.flush({ _id: 'c1', number: 'CTR-001', status: 'draft', items: [] });
  });

  it('create() POSTs body and returns contract', () => {
    svc.create({ number: 'CTR-003', status: 'draft' } as never).subscribe((res) => {
      if (res.ok) expect(res.data.number).toBe('CTR-003');
    });
    const req = httpMock.expectOne('http://test/api/contracts');
    expect(req.request.method).toBe('POST');
    req.flush({ _id: 'c3', number: 'CTR-003', status: 'draft', items: [] });
  });

  it('update() PATCHes /api/contracts/:id', () => {
    svc.update('c1', { status: 'active' }).subscribe((res) => {
      if (res.ok) expect(res.data.status).toBe('active');
    });
    const req = httpMock.expectOne('http://test/api/contracts/c1');
    expect(req.request.method).toBe('PATCH');
    req.flush({ _id: 'c1', number: 'CTR-001', status: 'active', items: [] });
  });

  it('remove() DELETEs /api/contracts/:id', () => {
    svc.remove('c1').subscribe((res) => {
      if (res.ok) expect(res.data).toBeUndefined();
    });
    const req = httpMock.expectOne('http://test/api/contracts/c1');
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });
});
