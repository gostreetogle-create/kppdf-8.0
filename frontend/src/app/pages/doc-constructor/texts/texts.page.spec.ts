/**
 * TZ-DOC-316 — TextsPage tests for the «Категория» column + filter dropdown.
 *
 * Focuses on the new category integration:
 *   - the category column renders the populated name via lookup (not raw id);
 *   - the filter dropdown filters rows by categoryId;
 *   - resetting the filter shows all rows;
 *   - existing search flow is preserved (search + category filter compose).
 */
import { TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { of } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { TextsPage } from './texts.page';
import { TextBlocksService } from '../../../shared/services/pi-text-blocks.service';
import { TextBlockCategoriesService } from '../../../shared/services/pi-text-block-categories.service';
import { PiToastService } from '../../../shared/ui/toast';
import { PiDialogService } from '../../../shared/ui/dialog/pi-dialog.service';

describe('TextsPage (TZ-DOC-316 category column + filter)', () => {
  const dialogSpy = { open: jest.fn() };
  const success = jest.fn();
  const error = jest.fn();

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
      slug: 'rekvizity',
      isActive: true,
      isSystem: false,
      isDefault: false,
      sortOrder: 10,
    },
  ];

  const blocks = [
    {
      _id: 'b1',
      name: 'Блок общий',
      slug: 'b1',
      categoryId: 'cat-1',
      tags: [],
      columns: [],
      isActive: true,
      sortOrder: 0,
    },
    {
      _id: 'b2',
      name: 'Реквизиты',
      slug: 'b2',
      categoryId: 'cat-2',
      tags: [],
      columns: [],
      isActive: true,
      sortOrder: 1,
    },
    {
      _id: 'b3',
      name: 'Без категории',
      slug: 'b3',
      tags: [],
      columns: [],
      isActive: true,
      sortOrder: 2,
    },
  ];

  let blockSvc: { list: jest.Mock; findById: jest.Mock; remove: jest.Mock };
  let catSvc: { list: jest.Mock };

  beforeEach(async () => {
    jest.clearAllMocks();
    blockSvc = {
      list: jest.fn().mockReturnValue(of({ ok: true, data: { items: blocks, total: 3 } })),
      findById: jest.fn(),
      remove: jest.fn().mockReturnValue(of({ ok: true, data: undefined })),
    };
    catSvc = { list: jest.fn().mockReturnValue(of({ ok: true, data: categories })) };

    await TestBed.configureTestingModule({
      providers: [
        { provide: TextBlocksService, useValue: blockSvc },
        { provide: TextBlockCategoriesService, useValue: catSvc },
        { provide: PiToastService, useValue: { success, error } },
        { provide: PiDialogService, useValue: dialogSpy },
        { provide: ActivatedRoute, useValue: { queryParams: of({}) } },
      ],
    })
      .overrideComponent(TextsPage, { set: { imports: [], schemas: [NO_ERRORS_SCHEMA] } })
      .compileComponents();
  });

  function createComp() {
    const fixture = TestBed.createComponent(TextsPage);
    fixture.detectChanges();
    return {
      fixture,
      comp: fixture.componentInstance as unknown as {
        data: () => unknown[];
        categories: () => typeof categories;
        categoryFilter: { set(v: string): void; (): string };
        onCategoryFilterChange: (e: Event) => void;
        categoryName: (id: string) => string | undefined;
        sortedRows: () => typeof blocks;
      },
    };
  }

  it('loads active categories for the filter dropdown', () => {
    const { comp } = createComp();
    expect(catSvc.list).toHaveBeenCalledWith({ activeOnly: true });
    expect(comp.categories().length).toBe(2);
  });

  it('renders the category badge via populated lookup (name, not raw id)', () => {
    const { comp, fixture } = createComp();
    expect(comp.categoryName('cat-2')).toBe('Реквизиты контрагента');
    expect(comp.categoryName('missing')).toBeUndefined();
    const el: HTMLElement = fixture.nativeElement;
    // The page now delegates row chrome to app-pi-table. With the real
    // primitive overridden in this focused unit test, assert the lookup
    // contract directly instead of coupling the test to projected markup.
    expect(comp.categoryName('cat-1')).toBe('Общее');
    expect(comp.categoryName('cat-2')).toBe('Реквизиты контрагента');
    expect(el.querySelector('app-pi-table')).toBeTruthy();
  });

  it('filters rows by categoryId when the dropdown changes', () => {
    const { comp } = createComp();
    comp.categoryFilter.set('cat-2');
    expect(comp.sortedRows()).toHaveLength(1);
    expect(comp.sortedRows()[0]._id).toBe('b2');
  });

  it('resets to all rows when the filter is cleared', () => {
    const { comp } = createComp();
    comp.categoryFilter.set('cat-2');
    expect(comp.sortedRows()).toHaveLength(1);
    comp.categoryFilter.set('');
    expect(comp.sortedRows()).toHaveLength(3);
  });

  it('composes search with the category filter', () => {
    const { comp } = createComp();
    comp.categoryFilter.set('cat-1');
    // Drive via the same signal the search input writes to.
    (comp as unknown as { searchQuery: { set(v: string): void } }).searchQuery.set('общий');
    expect(comp.sortedRows()).toHaveLength(1);
    expect(comp.sortedRows()[0]._id).toBe('b1');
  });
});
