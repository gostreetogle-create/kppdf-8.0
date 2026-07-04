import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  effect,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';

export interface CarouselSlide {
  id: string;
  caption?: string;
}

@Component({
  selector: 'hlm-carousel-item',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<ng-content></ng-content>`,
  styles: [
    `
      :host {
        flex: 0 0 100%;
        min-width: 0;
        display: block;
      }
    `,
  ],
})
export class CarouselItemComponent {}

/**
 * Carousel (TZ-39) — swipeable, keyboard nav, autoplay, loop.
 * Usage:
 *   <hlm-carousel [items]="items" (indexChange)="idx.set($event)">
 *     @for (s of items(); track s.id; let i = $index) {
 *       <hlm-carousel-item>...slide content...</hlm-carousel-item>
 *     }
 *   </hlm-carousel>
 */
@Component({
  selector: 'hlm-carousel',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="relative overflow-hidden rounded-lg"
      tabindex="0"
      role="region"
      aria-roledescription="carousel"
      aria-label="Carousel"
      (keydown)="onKey($event)"
    >
      <div
        #track
        class="flex transition-transform duration-300 ease-out"
        [style.transform]="'translateX(-' + offsetPct() + '%)'"
        (pointerdown)="onDown($event)"
        (pointermove)="onMove($event)"
        (pointerup)="onUp($event)"
      >
        <ng-content></ng-content>
      </div>

      <button
        type="button"
        class="absolute left-2 top-1/2 -translate-y-1/2 inline-flex h-8 w-8 items-center justify-center rounded-full border border-border bg-background/80 backdrop-blur hover:bg-background"
        (click)="prev()"
        aria-label="Previous slide"
      >
        <span class="lucide-chevron-left h-4 w-4"></span>
      </button>
      <button
        type="button"
        class="absolute right-2 top-1/2 -translate-y-1/2 inline-flex h-8 w-8 items-center justify-center rounded-full border border-border bg-background/80 backdrop-blur hover:bg-background"
        (click)="next()"
        aria-label="Next slide"
      >
        <span class="lucide-chevron-right h-4 w-4"></span>
      </button>

      <div class="absolute inset-x-0 bottom-2 flex justify-center gap-1.5">
        @for (s of items(); track s.id; let i = $index) {
          <button
            type="button"
            [attr.aria-label]="'Go to slide ' + (i + 1)"
            [class]="dotClass(i)"
            (click)="goTo(i)"
          ></button>
        }
      </div>
    </div>
  `,
})
export class CarouselComponent {
  readonly items = input.required<CarouselSlide[]>();
  readonly index = input<number>(0);
  readonly indexChange = output<number>();
  readonly autoplay = input<boolean>(false);
  readonly interval = input<number>(5000);
  readonly loop = input<boolean>(true);

  protected readonly current = signal<number>(0);
  private readonly track = viewChild<ElementRef<HTMLElement>>('track');
  private dragStartX = 0;
  private dragDelta = 0;
  private isDragging = false;
  private autoplayTimer?: ReturnType<typeof setInterval>;

  constructor() {
    effect(() => {
      const idx = this.index();
      this.current.set(idx);
    });
    effect(() => {
      if (this.autoplay()) {
        this.startAutoplay();
      } else {
        this.stopAutoplay();
      }
    });
  }

  protected readonly offsetPct = computed(() => this.current() * 100);

  protected dotClass(i: number): string {
    return [
      'h-1.5 rounded-full transition-all',
      i === this.current() ? 'w-6 bg-primary' : 'w-1.5 bg-muted-foreground/40',
    ].join(' ');
  }

  goTo(i: number): void {
    const len = this.items().length;
    if (len === 0) return;
    let next = i;
    if (this.loop()) {
      next = ((i % len) + len) % len;
    } else {
      next = Math.max(0, Math.min(len - 1, i));
    }
    this.current.set(next);
    this.indexChange.emit(next);
  }

  next(): void {
    this.goTo(this.current() + 1);
  }

  prev(): void {
    this.goTo(this.current() - 1);
  }

  protected onKey(e: KeyboardEvent): void {
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      this.next();
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      this.prev();
    }
  }

  protected onDown(e: PointerEvent): void {
    this.isDragging = true;
    this.dragStartX = e.clientX;
    this.dragDelta = 0;
  }

  protected onMove(e: PointerEvent): void {
    if (!this.isDragging) return;
    this.dragDelta = e.clientX - this.dragStartX;
  }

  protected onUp(_: PointerEvent): void {
    if (!this.isDragging) return;
    this.isDragging = false;
    if (this.dragDelta < -50) this.next();
    else if (this.dragDelta > 50) this.prev();
    this.dragDelta = 0;
  }

  private startAutoplay(): void {
    this.stopAutoplay();
    this.autoplayTimer = setInterval(() => this.next(), this.interval());
  }

  private stopAutoplay(): void {
    if (this.autoplayTimer) clearInterval(this.autoplayTimer);
  }
}

