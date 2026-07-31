import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { API_BASE_URL } from '../../core/api.tokens';
import { CurrencyService } from './pi-currency.service';

describe('CurrencyService', () => {
  let service: CurrencyService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: API_BASE_URL, useValue: '/api' },
        CurrencyService,
      ],
    });
    service = TestBed.inject(CurrencyService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('lists currencies with the backend query contract', () => {
    service.list({ isActive: true }).subscribe();
    const request = http.expectOne('/api/currencies?page=1&limit=20&isActive=true');
    expect(request.request.method).toBe('GET');
    request.flush({ items: [], total: 0, page: 1, limit: 20 });
  });

  it('updates and removes currencies by key', () => {
    service.update('RUB', { rate: 1 }).subscribe();
    const update = http.expectOne('/api/currencies/RUB');
    expect(update.request.method).toBe('PATCH');
    expect(update.request.body).toEqual({ rate: 1 });
    update.flush({ _id: 'c1', key: 'RUB', rate: 1 });

    service.remove('RUB').subscribe();
    const remove = http.expectOne('/api/currencies/RUB');
    expect(remove.request.method).toBe('DELETE');
    remove.flush(null);
  });
});
