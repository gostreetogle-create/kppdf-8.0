import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
} from '@angular/core';

/**
 * Pagination component. Supports filled (default), outlined, and compact styles.
 * Usage: <hlm-pagination [total]="100" [pageSize]="10" [(page)]="signal(1)" (pageChange)="..." />
 */
@Component({
  selector: 'hlm-pagination',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <nav class="flex items-center gap-1" aria-label="Pagination">
      @if (style() === 'compact') {
        <button
          type="button"
          class="btn-outline px-2 py-1 text-xs"
          [disabled]="page() === 1"
          (click)="setPage(1)"
          aria-label="First page"
        >«</button>
      }
      <button
        type="button"
        [class]="navBtnClass()"
        [disabled]="page() === 1"
        (click)="setPage(page() - 1)"
        aria-label="Previous page"
      >‹</button>

      @for (item of visiblePages(); track $index) {
        @if (item === '...') {
          <span class="px-2 text-muted-foreground">…</span>
        } @else {
          <button
            type="button"
            [class]="pageBtnClass(item)"
            [attr.aria-current]="item === page() ? 'page' : null"
            (click)="setPage(item)"
          >{{ item }}</button>
        }
      }

      <button
        type="button"
        [class]="navBtnClass()"
        [disabled]="page() === totalPages()"
        (click)="setPage(page() + 1)"
        aria-label="Next page"
      >›</button>

      @if (style() === 'compact') {
        <button
          type="button"
          class="btn-outline px-2 py-1 text-xs"
          [disabled]="page() === totalPages()"
          (click)="setPage(totalPages())"
          aria-label="Last page"
        >»</button>
      }
    </nav>
  `,
})
export class PaginationComponent {
  readonly page = input<number>(1);
  readonly total = input<number>(0);
  readonly pageSize = input<number>(10);
  readonly siblingCount = input<number>(1);
  readonly style = input<'filled' | 'outlined' | 'compact'>('filled');

  readonly pageChange = output<number>();

  protected readonly totalPages = computed(() =>
    Math.max(1, Math.ceil(this.total() / this.pageSize())),
  );

  protected readonly visiblePages = computed<(number | '...')[]>(() => {
    const total = this.totalPages();
    const current = this.page();
    const siblings = this.siblingCount();
    if (total <= 7) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }
    const pages: (number | '...')[] = [];
    const left = Math.max(2, current - siblings);
    const right = Math.min(total - 1, current + siblings);
    pages.push(1);
    if (left > 2) pages.push('...');
    for (let i = left; i <= right; i++) pages.push(i);
    if (right < total - 1) pages.push('...');
    pages.push(total);
    return pages;
  });

  protected pageBtnClass(page: number | '...'): string {
    const isActive = page === this.page();
    if (this.style() === 'outlined') {
      return [
        'inline-flex h-8 min-w-8 items-center justify-center rounded-md border px-2 text-sm transition-colors',
        isActive
          ? 'border-primary text-primary'
          : 'border-input hover:bg-accent',
      ].join(' ');
    }
    return [
      'inline-flex h-8 min-w-8 items-center justify-center rounded-md px-2 text-sm transition-colors',
      isActive
        ? 'bg-primary text-primary-foreground'
        : 'hover:bg-accent',
    ].join(' ');
  }

  protected navBtnClass(): string {
    return 'inline-flex h-8 min-w-8 items-center justify-center rounded-md border border-input px-2 text-sm hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent';
  }

  protected setPage(p: number): void {
    const clamped = Math.max(1, Math.min(this.totalPages(), p));
    if (clamped !== this.page()) {
      this.pageChange.emit(clamped);
    }
  }
}
