import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { API_BASE_URL } from '../../core/api.tokens';
import { WorkTypesService } from './pi-work-types.service';

/**
 * TZ-83 Phase E.2: WorkTypesService unit tests.
 * Smoke: list() maps raw array → { items, total } envelope.
 * activeOnly filter applied client-side per service contract.
 */
describe('WorkTypesService', () => {
  let svc: WorkTypesService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: API_BASE_URL, useValue: 'http://test/api' },
        WorkTypesService,
      ],
    });
    svc = TestBed.inject(WorkTypesService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('list() wraps raw array as { items, total } envelope', () => {
    svc.list().subscribe((res) => {
      if (res.ok) {
        expect(res.data.items.length).toBe(2);
        expect(res.data.total).toBe(2);
        expect(res.data.items[0].name).toBe('Резка');
        expect(res.data.items[1].isActive).toBe(false);
      }
    });
    const req = httpMock.expectOne('http://test/api/work-types');
    expect(req.request.method).toBe('GET');
    req.flush([
      { _id: 'a1', name: 'Резка', isActive: true },
      { _id: 'a2', name: 'Сборка', isActive: false },
    ]);
  });

  it('list({activeOnly: true}) filters out isActive=false client-side', () => {
    svc.list({ activeOnly: true }).subscribe((res) => {
      if (res.ok) {
        expect(res.data.items.length).toBe(1);
        expect(res.data.items[0].name).toBe('Резка');
        expect(res.data.total).toBe(1);
      }
    });
    const req = httpMock.expectOne('http://test/api/work-types');
    req.flush([
      { _id: 'a1', name: 'Резка', isActive: true },
      { _id: 'a2', name: 'Сборка', isActive: false },
    ]);
  });

  it('create() POSTs body and returns work-type on 2xx', () => {
    svc.create({ name: 'Покраска' } as never).subscribe((res) => {
      if (res.ok) expect(res.data.name).toBe('Покраска');
    });
    const req = httpMock.expectOne('http://test/api/work-types');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ name: 'Покраска' });
    req.flush({ _id: 'b1', name: 'Покраска', isActive: true });
  });
});
