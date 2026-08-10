import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { API_BASE_URL } from '../../core/api.tokens';
import { PiToastService } from '../ui/toast';
import { PiDictionaryLabelsService } from './pi-dictionary-labels.service';

describe('PiDictionaryLabelsService (TZ-DICT-320)', () => {
  let service: PiDictionaryLabelsService;
  let httpMock: HttpTestingController;
  const warning = jest.fn();

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: API_BASE_URL, useValue: 'http://test/api' },
        { provide: PiToastService, useValue: { warning } },
        PiDictionaryLabelsService,
      ],
    });
    service = TestBed.inject(PiDictionaryLabelsService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('loads active labels once and shares the cache', () => {
    const first: unknown[] = [];
    const second: unknown[] = [];
    service.active('productKind').subscribe((labels) => first.push(labels));
    service.active('productKind').subscribe((labels) => second.push(labels));

    const request = httpMock.expectOne('http://test/api/dictionary-labels?scope=productKind');
    request.flush([
      {
        _id: 'good',
        scope: 'productKind',
        key: 'good',
        label: 'Изделие новое',
        sortOrder: 0,
        isActive: true,
        isSystem: true,
      },
      {
        _id: 'service',
        scope: 'productKind',
        key: 'service',
        label: 'Услуга',
        sortOrder: 1,
        isActive: false,
        isSystem: true,
      },
    ]);

    expect(first[0]).toEqual([expect.objectContaining({ key: 'good', label: 'Изделие новое' })]);
    expect(second).toEqual(first);
    service
      .active('productKind')
      .subscribe((labels) => expect(labels[0].label).toBe('Изделие новое'));
    expect(httpMock.match((req) => req.url.includes('/dictionary-labels'))).toHaveLength(0);
  });

  it('uses the shared seed fallback and warns only once after API failure', () => {
    service.active('materialKind').subscribe((labels) => expect(labels[0].key).toBe('raw'));
    httpMock
      .expectOne('http://test/api/dictionary-labels?scope=materialKind')
      .flush({ message: 'Сеть недоступна' }, { status: 503, statusText: 'Unavailable' });
    service.active('materialKind').subscribe((labels) => expect(labels[0].key).toBe('raw'));
    httpMock
      .expectOne('http://test/api/dictionary-labels?scope=materialKind')
      .flush({ message: 'Сеть недоступна' }, { status: 503, statusText: 'Unavailable' });
    expect(warning).toHaveBeenCalledTimes(1);
  });

  it('invalidates the scope cache after a successful PATCH', () => {
    service.active('productKind').subscribe();
    httpMock.expectOne('http://test/api/dictionary-labels?scope=productKind').flush([
      {
        _id: 'good',
        scope: 'productKind',
        key: 'good',
        label: 'Изделие',
        sortOrder: 0,
        isActive: true,
        isSystem: true,
      },
    ]);
    service.update('good', { label: 'Продукция' }).subscribe();
    const patch = httpMock.expectOne('http://test/api/dictionary-labels/good');
    expect(patch.request.method).toBe('PATCH');
    patch.flush({
      _id: 'good',
      scope: 'productKind',
      key: 'good',
      label: 'Продукция',
      sortOrder: 0,
      isActive: true,
      isSystem: true,
    });

    service.active('productKind').subscribe();
    expect(
      httpMock.expectOne('http://test/api/dictionary-labels?scope=productKind').request.method,
    ).toBe('GET');
  });
});
