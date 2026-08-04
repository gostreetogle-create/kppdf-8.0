import { TestBed } from '@angular/core/testing';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { API_BASE_URL } from '../../core/api.tokens';
import {
  PiWorkersService,
  personDisplayName,
  type CreatePersonPayload,
  type Person,
} from './pi-workers.service';

const BASE = 'http://test/api';

function makePayload(): CreatePersonPayload {
  return {
    lastName: 'Иванов',
    firstName: 'Иван',
    patronymic: 'Иванович',
    email: 'ivan@example.com',
    position: 'Сварщик',
    notes: 'test note',
  };
}

function makePerson(overrides: Partial<Person> = {}): Person {
  return {
    _id: '507f1f77bcf86cd799439011',
    lastName: 'Иванов',
    firstName: 'Иван',
    isActive: true,
    createdAt: '',
    updatedAt: '',
    ...overrides,
  };
}

describe('PiWorkersService (TZ-UX-306)', () => {
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

  it('personDisplayName joins last/first/patronymic', () => {
    expect(personDisplayName(makePerson({ patronymic: 'Петрович' }))).toBe('Иванов Иван Петрович');
  });

  it('list() hits /workers with isActive + search params', () => {
    service.list({ isActive: true, search: 'Иван', page: 1, limit: 50 }).subscribe((res) => {
      expect(res.ok).toBe(true);
      if (res.ok) expect(res.data.items.length).toBe(1);
    });
    const req = http.expectOne((r) => {
      return (
        r.url === `${BASE}/workers` &&
        r.params.get('isActive') === 'true' &&
        r.params.get('search') === 'Иван' &&
        r.params.get('limit') === '50'
      );
    });
    expect(req.request.method).toBe('GET');
    req.flush({ items: [makePerson()], total: 1, page: 1, limit: 50 });
  });

  it('get() hits /workers/:id', () => {
    const id = '507f1f77bcf86cd799439011';
    service.get(id).subscribe((res) => {
      expect(res.ok).toBe(true);
      if (res.ok) expect(res.data._id).toBe(id);
    });
    const req = http.expectOne(`${BASE}/workers/${id}`);
    expect(req.request.method).toBe('GET');
    req.flush(makePerson({ _id: id }));
  });

  it('create() POSTs Worker-shaped payload', () => {
    const payload = makePayload();
    service.create(payload).subscribe((res) => {
      expect(res.ok).toBe(true);
      if (res.ok) expect(res.data.lastName).toBe('Иванов');
    });
    const req = http.expectOne(`${BASE}/workers`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(payload);
    req.flush(makePerson(payload));
  });

  it('update() PATCHes', () => {
    const id = '507f1f77bcf86cd799439011';
    service.update(id, { isActive: false }).subscribe((res) => expect(res.ok).toBe(true));
    const req = http.expectOne(`${BASE}/workers/${id}`);
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toEqual({ isActive: false });
    req.flush(makePerson({ _id: id, isActive: false }));
  });

  it('remove() DELETEs', () => {
    const id = '507f1f77bcf86cd799439011';
    service.remove(id).subscribe((res) => expect(res.ok).toBe(true));
    const req = http.expectOne(`${BASE}/workers/${id}`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });
});
