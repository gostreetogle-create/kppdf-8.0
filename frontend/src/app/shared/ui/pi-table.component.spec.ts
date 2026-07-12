import { Component, TemplateRef, ViewChild } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ColumnDef, TableComponent } from './pi-table.component';

/**
 * TZ-104.3 Phase A — pi-table expansion test coverage.
 *
 * Five new describe blocks cover the five additive features:
 *  1. `numeric?: boolean` (existing from TZ-94) — backward-compat sanity
 *  2. `sticky?: 'left' | 'right' | false` — sticky cell classes on <th>/<td>
 *  3. `[rowActions]` TemplateRef input — extra <td data-test="row-actions-cell">
 *  4. Server-side pagination (`total` + `page` + `pageSize` + `(pageChange)`) — pager renders + emits
 *  5. Loading skeleton — `loading=true` swaps data rows for 5 skeleton `<tr>` with `animate-pulse`
 *  6. Empty state — `data=[]` + no `[empty]` content → `<app-pi-empty-state>` rendered with `emptyMessage`
 *
 * Each describe block mounts its own TestHost with minimal props so
 * assertions stay independent and quick (~5ms each on Angular 20).
 */
describe('TableComponent — TZ-104.3 Phase A', () => {
  interface TestRow extends Record<string, unknown> {
    id: string;
    name: string;
    price: number;
  }

  const sampleData: TestRow[] = [
    { id: '1', name: 'Widget', price: 99.99 },
    { id: '2', name: 'Gadget', price: 149.5 },
  ];
  const baseCols: ColumnDef<TestRow>[] = [
    { key: 'name', label: 'Name' },
    { key: 'price', label: 'Price', numeric: true },
  ];

  // ─── Existing TZ-94 numeric tests (preserved — backward compat) ───

  describe('numeric column (TZ-94, regression)', () => {
    @Component({
      standalone: true,
      imports: [TableComponent],
      template: `<app-pi-table [data]="data" [columns]="columns" />`,
    })
    class NumericHost {
      data = sampleData;
      columns = baseCols;
    }

    it('numeric: true adds `tabular-nums` class to <td>', () => {
      const fixture = TestBed.createComponent(NumericHost);
      fixture.detectChanges();
      const firstRowCells = fixture.nativeElement.querySelectorAll(
        'tbody tr:first-child td',
      );
      expect(firstRowCells[1].classList.contains('tabular-nums')).toBe(true);
    });

    it('numeric: false (or omitted) does NOT add `tabular-nums`', () => {
      const fixture = TestBed.createComponent(NumericHost);
      fixture.detectChanges();
      const firstRowCells = fixture.nativeElement.querySelectorAll(
        'tbody tr:first-child td',
      );
      expect(firstRowCells[0].classList.contains('tabular-nums')).toBe(false);
    });
  });

  // ─── TZ-104.3 #1 Sticky cells ─────────────────────────────────────

  describe('sticky cells', () => {
    @Component({
      standalone: true,
      imports: [TableComponent],
      template: `<app-pi-table [data]="data" [columns]="columns" />`,
    })
    class StickyHost {
      data = sampleData;
      columns: ColumnDef<TestRow>[] = [
        { key: 'name', label: 'Name', sticky: 'left' },
        { key: 'price', label: 'Price', sticky: 'right' },
      ];
    }

    it('sticky="left" adds sticky left-0 bg-paper z-10 to <th> and <td>', () => {
      const fixture = TestBed.createComponent(StickyHost);
      fixture.detectChanges();
      const ths = fixture.nativeElement.querySelectorAll('thead th');
      const firstTd = fixture.nativeElement.querySelectorAll(
        'tbody tr:first-child td',
      )[0];
      // Left column: <th> and <td> both get sticky positioning.
      expect(ths[0].classList.contains('sticky')).toBe(true);
      expect(ths[0].classList.contains('left-0')).toBe(true);
      expect(ths[0].classList.contains('bg-paper')).toBe(true);
      expect(ths[0].classList.contains('z-10')).toBe(true);
      expect(firstTd.classList.contains('sticky')).toBe(true);
      expect(firstTd.classList.contains('left-0')).toBe(true);
    });

    it('sticky="right" adds right-0 to the right column', () => {
      const fixture = TestBed.createComponent(StickyHost);
      fixture.detectChanges();
      const rightTd = fixture.nativeElement.querySelectorAll(
        'tbody tr:first-child td',
      )[1];
      expect(rightTd.classList.contains('right-0')).toBe(true);
      expect(rightTd.classList.contains('sticky')).toBe(true);
    });
  });

  // ─── TZ-104.3 #2 Row actions slot ─────────────────────────────────

  describe('row actions slot', () => {
    @Component({
      standalone: true,
      imports: [TableComponent],
      template: `
        <app-pi-table [data]="data" [columns]="columns" [rowActions]="actionsTpl">
          <ng-template #actionsTpl let-row>
            <button type="button" [attr.data-test]="'act-' + row.id" class="pi-icon-btn">
              {{ row.id }}
            </button>
          </ng-template>
        </app-pi-table>
      `,
    })
    class ActionsHost {
      data = sampleData;
      columns = baseCols;
    }

    it('rowActions input adds an extra <td data-test="row-actions-cell"> per row', () => {
      const fixture = TestBed.createComponent(ActionsHost);
      fixture.detectChanges();
      const actionCells = fixture.nativeElement.querySelectorAll(
        'td[data-test="row-actions-cell"]',
      );
      expect(actionCells.length).toBe(2); // one per data row
    });

    it('action template receives the row via $implicit context', () => {
      const fixture = TestBed.createComponent(ActionsHost);
      fixture.detectChanges();
      const firstActionButton = fixture.nativeElement.querySelector(
        'td[data-test="row-actions-cell"] button[data-test="act-1"]',
      );
      expect(firstActionButton).toBeTruthy();
      expect(firstActionButton.textContent.trim()).toBe('1');
    });

    it('action cell click does NOT bubble to row (rowClick not emitted)', () => {
      @Component({
        standalone: true,
        imports: [TableComponent],
        template: `
          <app-pi-table
            [data]="data"
            [columns]="columns"
            [rowActions]="actionsTpl"
            (rowClick)="rowClickCount = rowClickCount + 1"
          >
            <ng-template #actionsTpl let-row>
              <button type="button" [attr.data-test]="'act-' + row.id" class="pi-icon-btn">
                {{ row.id }}
              </button>
            </ng-template>
          </app-pi-table>
        `,
      })
      class StopBubbleHost {
        data = sampleData;
        columns = baseCols;
        rowClickCount = 0;
      }
      const fixture = TestBed.createComponent(StopBubbleHost);
      fixture.detectChanges();
      const actionBtn = fixture.nativeElement.querySelector(
        'button[data-test="act-1"]',
      ) as HTMLButtonElement;
      actionBtn.click();
      const host = fixture.componentInstance as StopBubbleHost;
      // Action cell wrapper has (click)="$event.stopPropagation()" so the
      // click on the inner <button> is stopped at the cell wrapper.
      // Therefore the rowClick output should NOT fire — selecting row
      // data only happens via row body click, not action button clicks.
      expect(host.rowClickCount).toBe(0);
    });
  });

  // ─── TZ-104.3 #3 Server-side pagination ─────────────────────────────

  describe('server-side pagination', () => {
    @Component({
      standalone: true,
      imports: [TableComponent],
      template: `
        <app-pi-table
          [data]="data"
          [columns]="columns"
          [total]="total"
          [page]="page"
          [pageSize]="pageSize"
          (pageChange)="onPageChange($event)"
        />
      `,
    })
    class PagerHost {
      data: TestRow[] = [{ id: '1', name: 'Widget', price: 99.99 }];
      columns = baseCols;
      total = 100;
      page = 1;
      pageSize = 20;
      captured: number[] = [];
      onPageChange(p: number): void {
        this.captured.push(p);
      }
    }

    it('showPager renders when total > pageSize', () => {
      const fixture = TestBed.createComponent(PagerHost);
      fixture.detectChanges();
      const info = fixture.nativeElement.querySelector('[data-test="pager-info"]');
      const prev = fixture.nativeElement.querySelector('[data-test="pager-prev"]');
      const next = fixture.nativeElement.querySelector('[data-test="pager-next"]');
      expect(info).toBeTruthy();
      expect(info.textContent.trim()).toContain('из 100');
      expect(prev).toBeTruthy();
      expect(next).toBeTruthy();
    });

    it('pager hidden when total=0 (default) or total <= pageSize', () => {
      const fixture = TestBed.createComponent(PagerHost);
      (fixture.componentInstance as PagerHost).total = 5;
      fixture.detectChanges();
      const info = fixture.nativeElement.querySelector('[data-test="pager-info"]');
      expect(info).toBeNull();
    });

    it('clicking next emits pageChange with target page', () => {
      const fixture = TestBed.createComponent(PagerHost);
      fixture.detectChanges();
      const next = fixture.nativeElement.querySelector(
        '[data-test="pager-next"]',
      ) as HTMLButtonElement;
      next.click();
      const host = fixture.componentInstance as PagerHost;
      expect(host.captured).toEqual([2]);
    });

    it('clicking prev on page 1 does NOT emit (already at start)', () => {
      const fixture = TestBed.createComponent(PagerHost);
      fixture.detectChanges();
      const prev = fixture.nativeElement.querySelector(
        '[data-test="pager-prev"]',
      ) as HTMLButtonElement;
      prev.click();
      const host = fixture.componentInstance as PagerHost;
      expect(host.captured).toEqual([]);
    });

    it('totalPages = ceil(total/pageSize) and rendered as "{page} / {totalPages}"', () => {
      const fixture = TestBed.createComponent(PagerHost);
      fixture.detectChanges();
      const pageLabel = fixture.nativeElement.querySelector(
        '[data-test="pager-page"]',
      );
      expect(pageLabel.textContent.trim()).toBe('1 / 5');
    });
  });

  // ─── TZ-104.3 #4 Loading skeleton ──────────────────────────────────

  describe('loading skeleton', () => {
    @Component({
      standalone: true,
      imports: [TableComponent],
      template: `<app-pi-table [data]="data" [columns]="columns" [loading]="loading" />`,
    })
    class LoadingHost {
      data = sampleData;
      columns = baseCols;
      loading = false;
    }

    it('loading=true replaces data rows with 5 skeleton rows', () => {
      const fixture = TestBed.createComponent(LoadingHost);
      (fixture.componentInstance as LoadingHost).loading = true;
      fixture.detectChanges();
      const skeletons = fixture.nativeElement.querySelectorAll(
        'tr[data-test="table-skeleton-row"]',
      );
      expect(skeletons.length).toBe(5);
      const dataRows = fixture.nativeElement.querySelectorAll(
        'tbody tr[data-test^="table-row-"]',
      );
      expect(dataRows.length).toBe(0);
    });

    it('skeleton contains animate-pulse on a horizontal bar', () => {
      const fixture = TestBed.createComponent(LoadingHost);
      (fixture.componentInstance as LoadingHost).loading = true;
      fixture.detectChanges();
      const bar = fixture.nativeElement.querySelector(
        'tr[data-test="table-skeleton-row"] .animate-pulse',
      );
      expect(bar).toBeTruthy();
    });

    it('aria-busy=true on <table> during loading', () => {
      const fixture = TestBed.createComponent(LoadingHost);
      (fixture.componentInstance as LoadingHost).loading = true;
      fixture.detectChanges();
      const tbl = fixture.nativeElement.querySelector('table[role="table"]');
      expect(tbl.getAttribute('aria-busy')).toBe('true');
    });
  });

  // ─── TZ-104.3 Phase B #1 cellTemplates ──────────────────────────────

  describe('cellTemplates input (TZ-104.3 Phase B)', () => {
    @Component({
      standalone: true,
      imports: [TableComponent],
      template: `
        <app-pi-table
          [data]="data"
          [columns]="columns"
          [cellTemplates]="{ photo: photoTpl }"
        >
          <ng-template #photoTpl let-row>
            <span data-test="photo-tpl" [attr.data-id]="row.id">PHOTO-{{ row.id }}</span>
          </ng-template>
        </app-pi-table>
      `,
    })
    class CellTplHost {
      data = sampleData;
      columns: ColumnDef<TestRow>[] = [
        { key: 'name', label: 'Name' },
        { key: 'photo', label: 'Photo' },
        { key: 'price', label: 'Price', numeric: true },
      ];
      @ViewChild('photoTpl', { static: true })
      photoTpl!: TemplateRef<unknown>;
    }

    it('column with matching key renders via outlet ($implicit=row)', () => {
      const fixture = TestBed.createComponent(CellTplHost);
      fixture.detectChanges();
      // Columns: [name, photo, price] → second <td> is the photo cell.
      const photoCell = fixture.nativeElement.querySelector(
        'tbody tr:first-child td:nth-child(2) [data-test="photo-tpl"]',
      );
      expect(photoCell).toBeTruthy();
      expect(photoCell?.getAttribute('data-id')).toBe('1');
    });

    it('column WITHOUT cellTemplate entry falls back to formatCell text', () => {
      @Component({
        standalone: true,
        imports: [TableComponent],
        template: `<app-pi-table [data]="data" [columns]="columns" />`,
      })
      class FallbackHost {
        data = sampleData; // [{id:1,name:'Widget',price:99.99}, {id:2,name:'Gadget',price:149.5}]
        columns: ColumnDef<TestRow>[] = [
          { key: 'name', label: 'Name' },
          { key: 'price', label: 'Price', numeric: true },
        ];
      }
      const fixture = TestBed.createComponent(FallbackHost);
      fixture.detectChanges();
      const priceCell = fixture.nativeElement.querySelector(
        'tbody tr:first-child td:nth-child(2)',
      );
      expect(priceCell.textContent.trim()).toContain('99.99');
    });
  });

  // ─── TZ-104.3 Phase B #2 localSort bypass ──────────────────────────

  describe('localSort input (TZ-104.3 Phase B)', () => {
    @Component({
      standalone: true,
      imports: [TableComponent],
      template: `
        <app-pi-table
          [data]="data"
          [columns]="columns"
          [localSort]="localSort"
          (sortChange)="emitSpy($event)"
        />
      `,
    })
    class LocalSortHost {
      data: TestRow[] = [
        { id: '2', name: 'Gadget', price: 200 },
        { id: '1', name: 'Widget', price: 100 },
      ];
      columns: ColumnDef<TestRow>[] = [
        { key: 'name', label: 'Name', sortable: true },
      ];
      localSort = true;
      events: { key: string; dir: string | null }[] = [];
      emitSpy(e: { key: string; dir: string | null }): void {
        this.events.push(e);
      }
    }

    it('localSort=false keeps data in passed-in order on header click', () => {
      const fixture = TestBed.createComponent(LocalSortHost);
      (fixture.componentInstance as LocalSortHost).localSort = false;
      fixture.detectChanges();
      // Click Name header — sortChange emits (header arrow flips
      // visually) but the row order is preserved because sortedData()
      // bypasses internal sort and returns data() unchanged.
      const nameHeader =
        fixture.nativeElement.querySelectorAll('thead th')[0] as HTMLElement;
      nameHeader.click();
      fixture.detectChanges();
      const firstRow = fixture.nativeElement.querySelector(
        'tbody tr:first-child td:first-child',
      );
      // Data was [Gadget, Widget] — stays that way under bypass.
      expect(firstRow.textContent.trim()).toBe('Gadget');
    });

    it('localSort=false still emits sortChange for parent-side re-fetch', () => {
      const fixture = TestBed.createComponent(LocalSortHost);
      (fixture.componentInstance as LocalSortHost).localSort = false;
      fixture.detectChanges();
      const nameHeader =
        fixture.nativeElement.querySelectorAll('thead th')[0] as HTMLElement;
      nameHeader.click();
      const host = fixture.componentInstance as LocalSortHost;
      expect(host.events.length).toBe(1);
      expect(host.events[0]).toEqual({ key: 'name', dir: 'asc' });
    });
  });

  // ─── TZ-104.3 #5 Empty state ──────────────────────────────────────

  describe('empty state', () => {
    @Component({
      standalone: true,
      imports: [TableComponent],
      template: `<app-pi-table [data]="data" [columns]="columns" [emptyMessage]="msg" />`,
    })
    class EmptyHost {
      data: TestRow[] = [];
      columns = baseCols;
      msg = 'Список пуст.';
    }

    it('data=[] renders empty-state-row with default inline markup (eyebrow "00")', () => {
      const fixture = TestBed.createComponent(EmptyHost);
      fixture.detectChanges();
      const emptyRow = fixture.nativeElement.querySelector(
        '[data-test="empty-state-row"]',
      );
      expect(emptyRow).toBeTruthy();
      // Inline fallback (no PiEmptyStateComponent import — pi-table owns
      // its own empty-row markup since PiEmptyState renders a <tr>).
      expect(emptyRow.textContent).toContain('00');
      const defaultBlock = fixture.nativeElement.querySelector(
        '[data-test="default-empty"]',
      );
      expect(defaultBlock).toBeTruthy();
    });

    it('emptyMessage input overrides the default Russian text', () => {
      const fixture = TestBed.createComponent(EmptyHost);
      fixture.detectChanges();
      const text = fixture.nativeElement.textContent;
      expect(text).toContain('Список пуст.');
    });

    it('custom [emptyTemplate] input wins over default', () => {
      @Component({
        standalone: true,
        imports: [TableComponent],
        template: `
          <app-pi-table
            [data]="[]"
            [columns]="baseCols"
            [emptyTemplate]="customTpl"
          >
            <ng-template #customTpl>
              <div data-test="custom-empty-block">MY_CUSTOM_EMPTY</div>
            </ng-template>
          </app-pi-table>
        `,
      })
      class CustomEmptyHost {
        baseCols = baseCols;
      }
      const fixture = TestBed.createComponent(CustomEmptyHost);
      fixture.detectChanges();
      const customBlock = fixture.nativeElement.querySelector(
        '[data-test="custom-empty-block"]',
      );
      expect(customBlock).toBeTruthy();
      expect(customBlock.textContent.trim()).toBe('MY_CUSTOM_EMPTY');
      // The wrapper <tr data-test="empty-state-row"> is ALWAYS rendered
      // when data is empty (it containers either default or custom
      // content). The inner default [data-test="default-empty"] div is
      // what gets replaced when emptyTemplate is supplied.
      const defaultEmpty = fixture.nativeElement.querySelector(
        '[data-test="default-empty"]',
      );
      expect(defaultEmpty).toBeNull();
    });
  });
});
