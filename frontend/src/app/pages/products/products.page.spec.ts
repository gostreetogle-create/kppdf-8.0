import { TestBed } from '@angular/core/testing';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { Router } from '@angular/router';
import { of } from 'rxjs';

import { ProductsPage } from './products.page';
import { ProductsService } from '../../shared/services/products.service';
import {
  ProductModulesService,
  ProductModule,
} from '../../shared/services/pi-product-modules.service';
import { PiDialogService } from '../../shared/ui/dialog/pi-dialog.service';
import { PiToastService } from '../../shared/ui/toast';
import { API_BASE_URL } from '../../core/api.tokens';

/**
 * TZ-PRODUCTS-304 — ProductsPage expandable-catalog unit spec.
 *
 * The page fetches the product list via `httpResource` (GET /api/products),
 * so the harness uses provideHttpClient + HttpTestingController like
 * modules.page.spec.ts. ProductModulesService is a MUTABLE stub (the same
 * instance flows into DI; tests swap `list` before createComponent —
 * TestBed.overrideProvider after compileComponents() is not allowed).
 *
 * Covered: single-expand toggle, populated productModuleIds render without
 * fetch, lazy module fetch + cache, no-fetch-for-empty, error + retry,
 * module click → navigate, row-actions not expanding.
 */
describe('ProductsPage', () => {
  let httpMock: HttpTestingController;
  let routerSpy: { navigate: jest.Mock };
  let modulesList: jest.Mock;
  const baseUrl = '/api';
  const listUrl = `${baseUrl}/products`;

  const fakeProducts = [
    {
      _id: 'p1',
      name: 'Окно ПВХ',
      sku: 'WIN-1',
      kind: 'good',
      unit: 'шт',
      productModuleIds: ['m1', 'm2'],
    },
    {
      _id: 'p2',
      name: 'Дверь металлическая',
      sku: 'DR-1',
      kind: 'good',
      unit: 'шт',
      productModuleIds: [],
    },
  ];

  const fakeModules: ProductModule[] = [
    {
      _id: 'm1',
      name: 'Рама ПВХ',
      article: 'RAM-1',
      materials: [],
      workTypes: [],
    } as ProductModule,
    {
      _id: 'm2',
      name: 'Стеклопакет',
      article: 'GL-1',
      materials: [],
      workTypes: [],
    } as ProductModule,
  ];

  const matchListGet = (r: { url: string; method: string }): boolean =>
    r.url.startsWith(listUrl) && r.method === 'GET';

  async function tickMicrotask(): Promise<void> {
    await new Promise<void>((r) => setTimeout(r, 0));
  }

  beforeEach(async () => {
    routerSpy = { navigate: jest.fn() };
    modulesList = jest.fn(() => of({ ok: true, data: fakeModules }));
    await TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([]), withFetch()),
        provideHttpClientTesting(),
        { provide: API_BASE_URL, useValue: baseUrl },
        { provide: Router, useValue: routerSpy },
        {
          provide: ProductsService,
          useValue: { remove: () => of({ ok: true, data: undefined }) },
        },
        {
          provide: ProductModulesService,
          useValue: {
            list: (pid?: string) => modulesList(pid),
            findById: () => of({ ok: true, data: {} as never }),
            create: () => of({ ok: true, data: {} as never }),
            update: () => of({ ok: true, data: {} as never }),
            remove: () => of({ ok: true, data: undefined }),
            attachToProduct: () => of({ ok: true, data: undefined }),
            detachFromProduct: () => of({ ok: true, data: undefined }),
          },
        },
        { provide: PiDialogService, useValue: { open: () => ({}) } },
        { provide: PiToastService, useValue: { success: () => {}, error: () => {} } },
      ],
    })
      .overrideComponent(ProductsPage, {
        set: { imports: [], schemas: [NO_ERRORS_SCHEMA] },
      })
      .compileComponents();

    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  interface Comp {
    data: () => unknown[];
    expandedId: () => string | null;
    modulesLoading: () => boolean;
    modulesError: () => string | null;
    onRowClick: (row: unknown) => void;
    expandedModules: (row: unknown) => ProductModule[];
    openModule: (m: ProductModule) => void;
    openEdit: (row: unknown) => void;
    openCreate: () => void;
  }

  async function mount(): Promise<{
    fixture: ReturnType<typeof TestBed.createComponent<ProductsPage>>;
    comp: Comp;
  }> {
    const fixture = TestBed.createComponent(ProductsPage);
    fixture.detectChanges();
    httpMock.expectOne(matchListGet).flush({
      items: fakeProducts,
      total: fakeProducts.length,
      page: 1,
      limit: 50,
    });
    await tickMicrotask();
    fixture.detectChanges();
    return {
      fixture,
      comp: fixture.componentInstance as unknown as Comp,
    };
  }

  it('fires an initial GET /api/products and renders rows', async () => {
    const { comp } = await mount();
    expect(comp.data().length).toBe(2);
  });

  it('starts collapsed with no expanded product', async () => {
    const { comp } = await mount();
    expect(comp.expandedId()).toBeNull();
  });

  it('row click expands the product and a second click collapses it', async () => {
    const { comp } = await mount();
    comp.onRowClick(fakeProducts[0]);
    expect(comp.expandedId()).toBe('p1');
    comp.onRowClick(fakeProducts[0]);
    expect(comp.expandedId()).toBeNull();
  });

  it('single-expand: expanding another row collapses the first', async () => {
    const { comp } = await mount();
    comp.onRowClick(fakeProducts[0]);
    expect(comp.expandedId()).toBe('p1');
    comp.onRowClick(fakeProducts[1]);
    expect(comp.expandedId()).toBe('p2');
  });

  it('expandedModules resolves populated productModuleIds (no fetch needed for ids already in row)', async () => {
    const { comp } = await mount();
    const row = { ...fakeProducts[0], productModuleIds: fakeModules };
    const mods = comp.expandedModules(row);
    expect(mods.map((m) => m._id)).toEqual(['m1', 'm2']);
    expect(mods[0].name).toBe('Рама ПВХ');
  });

  it('lazy module fetch: first expand loads modules via ProductModulesService.list', async () => {
    const { comp } = await mount();
    // Simulate the real backend list shape: row carries only module ids.
    comp.onRowClick(fakeProducts[0]);
    await tickMicrotask();
    const mods = comp.expandedModules(fakeProducts[0]);
    expect(mods.map((m) => m._id)).toEqual(['m1', 'm2']);
    expect(modulesList).toHaveBeenCalledWith('p1');
  });

  it('populated productModuleIds expand does NOT fetch and shows no loading', async () => {
    // Backend list() already populates productModuleIds top-level — the
    // panel must render from the row with NO ProductModulesService.list
    // call and NO «Загрузка…» flash (TZ-PRODUCTS-304 requirement (e)).
    const { comp } = await mount();
    const populated = { ...fakeProducts[0], productModuleIds: fakeModules };
    comp.onRowClick(populated);
    expect(comp.expandedId()).toBe('p1');
    expect(comp.modulesLoading()).toBe(false);
    expect(modulesList).not.toHaveBeenCalled();
    expect(comp.expandedModules(populated).map((m) => m._id)).toEqual(['m1', 'm2']);
  });

  it('no module fetch for a product without modules', async () => {
    const { comp } = await mount();
    comp.onRowClick(fakeProducts[1]); // p2 — empty productModuleIds
    expect(comp.expandedId()).toBe('p2');
    expect(comp.modulesLoading()).toBe(false);
    expect(modulesList).not.toHaveBeenCalled();
  });

  it('failed module fetch sets error, clears on collapse, allows retry', async () => {
    modulesList
      .mockReturnValueOnce(of({ ok: false, error: { message: 'boom' } }))
      .mockReturnValueOnce(of({ ok: true, data: fakeModules }));
    const { comp } = await mount();
    comp.onRowClick(fakeProducts[0]); // fetch #1 → error
    await tickMicrotask();
    expect(comp.modulesError()).toBeTruthy();
    expect(comp.modulesLoading()).toBe(false);
    comp.onRowClick(fakeProducts[0]); // collapse (clears error)
    expect(comp.modulesError()).toBeNull();
    comp.onRowClick(fakeProducts[0]); // re-expand → retry #2 → ok
    await tickMicrotask();
    expect(comp.modulesError()).toBeNull();
    expect(comp.expandedModules(fakeProducts[0]).map((m) => m._id)).toEqual(['m1', 'm2']);
  });

  it('module click navigates to the module detail page', async () => {
    const { comp } = await mount();
    comp.openModule(fakeModules[0]);
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/modules', 'm1']);
  });

  it('row-actions (edit) do not change the expanded state', async () => {
    const { comp } = await mount();
    comp.onRowClick(fakeProducts[0]);
    expect(comp.expandedId()).toBe('p1');
    comp.openEdit(fakeProducts[0]);
    expect(comp.expandedId()).toBe('p1'); // unchanged
  });
});
