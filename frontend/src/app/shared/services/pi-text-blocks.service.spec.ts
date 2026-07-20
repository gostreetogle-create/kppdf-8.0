import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { API_BASE_URL } from '../../core/api.tokens';
import { TextBlocksService } from './pi-text-blocks.service';

/**
 * TZ-86 Phase B.5 — TextBlocksService unit tests.
 *
 * Smoke: list() maps raw array → { items, total } envelope.
 *        activeOnly filter applied client-side per service contract.
 *        create() POSTs body and returns TextBlock on 2xx.
 *
 * Pattern mirrors pi-work-types.service.spec.ts (TZ-83 precedent).
 */
describe('TextBlocksService', () => {
  let svc: TextBlocksService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: API_BASE_URL, useValue: 'http://test/api' },
        TextBlocksService,
      ],
    });
    svc = TestBed.inject(TextBlocksService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('list() wraps raw array as { items, total } envelope', () => {
    svc.list().subscribe((res) => {
      if (res.ok) {
        expect(res.data.items.length).toBe(2);
        expect(res.data.total).toBe(2);
        expect(res.data.items[0].name).toBe('Стандартные условия');
        expect(res.data.items[1].isActive).toBe(false);
      }
    });
    const req = httpMock.expectOne('http://test/api/text-blocks');
    expect(req.request.method).toBe('GET');
    req.flush([
      {
        _id: 'tb1',
        name: 'Стандартные условия',
        slug: 'standartnye-usloviya',
        category: 'legal',
        tags: [],
        content: '# Условия',
        isActive: true,
        sortOrder: 0,
      },
      {
        _id: 'tb2',
        name: 'Архивный текст',
        slug: 'arhivnyj-tekst',
        category: 'custom',
        tags: [],
        content: '# Старое',
        isActive: false,
        sortOrder: 99,
      },
    ]);
  });

  it('list({activeOnly: true}) filters out isActive=false client-side', () => {
    svc.list({ activeOnly: true }).subscribe((res) => {
      if (res.ok) {
        expect(res.data.items.length).toBe(1);
        expect(res.data.items[0].name).toBe('Стандартные условия');
        expect(res.data.total).toBe(1);
      }
    });
    const req = httpMock.expectOne('http://test/api/text-blocks?activeOnly=true');
    req.flush([
      {
        _id: 'tb1',
        name: 'Стандартные условия',
        slug: 'standartnye-usloviya',
        category: 'legal',
        tags: [],
        content: '# Условия',
        isActive: true,
        sortOrder: 0,
      },
      {
        _id: 'tb2',
        name: 'Архивный текст',
        slug: 'arhivnyj-tekst',
        category: 'custom',
        tags: [],
        content: '# Старое',
        isActive: false,
        sortOrder: 99,
      },
    ]);
  });

  it('create() POSTs body and returns TextBlock on 2xx', () => {
    svc
      .create({ name: 'Реквизиты сторон', category: 'legal', content: '# Реквизиты' } as never)
      .subscribe((res) => {
        if (res.ok) {
          expect(res.data.name).toBe('Реквизиты сторон');
          expect(res.data.category).toBe('legal');
          expect(res.data.slug).toBe('rekvizity-storon');
        }
      });
    const req = httpMock.expectOne('http://test/api/text-blocks');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({
      name: 'Реквизиты сторон',
      category: 'legal',
      content: '# Реквизиты',
    });
    req.flush({
      _id: 'tb3',
      name: 'Реквизиты сторон',
      slug: 'rekvizity-storon',
      category: 'legal',
      tags: [],
      content: '# Реквизиты',
      isActive: true,
      sortOrder: 0,
    });
  });

  it('update() PATCHes body to /:id and returns TextBlock', () => {
    svc
      .update('tb1', { name: 'Обновлённое название', isActive: false } as never)
      .subscribe((res) => {
        if (res.ok) {
          expect(res.data.name).toBe('Обновлённое название');
          expect(res.data.isActive).toBe(false);
        }
      });
    const req = httpMock.expectOne('http://test/api/text-blocks/tb1');
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toEqual({ name: 'Обновлённое название', isActive: false });
    req.flush({
      _id: 'tb1',
      name: 'Обновлённое название',
      slug: 'standartnye-usloviya',
      category: 'legal',
      tags: [],
      content: '# Условия',
      isActive: false,
      sortOrder: 0,
    });
  });

  it('remove() DELETEs /:id', () => {
    svc.remove('tb1').subscribe((res) => {
      if (res.ok) expect(res.data).toBeUndefined();
    });
    const req = httpMock.expectOne('http://test/api/text-blocks/tb1');
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });
});
