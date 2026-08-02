import { TestBed } from '@angular/core/testing';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { API_BASE_URL } from '../../core/api.tokens';
import { PiWorkersService, type Person, type CreatePersonPayload } from './pi-workers.service';

const BASE = 'http://localhost:3000';

function makePayload(): CreatePersonPayload {
  return {
    name: 'Иван Иванов',
    email: 'ivan@example.com',
    position: 'Сварщик',
    supplierId: undefined,
    workTypeIds: [],
    notes: 'test note',
  };
}

describe('PiWorkersService', () => {
  let service: PiWorkersService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withFetch()),
        provideHttpClientTesting(),
        { provide: API_BASE_URL, useValue: BASE },
        PiWorkersService,
      ],
    });
    service = TestBed.inject(PiWorkersService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('list() hits /api/workers with activeOnly=true', () => {
    service.list({ activeOnly: true }).subscribe();
    const req = http.expectOne((r) => r.url === `${BASE}/api/workers` && r.params.get('activeOnly') === 'true');
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });

  it('list() passes q and supplierId params', () => {
    service.list({ q: 'Иван', supplierId: '507f1f77bcf86cd799439011' }).subscribe();
    const req = http.expectOne((r) => {
      const p = r.params;
      return r.url === `${BASE}/api/workers`
        && p.get('q') === 'Иван'
        && p.get('supplierId') === '507f1f77bcf86cd799439011';
    });
    req.flush([]);
  });

  it('get() hits /api/workers/:id', () => {
    const id = '507f1f77bcf86cd799439011';
    service.get(id).subscribe((p: Person) => expect(p._id).toBe(id));
    const req = http.expectOne(`${BASE}/api/workers/${id}`);
    expect(req.request.method).toBe('GET');
    req.flush({ _id: id, name: 'X', isActive: true, createdAt: '', updatedAt: '' } as Person);
  });

  it('create() POSTs payload', () => {
    const payload = makePayload();
    service.create(payload).subscribe((p: Person) => expect(p.name).toBe(payload.name));
    const req = http.expectOne(`${BASE}/api/workers`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(payload);
    req.flush({ _id: 'x', name: payload.name, isActive: true, createdAt: '', updatedAt: '' } as Person);
  });

  it('update() PATCHes', () => {
    const id = '507f1f77bcf86cd799439011';
    service.update(id, { isActive: false }).subscribe();
    const req = http.expectOne(`${BASE}/api/workers/${id}`);
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toEqual({ isActive: false });
    req.flush({ _id: id, name: 'X', isActive: false, createdAt: '', updatedAt: '' } as Person);
  });

  it('remove() DELETEs', () => {
    const id = '507f1f77bcf86cd799439011';
    service.remove(id).subscribe();
    const req = http.expectOne(`${BASE}/api/workers/${id}`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });
});
