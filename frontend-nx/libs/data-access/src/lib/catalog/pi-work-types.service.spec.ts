import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { API_BASE_URL } from '@kppdf/util-http';
import { PiWorkTypesService } from './pi-work-types.service';

describe('PiWorkTypesService (TZ-NX-REGISTRIES-WORK-TYPES)', () => {
  let service: PiWorkTypesService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: API_BASE_URL, useValue: '/api' },
      ],
    });
    service = TestBed.inject(PiWorkTypesService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('lists the flat API response and wraps it for consumers', () => {
    let result: unknown;
    service.list({ activeOnly: false }).subscribe((value) => (result = value));
    const request = httpMock.expectOne('/api/work-types');
    expect(request.request.method).toBe('GET');
    request.flush([{ _id: 'wt-1', name: 'Сварка', isActive: true, hourlyRate: 500 }]);
    expect(result).toEqual({
      ok: true,
      data: {
        items: [{ _id: 'wt-1', name: 'Сварка', isActive: true, hourlyRate: 500 }],
        total: 1,
      },
    });
  });

  it('POSTs a full create payload', () => {
    const payload = { name: 'Покраска', hourlyRate: 650, days: 2, accentHue: 250, isActive: true };
    service.create(payload).subscribe();
    const request = httpMock.expectOne('/api/work-types');
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(payload);
    request.flush({ _id: 'wt-2', ...payload });
  });

  it('PATCHes full payload and keeps the Gantt days-only call compatible', () => {
    service.update('wt-1', { hourlyRate: 500, days: 3 }).subscribe();
    let request = httpMock.expectOne('/api/work-types/wt-1');
    expect(request.request.method).toBe('PATCH');
    expect(request.request.body).toEqual({ hourlyRate: 500, days: 3 });
    request.flush({ _id: 'wt-1', name: 'Сварка', isActive: true, hourlyRate: 500, days: 3 });

    service.update('wt-1', { days: 4 }).subscribe();
    request = httpMock.expectOne('/api/work-types/wt-1');
    expect(request.request.body).toEqual({ days: 4 });
    request.flush({ _id: 'wt-1', name: 'Сварка', isActive: true, hourlyRate: 500, days: 4 });
  });

  it('DELETEs the work type through the soft-archive endpoint', () => {
    service.archive('wt-1').subscribe();
    const request = httpMock.expectOne('/api/work-types/wt-1');
    expect(request.request.method).toBe('DELETE');
    request.flush(null);
  });
});
