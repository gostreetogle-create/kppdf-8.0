import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';

type PageItem = { type: 'page'; n: number } | { type: 'gap'; key: string };

/**
 * Paper & Ink pagination primitive.
 *
 * Renders prev + numbered list (with intelligent gaps) + next buttons.
 * Active page marked via solid ink bg. Standalone, OnPush, signal-based.
 */
@Component({
  selector: 'app-pi-pagination',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <nav
      role="navigation"
      [attr.aria-label]="ariaLabel()"
      class="flex items-center gap-1 font-mono text-xs text-ink"
    >
      <button
        type="button"
        class="px-2 h-7 inline-flex items-center justify-center rounded-sm hairline bg-paper hover:bg-paper-2 disabled:opacity-40 disabled:cursor-not-allowed pi-focus-ring"
        [disabled]="currentPage() === 1"
        (click)="goTo(currentPage() - 1)"
        aria-label="Предыдущая страница"
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
        class="px-2 h-7 inline-flex items-center justify-center rounded-sm hairline bg-paper hover:bg-paper-2 disabled:opacity-40 disabled:cursor-not-allowed pi-focus-ring"
        [disabled]="currentPage() === totalPages()"
        (click)="goTo(currentPage() + 1)"
        aria-label="Следующая страница"
      >
        ›
      </button>
      <ng-content />
    </nav>
  `,
})
export class PaginationComponent {
  readonly total = input.required<number>();
  readonly pageSize = input<number>(20);
  readonly currentPage = input<number>(1);
  readonly siblingCount = input<number>(1);
  readonly ariaLabel = input<string>('Пагинация');

  readonly pageChange = output<number>();

  readonly totalPages = computed(() =>
    Math.max(1, Math.ceil(this.total() / this.pageSize())),
  );

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

  activeClass(): string {
    return [
      'px-2.5',
      'h-7',
      'min-w-[28px]',
      'inline-flex',
      'items-center',
      'justify-center',
      'rounded-sm',
      'bg-sunrise-warm',
      'text-paper',
      'pi-focus-ring',
    ].join(' ');
  }

  inactiveClass(): string {
    return [
      'px-2.5',
      'h-7',
      'min-w-[28px]',
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
