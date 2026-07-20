import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { API_BASE_URL } from '../../core/api.tokens';
import { TableTemplatesService } from './pi-table-templates.service';

/**
 * TZ-86 Phase B.5 — TableTemplatesService unit tests.
 *
 * Smoke: list() wraps raw array, preview() returns text/html string,
 *        create() POSTs body and returns TableTemplate.
 *
 * Pattern mirrors pi-work-types.service.spec.ts (TZ-83 precedent).
 */
describe('TableTemplatesService', () => {
  let svc: TableTemplatesService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: API_BASE_URL, useValue: 'http://test/api' },
        TableTemplatesService,
      ],
    });
    svc = TestBed.inject(TableTemplatesService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('list() wraps raw array as { items, total } envelope', () => {
    svc.list().subscribe((res) => {
      if (res.ok) {
        expect(res.data.items.length).toBe(2);
        expect(res.data.total).toBe(2);
        expect(res.data.items[0].name).toBe('Спецификация товаров');
        expect(res.data.items[0].columns.length).toBe(3);
      }
    });
    const req = httpMock.expectOne('http://test/api/table-templates');
    expect(req.request.method).toBe('GET');
    req.flush([
      {
        _id: 'tt1',
        name: 'Спецификация товаров',
        category: 'product-spec',
        sortOrder: 0,
        columns: [
          { key: 'name', label: 'Наименование', type: 'text', width: 200, align: 'left' },
          { key: 'qty', label: 'Кол-во', type: 'number', width: 80, align: 'right' },
          { key: 'price', label: 'Цена', type: 'currency', width: 120, align: 'right' },
        ],
        isActive: true,
      },
      {
        _id: 'tt2',
        name: 'Калькуляция',
        category: 'cost-calc',
        sortOrder: 1,
        columns: [{ key: 'item', label: 'Статья', type: 'text', width: 200, align: 'left' }],
        isActive: true,
      },
    ]);
  });

  it('list({category: "product-spec"}) passes filter to backend', () => {
    svc.list({ category: 'product-spec' }).subscribe();
    const req = httpMock.expectOne('http://test/api/table-templates?category=product-spec');
    expect(req.request.params.get('category')).toBe('product-spec');
    req.flush([]);
  });

  it('preview() returns text/html string via silentWrap', () => {
    const sampleHtml =
      '<table><thead><tr><th>Наименование</th></tr></thead><tbody></tbody></table>';
    svc.preview('tt1').subscribe((res) => {
      if (res.ok) {
        expect(res.data).toBe(sampleHtml);
      }
    });
    const req = httpMock.expectOne('http://test/api/table-templates/tt1/preview');
    expect(req.request.method).toBe('GET');
    expect(req.request.responseType).toBe('text');
    req.flush(sampleHtml);
  });

  it('create() POSTs body with columns array and returns TableTemplate', () => {
    const payload = {
      name: 'Новая спецификация',
      category: 'product-spec' as const,
      columns: [
        { key: 'sku', label: 'Артикул', type: 'text' as const, width: 100, align: 'left' as const },
      ],
      sampleRows: [['А-001'], ['А-002']],
    };
    svc.create(payload).subscribe((res) => {
      if (res.ok) {
        expect(res.data.name).toBe('Новая спецификация');
        expect(res.data.columns.length).toBe(1);
      }
    });
    const req = httpMock.expectOne('http://test/api/table-templates');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(payload);
    req.flush({ _id: 'tt3', ...payload, sortOrder: 0, isActive: true });
  });
});
