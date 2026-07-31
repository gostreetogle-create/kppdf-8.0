import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { API_BASE_URL } from '../../core/api.tokens';
import { PersonService } from './pi-person.service';

describe('PersonService', () => {
  let service: PersonService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: API_BASE_URL, useValue: '/api' },
        PersonService,
      ],
    });
    service = TestBed.inject(PersonService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('lists persons with pagination and search', () => {
    service.list({ page: 2, limit: 10, search: 'Иван' }).subscribe((result) => {
      expect(result.ok).toBe(true);
    });
    const request = http.expectOne('/api/persons?page=2&limit=10&search=%D0%98%D0%B2%D0%B0%D0%BD');
    expect(request.request.method).toBe('GET');
    request.flush({ items: [], total: 0, page: 2, limit: 10 });
  });

  it('creates and deletes a person through the documented endpoints', () => {
    service.create({ firstName: 'Иван', lastName: 'Петров' }).subscribe();
    const create = http.expectOne('/api/persons');
    expect(create.request.method).toBe('POST');
    expect(create.request.body).toEqual({ firstName: 'Иван', lastName: 'Петров' });
    create.flush({ _id: 'p1', firstName: 'Иван', lastName: 'Петров' });

    service.remove('p1').subscribe();
    const remove = http.expectOne('/api/persons/p1');
    expect(remove.request.method).toBe('DELETE');
    remove.flush(null);
  });
});
