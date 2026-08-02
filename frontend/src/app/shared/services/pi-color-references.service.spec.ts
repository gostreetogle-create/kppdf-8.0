import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { API_BASE_URL } from '../../core/api.tokens';
import { PiColorReferencesService } from './pi-color-references.service';

describe('PiColorReferencesService (TZ-PRODUCTS-301)', () => {
  let service: PiColorReferencesService;
  let httpMock: HttpTestingController;

  const colors = [
    {
      _id: 'color-1',
      name: 'Не выбран',
      slug: 'ne_vybran',
      hex: '#9CA3AF',
      isActive: true,
      isSystem: true,
      isDefault: true,
    },
    {
      _id: 'color-2',
      name: 'RAL 9003 — Сигнальный белый',
      slug: 'ral-9003',
      hex: '#F4F4F4',
      isActive: true,
      isSystem: false,
      isDefault: false,
    },
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: API_BASE_URL, useValue: 'http://test/api' },
        PiColorReferencesService,
      ],
    });
    service = TestBed.inject(PiColorReferencesService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('shares an active-catalog in-flight request and caches its successful result', () => {
    const first: unknown[] = [];
    const second: unknown[] = [];
    service.list({ activeOnly: true }).subscribe((res) => first.push(res));
    service.list({ activeOnly: true }).subscribe((res) => second.push(res));

    const requests = httpMock.match(
      (req) => req.url === 'http://test/api/color-references',
    );
    expect(requests).toHaveLength(1);
    expect(requests[0].request.params.get('activeOnly')).toBe('true');
    requests[0].flush(colors);

    expect(first).toHaveLength(1);
    expect(second).toHaveLength(1);

    service.list({ activeOnly: true }).subscribe((res) => {
      expect(res).toEqual({ ok: true, data: colors });
    });
    expect(
      httpMock.match((req) => req.url === 'http://test/api/color-references'),
    ).toHaveLength(0);
  });

  it('does not cache errors, allowing a later active-catalog call to retry', () => {
    service.list({ activeOnly: true }).subscribe((res) => expect(res.ok).toBe(false));
    httpMock
      .expectOne('http://test/api/color-references?activeOnly=true')
      .flush({ message: 'temporary failure' }, { status: 503, statusText: 'Unavailable' });

    service.list({ activeOnly: true }).subscribe((res) => expect(res.ok).toBe(true));
    httpMock
      .expectOne('http://test/api/color-references?activeOnly=true')
      .flush(colors);
  });

  it('does not cache unfiltered dictionary requests', () => {
    service.list().subscribe();
    service.list().subscribe();
    const requests = httpMock.match(
      (req) => req.url === 'http://test/api/color-references',
    );
    expect(requests).toHaveLength(2);
    requests.forEach((request) => request.flush(colors));
  });

  it('keeps search requests fresh rather than caching administrative results', () => {
    service.list({ activeOnly: true, search: 'RAL' }).subscribe();
    service.list({ activeOnly: true, search: 'RAL' }).subscribe();
    const requests = httpMock.match(
      (req) => req.url === 'http://test/api/color-references',
    );
    expect(requests).toHaveLength(2);
    expect(requests[0].request.params.get('activeOnly')).toBe('true');
    expect(requests[0].request.params.get('search')).toBe('RAL');
    requests.forEach((request) => request.flush(colors));
  });

  it('invalidates the active catalog after a successful create', () => {
    service.list({ activeOnly: true }).subscribe();
    httpMock
      .expectOne('http://test/api/color-references?activeOnly=true')
      .flush(colors);

    service.create({ name: 'RAL 7016' }).subscribe((res) => expect(res.ok).toBe(true));
    const create = httpMock.expectOne('http://test/api/color-references');
    expect(create.request.method).toBe('POST');
    create.flush({ ...colors[1], _id: 'color-3', name: 'RAL 7016' });

    service.list({ activeOnly: true }).subscribe();
    const refreshed = httpMock.expectOne(
      'http://test/api/color-references?activeOnly=true',
    );
    expect(refreshed.request.method).toBe('GET');
    refreshed.flush(colors);
  });

  it.each([
    ['update', () => service.update('color-2', { name: 'Переименован' }), 'PATCH'],
    ['remove', () => service.remove('color-2'), 'DELETE'],
  ])('invalidates the active catalog after a successful %s', (_label, mutation, method) => {
    service.list({ activeOnly: true }).subscribe();
    httpMock
      .expectOne('http://test/api/color-references?activeOnly=true')
      .flush(colors);

    mutation().subscribe((res) => expect(res.ok).toBe(true));
    const request = httpMock.expectOne('http://test/api/color-references/color-2');
    expect(request.request.method).toBe(method);
    request.flush(method === 'DELETE' ? null : { ...colors[1], name: 'Переименован' });

    service.list({ activeOnly: true }).subscribe();
    const refreshed = httpMock.expectOne(
      'http://test/api/color-references?activeOnly=true',
    );
    expect(refreshed.request.method).toBe('GET');
    refreshed.flush(colors);
  });

  it('does not let an old in-flight response repopulate the cache after a mutation', () => {
    service.list({ activeOnly: true }).subscribe();
    const oldRequest = httpMock.expectOne(
      'http://test/api/color-references?activeOnly=true',
    );

    service
      .update('color-2', { name: 'Переименован' })
      .subscribe((res) => expect(res.ok).toBe(true));
    const update = httpMock.expectOne('http://test/api/color-references/color-2');
    update.flush({ ...colors[1], name: 'Переименован' });

    service.list({ activeOnly: true }).subscribe();
    const freshRequest = httpMock.expectOne(
      'http://test/api/color-references?activeOnly=true',
    );
    expect(freshRequest).not.toBe(oldRequest);

    oldRequest.flush(colors);
    freshRequest.flush([{ ...colors[1], name: 'Переименован' }]);

    service.list({ activeOnly: true }).subscribe((res) => {
      expect(res).toEqual({
        ok: true,
        data: [{ ...colors[1], name: 'Переименован' }],
      });
    });
    expect(
      httpMock.match((req) => req.url === 'http://test/api/color-references'),
    ).toHaveLength(0);
  });

  it('keeps the active catalog after a failed mutation', () => {
    service.list({ activeOnly: true }).subscribe();
    httpMock
      .expectOne('http://test/api/color-references?activeOnly=true')
      .flush(colors);

    service.update('color-2', { name: 'Ошибка' }).subscribe((res) => expect(res.ok).toBe(false));
    httpMock
      .expectOne('http://test/api/color-references/color-2')
      .flush({ message: 'conflict' }, { status: 409, statusText: 'Conflict' });

    service.list({ activeOnly: true }).subscribe((res) => expect(res.ok).toBe(true));
    expect(
      httpMock.match((req) => req.url === 'http://test/api/color-references'),
    ).toHaveLength(0);
  });

  it('findById GETs a single color', () => {
    service.findById('color-2').subscribe((res) => expect(res.ok).toBe(true));
    const request = httpMock.expectOne('http://test/api/color-references/color-2');
    expect(request.request.method).toBe('GET');
    request.flush(colors[1]);
  });
});
