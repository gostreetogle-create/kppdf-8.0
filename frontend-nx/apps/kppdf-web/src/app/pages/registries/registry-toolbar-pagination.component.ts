import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { PAGE_SIZE_OPTIONS } from './model/registry-query-state';

type PageItem = { type: 'page'; n: number } | { type: 'gap'; key: string };

/**
 * Registry toolbar pager — mirrors `app-pi-pagination` markup/tokens without
 * importing `libs/ui` across module boundaries (TZ-NX-REGISTRIES-FILTERS-PAGINATION-CONSISTENCY).
 */
@Component({
  selector: 'pi-registry-toolbar-pagination',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (showPager()) {
      <nav
        role="navigation"
        [attr.aria-label]="ariaLabel()"
        class="flex items-center gap-2 font-mono text-xs text-ink"
        data-test="registry-toolbar-pagination"
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

        <label class="inline-flex items-center gap-1 text-muted-foreground">
          <span class="sr-only">Размер страницы</span>
          <select
            class="h-8 px-1 rounded-sm hairline bg-paper text-ink tabular-nums pi-focus-ring"
            data-test="pager-page-size"
            aria-label="Строк на странице"
            [value]="pageSize()"
            (change)="onPageSizeSelect($event)"
          >
            @for (opt of pageSizeOptions; track opt) {
              <option [value]="opt">по {{ opt }}</option>
            }
          </select>
        </label>
      </nav>
    }
  `,
})
export class RegistryToolbarPaginationComponent {
  readonly total = input.required<number>();
  readonly pageSize = input.required<number>();
  readonly currentPage = input.required<number>();
  readonly ariaLabel = input<string>('Пагинация');
  readonly pageChange = output<number>();
  readonly pageSizeChange = output<number>();

  readonly pageSizeOptions = PAGE_SIZE_OPTIONS;

  readonly totalPages = computed(() =>
    Math.max(1, Math.ceil(this.total() / Math.max(1, this.pageSize()))),
  );

  /** Always visible when there is data — even a single page (TZ-NX-REGISTRIES-TOOLBAR-FINALIZE). */
  readonly showPager = computed(() => this.total() > 0);

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
    const items: PageItem[] = [];
    if (total <= 7) {
      for (let i = 1; i <= total; i++) items.push({ type: 'page', n: i });
      return items;
    }
    items.push({ type: 'page', n: 1 });
    const startGap = current - 2;
    const endGap = current + 2;
    if (startGap > 2) items.push({ type: 'gap', key: `gap-l-${startGap}` });
    const startRange = Math.max(2, current - 1);
    const endRange = Math.min(total - 1, current + 1);
    for (let i = startRange; i <= endRange; i++) items.push({ type: 'page', n: i });
    if (endGap < total - 1) items.push({ type: 'gap', key: `gap-r-${endGap}` });
    items.push({ type: 'page', n: total });
    return items;
  });

  goTo(n: number): void {
    const clamped = Math.min(Math.max(1, n), this.totalPages());
    if (clamped !== this.currentPage()) this.pageChange.emit(clamped);
  }

  onPageSizeSelect(event: Event): void {
    const raw = Number((event.target as HTMLSelectElement).value);
    if (!Number.isFinite(raw) || raw <= 0 || raw === this.pageSize()) return;
    this.pageSizeChange.emit(raw);
  }

  activeClass(): string {
    return 'px-2.5 h-8 min-w-[32px] inline-flex items-center justify-center rounded-sm bg-sunrise-warm text-on-gold pi-focus-ring';
  }

  inactiveClass(): string {
    return 'px-2.5 h-8 min-w-[32px] inline-flex items-center justify-center rounded-sm hairline bg-paper hover:bg-paper-2 pi-focus-ring';
  }
}
