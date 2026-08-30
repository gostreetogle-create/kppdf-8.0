import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { PI_DEFAULT_PAGE_SIZE, PI_PAGE_SIZE_OPTIONS } from './pi-pagination.constants';

type PageItem = { type: 'page'; n: number } | { type: 'gap'; key: string };

/**
 * Paper & Ink pagination primitive (TZ-UX-340).
 *
 * Layout: `[ start–end из total ]  ‹  1 2 … N  ›  [ по size ▾ ]`
 *
 * - `pageChange` — new 1-indexed page.
 * - `pageSizeChange` — new page size; **parent should reset to page 1**.
 * - Hidden when `total ≤ pageSize` (≤1 page).
 * - Standalone, OnPush, signal-based.
 */
@Component({
  selector: 'app-pi-pagination',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (showPager()) {
      <nav
        role="navigation"
        [attr.aria-label]="ariaLabel()"
        class="flex items-center gap-2 font-mono text-xs text-ink"
        data-test="pi-pagination"
      >
        <span class="text-muted-foreground tabular-nums" data-test="pager-info">
          {{ rangeStart() }}–{{ rangeEnd() }} из {{ total() }}
        </span>

        <div class="flex items-center gap-1">
          <button
            type="button"
            class="px-2 h-8 inline-flex items-center justify-center rounded-sm hairline bg-paper hover:bg-paper-2 disabled:opacity-40 disabled:cursor-not-allowed pi-focus-ring"
            [disabled]="currentPage() === 1"
            (click)="goTo(currentPage() - 1)"
            aria-label="Предыдущая страница"
            data-test="pager-prev"
          >
            ‹
          </button>
          @for (item of pageList(); track $index) {
            @if (item.type === 'page') {
              <button
                type="button"
                [class]="item.n === currentPage() ? activeClass() : inactiveClass()"
                [attr.aria-current]="item.n === currentPage() ? 'page' : null"
                [attr.aria-label]="'Страница ' + item.n"
                [attr.data-test]="item.n === currentPage() ? 'pager-page' : 'pager-page-btn'"
                (click)="goTo(item.n)"
              >
                {{ item.n }}
              </button>
            } @else {
              <span class="px-2 text-muted-foreground" aria-hidden="true">…</span>
            }
          }
          <button
            type="button"
            class="px-2 h-8 inline-flex items-center justify-center rounded-sm hairline bg-paper hover:bg-paper-2 disabled:opacity-40 disabled:cursor-not-allowed pi-focus-ring"
            [disabled]="currentPage() === totalPages()"
            (click)="goTo(currentPage() + 1)"
            aria-label="Следующая страница"
            data-test="pager-next"
          >
            ›
          </button>
        </div>

        @if (showPageSize()) {
          <label class="inline-flex items-center gap-1 text-muted-foreground">
            <span class="sr-only">Размер страницы</span>
            <select
              class="h-8 px-1 rounded-sm hairline bg-paper text-ink tabular-nums pi-focus-ring"
              data-test="pager-page-size"
              [attr.aria-label]="'Строк на странице'"
              [value]="pageSize()"
              (change)="onPageSizeSelect($event)"
            >
              @for (opt of pageSizeOptions; track opt) {
                <option [value]="opt" [selected]="opt === pageSize()">по {{ opt }}</option>
              }
            </select>
          </label>
        }

        <ng-content />
      </nav>
    }
  `,
})
export class PaginationComponent {
  readonly total = input.required<number>();
  /** Items per page. Default {@link PI_DEFAULT_PAGE_SIZE} (10). */
  readonly pageSize = input<number>(PI_DEFAULT_PAGE_SIZE);
  readonly currentPage = input<number>(1);
  readonly siblingCount = input<number>(1);
  readonly ariaLabel = input<string>('Пагинация');
  /**
   * When true (default), render the 10/25/50 size select.
   * Set false for ultra-narrow rails.
   */
  readonly showPageSize = input<boolean>(true);

  readonly pageChange = output<number>();
  /**
   * Emits the chosen page size. Parent **must** reset to page 1
   * (and re-fetch / re-slice) when handling this event.
   */
  readonly pageSizeChange = output<number>();

  readonly pageSizeOptions = PI_PAGE_SIZE_OPTIONS;

  readonly totalPages = computed(() =>
    Math.max(1, Math.ceil(this.total() / Math.max(1, this.pageSize()))),
  );

  /** Hide when there is at most one page. */
  readonly showPager = computed(() => this.total() > 0 && this.total() > this.pageSize());

  readonly rangeStart = computed(() => {
    if (this.total() <= 0) return 0;
    const page = Math.min(Math.max(1, this.currentPage()), this.totalPages());
    const size = Math.max(1, this.pageSize());
    return (page - 1) * size + 1;
  });

  readonly rangeEnd = computed(() => {
    const start = this.rangeStart();
    if (start <= 0) return 0;
    return Math.min(start + Math.max(1, this.pageSize()) - 1, this.total());
  });

  readonly pageList = computed<PageItem[]>(() => {
    const total = this.totalPages();
    const current = Math.min(Math.max(1, this.currentPage()), total);
    const sibl = this.siblingCount();
    const items: PageItem[] = [];

    if (total <= 7) {
      for (let i = 1; i <= total; i++) items.push({ type: 'page', n: i });
      return items;
    }
    items.push({ type: 'page', n: 1 });

    const startGap = current - sibl - 1;
    const endGap = current + sibl + 1;

    if (startGap > 2) items.push({ type: 'gap', key: `gap-l-${startGap}` });

    const startRange = Math.max(2, current - sibl);
    const endRange = Math.min(total - 1, current + sibl);
    for (let i = startRange; i <= endRange; i++) items.push({ type: 'page', n: i });

    if (endGap < total - 1) items.push({ type: 'gap', key: `gap-r-${endGap}` });

    items.push({ type: 'page', n: total });
    return items;
  });

  goTo(n: number): void {
    const total = this.totalPages();
    const clamped = Math.min(Math.max(1, n), total);
    if (clamped !== this.currentPage()) this.pageChange.emit(clamped);
  }

  onPageSizeSelect(event: Event): void {
    const raw = Number((event.target as HTMLSelectElement).value);
    if (!Number.isFinite(raw) || raw <= 0) return;
    if (raw === this.pageSize()) return;
    this.pageSizeChange.emit(raw);
  }

  activeClass(): string {
    return [
      'px-2.5',
      'h-8',
      'min-w-[32px]',
      'inline-flex',
      'items-center',
      'justify-center',
      'rounded-sm',
      'bg-sunrise-warm',
      'text-on-gold',
      'pi-focus-ring',
    ].join(' ');
  }

  inactiveClass(): string {
    return [
      'px-2.5',
      'h-8',
      'min-w-[32px]',
      'inline-flex',
      'items-center',
      'justify-center',
      'rounded-sm',
      'hairline',
      'bg-paper',
      'hover:bg-paper-2',
      'pi-focus-ring',
    ].join(' ');
  }
}
