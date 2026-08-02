import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { API_BASE_URL } from '../../core/api.tokens';
import { TextBlockCategoriesService } from './pi-text-block-categories.service';

describe('TextBlockCategoriesService (TZ-DOC-316)', () => {
  let service: TextBlockCategoriesService;
  let httpMock: HttpTestingController;

  const categories = [
    {
      _id: 'cat-1',
      name: 'Общее',
      slug: 'obshchee',
      isActive: true,
      isSystem: true,
      isDefault: true,
      sortOrder: 0,
    },
    {
      _id: 'cat-2',
      name: 'Реквизиты контрагента',
      slug: 'rekvizity-kontragenta',
      isActive: true,
      isSystem: false,
      isDefault: false,
      sortOrder: 10,
    },
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: API_BASE_URL, useValue: 'http://test/api' },
        TextBlockCategoriesService,
      ],
    });
    service = TestBed.inject(TextBlockCategoriesService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('shares an active-catalog in-flight request and caches its successful result', () => {
    const first: unknown[] = [];
    const second: unknown[] = [];
    service.list({ activeOnly: true }).subscribe((res) => first.push(res));
    service.list({ activeOnly: true }).subscribe((res) => second.push(res));

    const requests = httpMock.match((req) => req.url === 'http://test/api/text-block-categories');
    expect(requests).toHaveLength(1);
    expect(requests[0].request.params.get('activeOnly')).toBe('true');
    requests[0].flush(categories);

    expect(first).toHaveLength(1);
    expect(second).toHaveLength(1);

    service.list({ activeOnly: true }).subscribe((res) => {
      expect(res).toEqual({ ok: true, data: categories });
    });
    expect(
      httpMock.match((req) => req.url === 'http://test/api/text-block-categories'),
    ).toHaveLength(0);
  });

  it('does not cache errors, allowing a later active-catalog call to retry', () => {
    service.list({ activeOnly: true }).subscribe((res) => expect(res.ok).toBe(false));
    httpMock
      .expectOne('http://test/api/text-block-categories?activeOnly=true')
      .flush({ message: 'temporary failure' }, { status: 503, statusText: 'Unavailable' });

    service.list({ activeOnly: true }).subscribe((res) => expect(res.ok).toBe(true));
    httpMock
      .expectOne('http://test/api/text-block-categories?activeOnly=true')
      .flush(categories);
  });

  it('does not cache unfiltered dictionary requests', () => {
    service.list().subscribe();
    service.list().subscribe();
    const requests = httpMock.match((req) => req.url === 'http://test/api/text-block-categories');
    expect(requests).toHaveLength(2);
    requests.forEach((request) => request.flush(categories));
  });

  it('keeps search requests fresh rather than caching administrative results', () => {
    service.list({ activeOnly: true, search: 'рек' }).subscribe();
    service.list({ activeOnly: true, search: 'рек' }).subscribe();
    const requests = httpMock.match((req) => req.url === 'http://test/api/text-block-categories');
    expect(requests).toHaveLength(2);
    expect(requests[0].request.params.get('activeOnly')).toBe('true');
    expect(requests[0].request.params.get('search')).toBe('рек');
    requests.forEach((request) => request.flush(categories));
  });

  it('invalidates the active catalog after a successful create', () => {
    service.list({ activeOnly: true }).subscribe();
    httpMock
      .expectOne('http://test/api/text-block-categories?activeOnly=true')
      .flush(categories);

    service.create({ name: 'Новая категория' }).subscribe((res) => expect(res.ok).toBe(true));
    const create = httpMock.expectOne('http://test/api/text-block-categories');
    expect(create.request.method).toBe('POST');
    expect(create.request.body).toEqual({ name: 'Новая категория' });
    create.flush({ ...categories[1], _id: 'cat-3', name: 'Новая категория' });

    service.list({ activeOnly: true }).subscribe();
    const refreshed = httpMock.expectOne('http://test/api/text-block-categories?activeOnly=true');
    expect(refreshed.request.method).toBe('GET');
    refreshed.flush(categories);
  });

  it.each([
    ['update', () => service.update('cat-2', { name: 'Переименовано' }), 'PATCH'],
    ['remove', () => service.remove('cat-2'), 'DELETE'],
  ])('invalidates the active catalog after a successful %s', (_label, mutation, method) => {
    service.list({ activeOnly: true }).subscribe();
    httpMock
      .expectOne('http://test/api/text-block-categories?activeOnly=true')
      .flush(categories);

    mutation().subscribe((res) => expect(res.ok).toBe(true));
    const request = httpMock.expectOne('http://test/api/text-block-categories/cat-2');
    expect(request.request.method).toBe(method);
    request.flush(method === 'DELETE' ? null : { ...categories[1], name: 'Переименовано' });

    service.list({ activeOnly: true }).subscribe();
    const refreshed = httpMock.expectOne('http://test/api/text-block-categories?activeOnly=true');
    expect(refreshed.request.method).toBe('GET');
    refreshed.flush(categories);
  });

  it('does not let an old in-flight response repopulate the cache after a mutation', () => {
    service.list({ activeOnly: true }).subscribe();
    const oldRequest = httpMock.expectOne('http://test/api/text-block-categories?activeOnly=true');

    service
      .update('cat-2', { name: 'Переименовано' })
      .subscribe((res) => expect(res.ok).toBe(true));
    const update = httpMock.expectOne('http://test/api/text-block-categories/cat-2');
    update.flush({ ...categories[1], name: 'Переименовано' });

    service.list({ activeOnly: true }).subscribe();
    const freshRequest = httpMock.expectOne('http://test/api/text-block-categories?activeOnly=true');
    expect(freshRequest).not.toBe(oldRequest);

    oldRequest.flush(categories);
    freshRequest.flush([{ ...categories[1], name: 'Переименовано' }]);

    service.list({ activeOnly: true }).subscribe((res) => {
      expect(res).toEqual({ ok: true, data: [{ ...categories[1], name: 'Переименовано' }] });
    });
    expect(
      httpMock.match((req) => req.url === 'http://test/api/text-block-categories'),
    ).toHaveLength(0);
  });

  it('keeps the active catalog after a failed mutation', () => {
    service.list({ activeOnly: true }).subscribe();
    httpMock
      .expectOne('http://test/api/text-block-categories?activeOnly=true')
      .flush(categories);

    service.update('cat-2', { name: 'Ошибка' }).subscribe((res) => expect(res.ok).toBe(false));
    httpMock
      .expectOne('http://test/api/text-block-categories/cat-2')
      .flush({ message: 'conflict' }, { status: 409, statusText: 'Conflict' });

    service.list({ activeOnly: true }).subscribe((res) => expect(res.ok).toBe(true));
    expect(
      httpMock.match((req) => req.url === 'http://test/api/text-block-categories'),
    ).toHaveLength(0);
  });

  it('findById GETs a single category', () => {
    service.findById('cat-1').subscribe((res) => {
      expect(res).toEqual({ ok: true, data: categories[0] });
    });
    const req = httpMock.expectOne('http://test/api/text-block-categories/cat-1');
    expect(req.request.method).toBe('GET');
    req.flush(categories[0]);
  });

  it('surfaces a 409 duplicate-slug error from create', () => {
    service.create({ name: 'Дубликат' }).subscribe((res) => {
      expect(res.ok).toBe(false);
      if (!res.ok) expect(res.error.status).toBe(409);
    });
    httpMock
      .expectOne('http://test/api/text-block-categories')
      .flush({ message: 'Категория с ключом «duplikat» уже существует в этой области' }, {
        status: 409,
        statusText: 'Conflict',
      });
  });

  it('surfaces a 403 IDOR error from update', () => {
    service.update('cat-2', { name: 'Чужое' }).subscribe((res) => {
      expect(res.ok).toBe(false);
      if (!res.ok) expect(res.error.status).toBe(403);
    });
    httpMock
      .expectOne('http://test/api/text-block-categories/cat-2')
      .flush({ message: 'Категория «Реквизиты» принадлежит другой организации' }, {
        status: 403,
        statusText: 'Forbidden',
      });
  });

  it('surfaces a 404 missing-category error from findById', () => {
    service.findById('missing').subscribe((res) => {
      expect(res.ok).toBe(false);
      if (!res.ok) expect(res.error.status).toBe(404);
    });
    httpMock
      .expectOne('http://test/api/text-block-categories/missing')
      .flush({ message: 'TextBlockCategory missing not found' }, {
        status: 404,
        statusText: 'Not Found',
      });
  });

  it('surfaces a 409 in-use error from remove', () => {
    service.remove('cat-2').subscribe((res) => {
      expect(res.ok).toBe(false);
      if (!res.ok) expect(res.error.status).toBe(409);
    });
    httpMock
      .expectOne('http://test/api/text-block-categories/cat-2')
      .flush({ message: 'Категорию «Реквизиты» используют 3 блоков — удаление невозможно' }, {
        status: 409,
        statusText: 'Conflict',
      });
  });
});
