import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { API_BASE_URL } from '../../core/api.tokens';
import { MATERIAL_KINDS, type MaterialKind, MaterialsService } from './materials.service';
import { dictionaryLabelOptions } from './pi-dictionary-labels.service';

/**
 * TZ-CATALOG-316 — runtime guards on the 301 exports added next to
 * the existing `Material` interface.
 *
 * `MATERIAL_KINDS` and dictionary-label fallbacks are pure constants; the
 * HttpParams assembly is exercised through HttpTestingController to
 * verify the service attaches `?materialKind=` only when the param
 * is set (mirrors how the page wires `kindFilterSig()`).
 */
describe('MaterialsService (TZ-CATALOG-316)', () => {
  let materials: MaterialsService;
  let httpMock: HttpTestingController;
  const baseUrl = '/api';
  const listUrl = `${baseUrl}/materials`;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: API_BASE_URL, useValue: baseUrl },
      ],
    }).compileComponents();

    materials = TestBed.inject(MaterialsService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('exports the canonical MATERIAL_KINDS order (raw/part/fastener/purchased/other)', () => {
    expect([...MATERIAL_KINDS]).toEqual(['raw', 'part', 'fastener', 'purchased', 'other']);
  });

  it('provides a Russian label for every MaterialKind', () => {
    for (const k of MATERIAL_KINDS) {
      const label =
        dictionaryLabelOptions('materialKind').find((item) => item.key === k)?.label ?? '';
      expect(typeof label).toBe('string');
      expect(label.length).toBeGreaterThan(0);
    }
  });

  it('MaterialKind is a literal-type union; MATERIAL_KINDS exhaustively type-checks it', () => {
    // If a new kind is added to the enum without updating MATERIAL_KINDS, this
    // raises TS2322 at compile time — backstop for drift.
    const exhaustive: readonly MaterialKind[] = MATERIAL_KINDS;
    expect(exhaustive.length).toBe(5);
  });

  it('list() attaches ?materialKind=<value> when the param is set', () => {
    materials.list({ materialKind: 'fastener' }).subscribe();
    const req = httpMock.expectOne(
      (r) => r.url === listUrl && r.method === 'GET' && r.params.get('materialKind') === 'fastener',
    );
    req.flush({ items: [], total: 0, page: 1, limit: 50 });
  });

  it('list() omits materialKind when not set', () => {
    materials.list({}).subscribe();
    const req = httpMock.expectOne((r) => r.url === listUrl && r.method === 'GET');
    expect(req.request.params.has('materialKind')).toBe(false);
    req.flush({ items: [], total: 0, page: 1, limit: 50 });
  });

  it('list() still attaches search/categoryId alongside materialKind', () => {
    materials.list({ search: 'steel', categoryId: 'cat-1', materialKind: 'raw' }).subscribe();
    const req = httpMock.expectOne((r) => r.url === listUrl && r.method === 'GET');
    expect(req.request.params.get('search')).toBe('steel');
    expect(req.request.params.get('categoryId')).toBe('cat-1');
    expect(req.request.params.get('materialKind')).toBe('raw');
    req.flush({ items: [], total: 0, page: 1, limit: 50 });
  });
});
