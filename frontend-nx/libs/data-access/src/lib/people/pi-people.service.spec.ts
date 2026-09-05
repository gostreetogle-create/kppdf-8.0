import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { API_BASE_URL } from '@kppdf/util-http';
import { PiPeopleService } from './pi-people.service';

describe('PiPeopleService (TZ-NX-REGISTRIES-WORKERS)', () => {
  let service: PiPeopleService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), { provide: API_BASE_URL, useValue: '/api' }],
    });
    service = TestBed.inject(PiPeopleService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('lists workers with server pagination and filters', () => {
    service.list({ page: 2, limit: 25, search: 'Иванов', isActive: true, workTypeId: 'wt-1' }).subscribe();
    const request = httpMock.expectOne((req) => req.url === '/api/workers');
    expect(request.request.method).toBe('GET');
    expect(request.request.params.get('page')).toBe('2');
    expect(request.request.params.get('limit')).toBe('25');
    expect(request.request.params.get('search')).toBe('Иванов');
    expect(request.request.params.get('isActive')).toBe('true');
    expect(request.request.params.get('workTypeId')).toBe('wt-1');
    request.flush({ items: [], total: 0, page: 2, limit: 25 });
  });

  it('POSTs workTypeIds and PATCHes a worker', () => {
    const payload = { lastName: 'Иванов', firstName: 'Иван', workTypeIds: ['wt-1'] };
    service.create(payload).subscribe();
    let request = httpMock.expectOne('/api/workers');
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(payload);
    request.flush({ _id: 'worker-1', ...payload, isActive: true });

    service.update('worker-1', { workTypeIds: ['wt-1', 'wt-2'] }).subscribe();
    request = httpMock.expectOne('/api/workers/worker-1');
    expect(request.request.method).toBe('PATCH');
    expect(request.request.body).toEqual({ workTypeIds: ['wt-1', 'wt-2'] });
    request.flush({ _id: 'worker-1', ...payload, isActive: true, workTypeIds: ['wt-1', 'wt-2'] });
  });

  it('soft-deletes a worker', () => {
    service.archive('worker-1').subscribe();
    const request = httpMock.expectOne('/api/workers/worker-1');
    expect(request.request.method).toBe('DELETE');
    request.flush(null);
  });
});
