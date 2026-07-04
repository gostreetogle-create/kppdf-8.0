import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
  signal,
} from '@angular/core';

/**
 * Rating (TZ-32) — 5-star rating with hover preview and half-star support.
 * Usage:
 *   <hlm-rating [value]="rating()" (valueChange)="rating.set($event)" [max]="5" />
 */
@Component({
  selector: 'hlm-rating',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="inline-flex items-center gap-0.5"
      [class.opacity-50]="disabled()"
      (mouseleave)="hovered.set(-1)"
      role="radiogroup"
      [attr.aria-label]="'Rating out of ' + max()"
    >
      @for (i of stars(); track i) {
        <button
          type="button"
          [attr.aria-label]="i + ' star' + (i > 1 ? 's' : '')"
          [attr.aria-checked]="value() === i"
          role="radio"
          [class]="iconClass(i)"
          [style.width.px]="size()"
          [style.height.px]="size()"
          (mouseenter)="hovered.set(i)"
          (click)="onClick(i, $event)"
          [disabled]="disabled()"
        >
          <svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.957a1 1 0 0 0 .95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.37 2.448a1 1 0 0 0-.363 1.118l1.287 3.957c.3.921-.755 1.688-1.539 1.118L12 15.347l-3.37 2.45c-.783.57-1.838-.197-1.539-1.118l1.287-3.957a1 1 0 0 0-.363-1.118L4.645 9.156c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 0 0 .95-.69l1.286-3.957z" />
          </svg>
        </button>
      }
      @if (showValue()) {
        <span class="ml-2 text-sm text-muted-foreground">{{ display() }}</span>
      }
    </div>
  `,
})
export class RatingComponent {
  readonly value = input<number>(0);
  readonly valueChange = output<number>();
  readonly max = input<number>(5);
  readonly size = input<number>(20);
  readonly allowHalf = input<boolean>(false);
  readonly readonly = input<boolean>(false);
  readonly disabled = input<boolean>(false);
  readonly showValue = input<boolean>(false);

  protected readonly hovered = signal<number>(-1);

  protected readonly stars = computed(() => Array.from({ length: this.max() }, (_, i) => i + 1));

  protected readonly display = computed(() => {
    const h = this.hovered();
    return h >= 0 ? h : this.value();
  });

  protected iconClass(i: number): string {
    const active = (this.hovered() >= 0 ? this.hovered() : this.value()) >= i;
    return [
      'text-yellow-400 transition-colors',
      active ? '' : 'text-muted-foreground/30',
      this.readonly() || this.disabled() ? 'cursor-default' : 'cursor-pointer hover:text-yellow-500',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm',
    ].join(' ');
  }

  protected onClick(i: number, e: MouseEvent): void {
    if (this.readonly() || this.disabled()) return;
    if (this.allowHalf() && e.offsetX < (e.target as HTMLElement).clientWidth / 2) {
      this.valueChange.emit(i - 0.5);
    } else {
      this.valueChange.emit(i);
    }
  }
}
