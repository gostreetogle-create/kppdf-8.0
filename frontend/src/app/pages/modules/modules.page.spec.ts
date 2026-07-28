import { TestBed } from '@angular/core/testing';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { of } from 'rxjs';

import { ModulesPage } from './modules.page';
import {
  ProductModulesService,
  ProductModule,
} from '../../shared/services/pi-product-modules.service';
import { PiDialogService } from '../../shared/ui/dialog/pi-dialog.service';
import { PiToastService } from '../../shared/ui/toast';
import { API_BASE_URL } from '../../core/api.tokens';

/**
 * TZ-232.E warmup #3 spec v2 — ModulesPage migrated to <pi-entity-list>
 * via Approach D (hybrid adapter pattern).
 *
 * Spec fixes applied:
 *  1. **`Router` imported at top** (was `require('@angular/router')` which
 *     breaks in Jest ESM runtime). Provides `{navigate: jest.fn()}`.
 *  2. **Removed `imports: []`** from `overrideComponent` — clearing
 *     imports stripped the `PiEntityListComponent` from the page's
 *     template, which broke `viewChild('list')` resolution and caused
 *     `this.listRef(...)?.reload is not a function` errors in the
 *     effect. Keep page's real imports; rely on `NO_ERRORS_SCHEMA`
 *     for unknown template sub-elements (the dialog form etc.).
 */
describe('ModulesPage', () => {
  let httpMock: HttpTestingController;
  const baseUrl = '/api';
  const listUrl = `${baseUrl}/modules`;
  const dialogSpy = { open: jest.fn().mockReturnValue({}) };
  const routerSpy = { navigate: jest.fn().mockResolvedValue(true) };

  const fakeModules: ProductModule[] = [
    { _id: 'pm1', name: 'Корпус шкафа', article: 'KW-001' } as ProductModule,
    { _id: 'pm2', name: 'Дверца', article: 'DW-001' } as ProductModule,
    { _id: 'pm3', name: 'Полка', article: 'SH-001' } as ProductModule,
  ];

  const matchListGet = (r: { url: string; method: string }): boolean =>
    r.url === listUrl && r.method === 'GET';

  async function tickMicrotask(): Promise<void> {
    await new Promise<void>((r) => setTimeout(r, 0));
  }

  beforeEach(async () => {
    dialogSpy.open.mockClear();
    routerSpy.navigate.mockClear();
    await TestBed.configureTestingModule({
      imports: [ModulesPage],
      providers: [
        provideHttpClient(withInterceptors([]), withFetch()),
        provideHttpClientTesting(),
        { provide: API_BASE_URL, useValue: baseUrl },
        {
          provide: ProductModulesService,
          useValue: {
            list: () => of({ ok: true, data: [] }),
            findById: () => of({ ok: true, data: {} as never }),
            create: () => of({ ok: true, data: {} as never }),
            update: () => of({ ok: true, data: {} as never }),
            remove: () => of({ ok: true, data: undefined }),
          },
        },
        { provide: PiDialogService, useValue: dialogSpy },
        { provide: PiToastService, useValue: { success: () => {}, error: () => {} } },
        { provide: Router, useValue: routerSpy },
      ],
    })
      .overrideComponent(ModulesPage, {
        set: { schemas: [NO_ERRORS_SCHEMA] },
      })
      .compileComponents();

    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('fires an initial GET /api/modules on creation', async () => {
    const fixture = TestBed.createComponent(ModulesPage);
    fixture.detectChanges();

    httpMock.expectOne(matchListGet).flush(fakeModules);
    await tickMicrotask();
    fixture.detectChanges();

    const comp = fixture.componentInstance as unknown as {
      data: () => ProductModule[];
    };

    expect(comp.data().length).toBe(3);
  });

  it('localAdapter.list() returns {items, total} shape sliced from sortedRows', async () => {
    const fixture = TestBed.createComponent(ModulesPage);
    fixture.detectChanges();

    httpMock.expectOne(matchListGet).flush(fakeModules);
    await tickMicrotask();
    fixture.detectChanges();

    const comp = fixture.componentInstance as unknown as {
      localAdapter: {
        list: (params: { page: number; limit: number }) => {
          subscribe: (
            fn: (res: {
              ok: boolean;
              data: { items: ProductModule[]; total: number };
            }) => void,
          ) => void;
        };
      };
    };

    // Page 1 of size 2 → first two modules (alphabetical asc: Дверца, Корпус шкафа)
    comp.localAdapter.list({ page: 1, limit: 2 }).subscribe((res) => {
      expect(res.ok).toBe(true);
      expect(res.data.items.length).toBe(2);
      expect(res.data.total).toBe(3);
      if (res.data.items[0] && res.data.items[1]) {
        expect(res.data.items[0].name).toBe('Дверца');
        expect(res.data.items[1].name).toBe('Корпус шкафа');
      }
    });

    // Page 2 of size 2 → last module only
    comp.localAdapter.list({ page: 2, limit: 2 }).subscribe((res) => {
      expect(res.data.items.length).toBe(1);
      expect(res.data.total).toBe(3);
      expect(res.data.items[0]?.name).toBe('Полка');
    });
  });

  it('onSortChange updates sortKeySig/sortDirSig', async () => {
    const fixture = TestBed.createComponent(ModulesPage);
    fixture.detectChanges();

    httpMock.expectOne(matchListGet).flush(fakeModules);
    await tickMicrotask();
    fixture.detectChanges();

    const comp = fixture.componentInstance as unknown as {
      onSortChange: (event: { key: string; dir: 'asc' | 'desc' | null }) => void;
      sortedRows: () => ProductModule[];
    };

    // Sort by article desc
    comp.onSortChange({ key: 'article', dir: 'desc' });
    fixture.detectChanges();

    const rows = comp.sortedRows();
    expect(rows[0]?.article).toBe('SH-001'); // SH > KW > DW
    expect(rows[2]?.article).toBe('DW-001');

    // Clear sort
    comp.onSortChange({ key: 'name', dir: null });
    fixture.detectChanges();
    expect(comp.sortedRows().length).toBe(3);
  });

  it('search query filters rows by name OR article', async () => {
    const fixture = TestBed.createComponent(ModulesPage);
    fixture.detectChanges();

    httpMock.expectOne(matchListGet).flush(fakeModules);
    await tickMicrotask();
    fixture.detectChanges();

    const comp = fixture.componentInstance as unknown as {
      onSearchInput: (event: { target: { value: string } }) => void;
      filteredRows: () => ProductModule[];
    };

    // Search by article "KW"
    comp.onSearchInput({ target: { value: 'KW' } });
    await new Promise<void>((r) => setTimeout(r, 350));
    fixture.detectChanges();

    const filtered = comp.filteredRows();
    expect(filtered.length).toBe(1);
    expect(filtered[0]?.name).toBe('Корпус шкафа');
  });

  it('row click routes to /modules/:id', async () => {
    const fixture = TestBed.createComponent(ModulesPage);
    fixture.detectChanges();

    httpMock.expectOne(matchListGet).flush(fakeModules);
    await tickMicrotask();
    fixture.detectChanges();

    const comp = fixture.componentInstance as unknown as {
      onRowClick: (row: ProductModule) => void;
    };

    comp.onRowClick(fakeModules[0]!);
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/modules', 'pm1']);
  });

  it('create button triggers openCreate', async () => {
    const fixture = TestBed.createComponent(ModulesPage);
    fixture.detectChanges();

    httpMock.expectOne(matchListGet).flush([]);
    await tickMicrotask();
    fixture.detectChanges();

    const comp = fixture.componentInstance as unknown as { openCreate: () => void };
    comp.openCreate();
    expect(dialogSpy.open).toHaveBeenCalled();
  });
});