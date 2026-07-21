import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { API_BASE_URL } from '../../core/api.tokens';
import { CounterpartyService } from './pi-counterparty.service';

describe('CounterpartyService', () => {
  let svc: CounterpartyService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: API_BASE_URL, useValue: 'http://test/api' },
        CounterpartyService,
      ],
    });
    svc = TestBed.inject(CounterpartyService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('list() GETs /api/counterparties with default params', () => {
    svc.list().subscribe((res) => {
      if (res.ok) {
        expect(res.data.items.length).toBe(2);
        expect(res.data.total).toBe(2);
      }
    });
    const req = httpMock.expectOne(
      (r) => r.url === 'http://test/api/counterparties' && r.method === 'GET',
    );
    expect(req.request.params.get('page')).toBe('1');
    expect(req.request.params.get('limit')).toBe('200');
    req.flush({
      items: [
        { _id: 'cp1', name: 'ООО Ромашка', inn: '123' },
        { _id: 'cp2', name: 'ИП Иванов', inn: '456' },
      ],
      total: 2,
    });
  });

  it('findById() GETs /api/counterparties/:id', () => {
    svc.findById('cp1').subscribe((res) => {
      if (res.ok) expect(res.data.name).toBe('ООО Ромашка');
    });
    const req = httpMock.expectOne('http://test/api/counterparties/cp1');
    expect(req.request.method).toBe('GET');
    req.flush({ _id: 'cp1', name: 'ООО Ромашка', inn: '123' });
  });

  it('create() POSTs body and returns counterparty', () => {
    svc.create({ name: 'Новый', inn: '789' } as never).subscribe((res) => {
      if (res.ok) expect(res.data.name).toBe('Новый');
    });
    const req = httpMock.expectOne('http://test/api/counterparties');
    expect(req.request.method).toBe('POST');
    req.flush({ _id: 'cp3', name: 'Новый', inn: '789' });
  });

  it('remove() DELETEs /api/counterparties/:id', () => {
    svc.remove('cp1').subscribe((res) => {
      if (res.ok) expect(res.data).toBeUndefined();
    });
    const req = httpMock.expectOne('http://test/api/counterparties/cp1');
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });
});
