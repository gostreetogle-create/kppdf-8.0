import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { API_BASE_URL } from '../../core/api.tokens';
import { DocTypesService } from './doc-types.service';

/**
 * TZ-232.F — DocTypesService unit tests.
 *
 * Mirrors `organizations.service.spec.ts` style. Backend `doc-type.service.ts`
 * returns a FLAT array from `findAll()` (no pagination), so the canonical
 * envelope `{items, total, page, limit}` is SYNTHESIZED client-side via a
 * `map` operator (verified by the first spec).
 */
describe('DocTypesService', () => {
  let svc: DocTypesService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: API_BASE_URL, useValue: 'http://test/api' },
        DocTypesService,
      ],
    });
    svc = TestBed.inject(DocTypesService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('list() wraps flat array into {items, total, page, limit} envelope', () => {
    svc.list().subscribe((res) => {
      if (res.ok) {
        expect(res.data.items.length).toBe(3);
        expect(res.data.total).toBe(3);
        expect(res.data.page).toBe(1);
        expect(res.data.limit).toBe(3);
        expect(res.data.items[0].slug).toBe('kp');
      }
    });
    const req = httpMock.expectOne('http://test/api/doc-types');
    expect(req.request.method).toBe('GET');
    req.flush([
      { _id: 'dt1', name: 'КП', slug: 'kp', isActive: true },
      { _id: 'dt2', name: 'Договор', slug: 'contract', isActive: true },
      { _id: 'dt3', name: 'Акт', slug: 'act', isActive: true },
    ]);
  });

  it('list() returns ok:false when backend returns 500', () => {
    svc.list().subscribe((res) => {
      expect(res.ok).toBe(false);
      if (!res.ok) {
        expect(res.error.status).toBe(500);
      }
    });
    const req = httpMock.expectOne('http://test/api/doc-types');
    req.flush('Backend failure', { status: 500, statusText: 'Server Error' });
  });

  it('create() POSTs payload with name + slug body', () => {
    svc.create({ name: 'Новый тип', slug: 'newtype', isActive: true } as never)
      .subscribe((res) => {
        if (res.ok) {
          expect(res.data.slug).toBe('newtype');
          expect(res.data.name).toBe('Новый тип');
        }
      });
    const req = httpMock.expectOne('http://test/api/doc-types');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({
      name: 'Новый тип',
      slug: 'newtype',
      isActive: true,
    });
    req.flush({ _id: 'dt4', name: 'Новый тип', slug: 'newtype', isActive: true });
  });

  it('remove() DELETEs /api/doc-types/:id', () => {
    svc.remove('dt1').subscribe((res) => {
      if (res.ok) expect(res.data).toBeUndefined();
    });
    const req = httpMock.expectOne('http://test/api/doc-types/dt1');
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });
});
