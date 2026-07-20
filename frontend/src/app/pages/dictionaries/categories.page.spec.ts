import { TestBed } from '@angular/core/testing';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';

import { CategoriesPage } from './categories.page';
import { CategoryTreeNode } from '../../shared/services/categories.service';
import { PiDialogService } from '../../shared/ui/dialog/pi-dialog.service';
import { PiToastService } from '../../shared/ui/toast';
import { API_BASE_URL } from '../../core/api.tokens';

describe('CategoriesPage', () => {
  let httpMock: HttpTestingController;
  const baseUrl = '/api';
  const treeUrl = `${baseUrl}/categories/tree`;

  const fakeTree: CategoryTreeNode[] = [
    {
      _id: 'c1',
      name: 'Металлы',
      slug: 'metals',
      type: 'material',
      skuPrefix: 'MET',
      sortOrder: 1,
      isActive: true,
      children: [
        {
          _id: 'c1-1',
          name: 'Сталь',
          slug: 'steel',
          type: 'material',
          skuPrefix: 'STL',
          sortOrder: 1,
          isActive: true,
          children: [],
        },
      ],
    },
    {
      _id: 'c2',
      name: 'Пластик',
      slug: 'plastic',
      type: 'material',
      skuPrefix: 'PLS',
      sortOrder: 2,
      isActive: true,
      children: [],
    },
  ];

  const matchTreeGet = (r: { url: string; method: string }): boolean =>
    r.url === treeUrl && r.method === 'GET';

  async function tickMicrotask(): Promise<void> {
    await new Promise<void>((r) => setTimeout(r, 0));
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([]), withFetch()),
        provideHttpClientTesting(),
        { provide: API_BASE_URL, useValue: baseUrl },
        { provide: PiDialogService, useValue: { open: () => ({}) as never } },
        { provide: PiToastService, useValue: { success: () => {}, error: () => {} } },
      ],
    })
      .overrideComponent(CategoriesPage, {
        set: { imports: [], schemas: [NO_ERRORS_SCHEMA] },
      })
      .compileComponents();

    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('fires an initial GET /api/categories/tree on creation', async () => {
    const fixture = TestBed.createComponent(CategoriesPage);
    fixture.detectChanges();
    TestBed.flushEffects();

    const req = httpMock.expectOne(matchTreeGet);
    expect(req.request.method).toBe('GET');

    req.flush(fakeTree);
    await tickMicrotask();
    TestBed.flushEffects();
    fixture.detectChanges();

    const comp = fixture.componentInstance as unknown as {
      allTreeData: () => CategoryTreeNode[];
      loading: () => boolean;
      error: () => string | null;
    };

    expect(comp.allTreeData().length).toBe(2);
    expect(comp.loading()).toBe(false);
    expect(comp.error()).toBeNull();
  });

  it('surfaces error() when the initial fetch fails', async () => {
    const fixture = TestBed.createComponent(CategoriesPage);
    fixture.detectChanges();
    TestBed.flushEffects();

    httpMock.expectOne(matchTreeGet).flush('Server Error', {
      status: 500,
      statusText: 'Internal Server Error',
    });
    await tickMicrotask();

    const comp = fixture.componentInstance as unknown as {
      error: () => string | null;
      loading: () => boolean;
    };

    expect(comp.error()).toBeTruthy();
    expect(comp.loading()).toBe(false);
  });

  it('filters tree data client-side when search changes', async () => {
    const fixture = TestBed.createComponent(CategoriesPage);
    fixture.detectChanges();
    TestBed.flushEffects();

    httpMock.expectOne(matchTreeGet).flush(fakeTree);
    await tickMicrotask();
    TestBed.flushEffects();
    fixture.detectChanges();

    const comp = fixture.componentInstance as unknown as {
      allTreeData: () => CategoryTreeNode[];
      search: { debouncedSearch: { set(v: string): void } };
    };

    expect(comp.allTreeData().length).toBe(2);

    comp.search.debouncedSearch.set('сталь');
    fixture.detectChanges();

    const treeData = (comp as unknown as { treeData: () => CategoryTreeNode[] }).treeData();
    const flatNames = flattenNames(treeData);
    expect(flatNames).toContain('Сталь');
  });

  it('returns all data when search is cleared', async () => {
    const fixture = TestBed.createComponent(CategoriesPage);
    fixture.detectChanges();
    TestBed.flushEffects();

    httpMock.expectOne(matchTreeGet).flush(fakeTree);
    await tickMicrotask();
    TestBed.flushEffects();
    fixture.detectChanges();

    const comp = fixture.componentInstance as unknown as {
      allTreeData: () => CategoryTreeNode[];
      search: { debouncedSearch: { set(v: string): void } };
    };

    comp.search.debouncedSearch.set('сталь');
    fixture.detectChanges();

    comp.search.debouncedSearch.set('');
    fixture.detectChanges();

    expect(comp.allTreeData().length).toBe(2);
  });
});

function flattenNames(nodes: CategoryTreeNode[]): string[] {
  const result: string[] = [];
  for (const n of nodes) {
    result.push(n.name);
    if (n.children) result.push(...flattenNames(n.children));
  }
  return result;
}
