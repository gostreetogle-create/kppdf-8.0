import { TestBed } from '@angular/core/testing';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';

import { TablesPage } from './tables.page';
import {
  TableTemplatesService,
  TableTemplate,
} from '../../../shared/services/pi-table-templates.service';
import { PiToastService } from '../../../shared/ui/toast';
import { PiDialogService } from '../../../shared/ui/dialog/pi-dialog.service';
import { API_BASE_URL } from '../../../core/api.tokens';

describe('TablesPage', () => {
  let httpMock: HttpTestingController;
  const baseUrl = '/api';
  const dialogSpy = { open: jest.fn().mockReturnValue({}) };
  const listUrl = `${baseUrl}/table-templates`;
  const matchListGet = (r: { url: string; method: string }): boolean =>
    r.url.startsWith(listUrl) && r.method === 'GET';

  async function tickMicrotask(): Promise<void> {
    await new Promise<void>((r) => setTimeout(r, 0));
  }

  const fakeTemplates: TableTemplate[] = [
    {
      _id: 'tt1',
      name: 'Спецификация товаров',
      category: 'product-spec',
      sortOrder: 0,
      columns: [{ key: 'name', label: 'Наименование', type: 'text', width: 200, align: 'left' }],
      isActive: true,
    } as TableTemplate,
    {
      _id: 'tt2',
      name: 'Калькуляция',
      category: 'cost-calc',
      sortOrder: 1,
      columns: [{ key: 'item', label: 'Статья', type: 'text', width: 200, align: 'left' }],
      isActive: false,
    } as TableTemplate,
  ];

  beforeEach(async () => {
    dialogSpy.open.mockClear();
    await TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([]), withFetch()),
        provideHttpClientTesting(),
        { provide: API_BASE_URL, useValue: baseUrl },
        {
          provide: TableTemplatesService,
          useValue: {
            list: jest.fn().mockReturnValue({
              subscribe: (cb: (r: { ok: boolean; data: { items: TableTemplate[] } }) => void) =>
                cb({ ok: true, data: { items: fakeTemplates } }),
            }),
            create: jest.fn().mockReturnValue({
              subscribe: (cb: (r: { ok: boolean; data: { _id: string } }) => void) =>
                cb({ ok: true, data: { _id: 'tt3' } }),
            }),
            update: jest.fn().mockReturnValue({
              subscribe: (cb: (r: { ok: boolean }) => void) => cb({ ok: true }),
            }),
            remove: jest.fn().mockReturnValue({
              subscribe: (cb: (r: { ok: boolean }) => void) => cb({ ok: true }),
            }),
          },
        },
        { provide: PiToastService, useValue: { success: () => {}, error: () => {} } },
        { provide: PiDialogService, useValue: dialogSpy },
      ],
    })
      .overrideComponent(TablesPage, {
        set: { imports: [], schemas: [NO_ERRORS_SCHEMA] },
      })
      .compileComponents();

    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('creates successfully', async () => {
    const fixture = TestBed.createComponent(TablesPage);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('loads table templates on creation via httpResource', async () => {
    const fixture = TestBed.createComponent(TablesPage);
    fixture.detectChanges();

    httpMock.expectOne(matchListGet).flush(fakeTemplates);
    await tickMicrotask();
    fixture.detectChanges();

    const comp = fixture.componentInstance as unknown as {
      data: () => TableTemplate[];
      loading: () => boolean;
    };

    expect(comp.data().length).toBe(2);
    expect(comp.loading()).toBe(false);
  });

  it('shows loading state initially', async () => {
    const fixture = TestBed.createComponent(TablesPage);
    const comp = fixture.componentInstance as unknown as { loading: () => boolean };
    expect(comp.loading()).toBe(true);
  });

  it('filters templates by search query', async () => {
    const fixture = TestBed.createComponent(TablesPage);
    fixture.detectChanges();

    httpMock.expectOne(matchListGet).flush(fakeTemplates);
    await tickMicrotask();
    fixture.detectChanges();

    const comp = fixture.componentInstance as unknown as {
      searchQuery: { set: (v: string) => void };
      sortedRows: () => { _id: string; name: string }[];
    };

    comp.searchQuery.set('Спецификация');
    fixture.detectChanges();

    const filtered = comp.sortedRows();
    expect(filtered.length).toBe(1);
    expect(filtered[0].name).toBe('Спецификация товаров');
  });

  it('returns all when search is cleared', async () => {
    const fixture = TestBed.createComponent(TablesPage);
    fixture.detectChanges();

    httpMock.expectOne(matchListGet).flush(fakeTemplates);
    await tickMicrotask();
    fixture.detectChanges();

    const comp = fixture.componentInstance as unknown as {
      searchQuery: { set: (v: string) => void };
      sortedRows: () => { _id: string }[];
    };

    comp.searchQuery.set('Спецификация');
    comp.searchQuery.set('');
    fixture.detectChanges();

    expect(comp.sortedRows().length).toBe(2);
  });

  it('create button triggers openCreate', async () => {
    const fixture = TestBed.createComponent(TablesPage);
    fixture.detectChanges();

    httpMock.expectOne(matchListGet).flush([]);
    await tickMicrotask();
    fixture.detectChanges();

    const comp = fixture.componentInstance as unknown as { openCreate: () => void };
    comp.openCreate();
    expect(dialogSpy.open).toHaveBeenCalled();
  });
});
