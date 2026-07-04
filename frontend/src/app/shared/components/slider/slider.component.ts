import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
  signal,
} from '@angular/core';

/**
 * Slider component (single value or range).
 * Usage: <hlm-slider [min]="0" [max]="100" [step]="1" [(value)]="signal(0)" />
 *        <hlm-slider [range]="true" [value]="[20, 80]" (valueChange)="..." />
 */
@Component({
  selector: 'hlm-slider',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="relative flex w-full touch-none select-none items-center">
      <div class="relative h-2 w-full grow overflow-hidden rounded-full bg-secondary">
        <div
          class="absolute h-full bg-primary"
          [style.left.%]="leftPct()"
          [style.width.%]="widthPct()"
        ></div>
      </div>

      @if (range()) {
        <button
          type="button"
          role="slider"
          class="block h-5 w-5 rounded-full border-2 border-primary bg-background shadow transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
          [attr.aria-valuemin]="min()"
          [attr.aria-valuemax]="max()"
          [attr.aria-valuenow]="low()"
          [attr.aria-label]="ariaLabelLow()"
          (keydown)="onKey($event, 'low')"
          (pointerdown)="onDragStart($event, 'low')"
        ></button>
        <button
          type="button"
          role="slider"
          class="block h-5 w-5 rounded-full border-2 border-primary bg-background shadow transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
          [attr.aria-valuemin]="min()"
          [attr.aria-valuemax]="max()"
          [attr.aria-valuenow]="high()"
          [attr.aria-label]="ariaLabelHigh()"
          (keydown)="onKey($event, 'high')"
          (pointerdown)="onDragStart($event, 'high')"
        ></button>
      } @else {
        <button
          type="button"
          role="slider"
          class="block h-5 w-5 rounded-full border-2 border-primary bg-background shadow transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
          [attr.aria-valuemin]="min()"
          [attr.aria-valuemax]="max()"
          [attr.aria-valuenow]="low()"
          [attr.aria-label]="ariaLabelLow()"
          (keydown)="onKey($event, 'low')"
          (pointerdown)="onDragStart($event, 'low')"
        ></button>
      }
    </div>
    @if (showValue()) {
      <div class="mt-1 text-xs text-muted-foreground">
        @if (range()) {
          {{ low() }} – {{ high() }}
        } @else {
          {{ low() }}
        }
      </div>
    }
  `,
})
export class SliderComponent {
  readonly value = input<number | [number, number]>(0);
  readonly min = input<number>(0);
  readonly max = input<number>(100);
  readonly step = input<number>(1);
  readonly range = input<boolean>(false);
  readonly showValue = input<boolean>(false);
  readonly disabled = input<boolean>(false);
  readonly ariaLabelLow = input<string>('Minimum value');
  readonly ariaLabelHigh = input<string>('Maximum value');

  readonly valueChange = output<number | [number, number]>();

  private readonly _low = signal<number>(0);
  private readonly _high = signal<number>(0);

  protected readonly low = computed(() => this.normalize(this._low() || this.coerceLow()));
  protected readonly high = computed(() => this.normalize(this._high() || this.coerceHigh()));

  protected readonly leftPct = computed(() => ((this.low() - this.min()) / (this.max() - this.min())) * 100);
  protected readonly widthPct = computed(() => {
    if (!this.range()) return 0;
    return ((this.high() - this.low()) / (this.max() - this.min())) * 100;
  });

  private coerceLow(): number {
    const v = this.value();
    return Array.isArray(v) ? v[0] : v;
  }
  private coerceHigh(): number {
    const v = this.value();
    return Array.isArray(v) ? v[1] : v;
  }

  private normalize(v: number): number {
    const stepped = Math.round((v - this.min()) / this.step()) * this.step() + this.min();
    return Math.max(this.min(), Math.min(this.max(), stepped));
  }

  protected onKey(event: KeyboardEvent, which: 'low' | 'high'): void {
    if (this.disabled()) return;
    let delta = 0;
    switch (event.key) {
      case 'ArrowRight':
      case 'ArrowUp':
        delta = this.step();
        break;
      case 'ArrowLeft':
      case 'ArrowDown':
        delta = -this.step();
        break;
      case 'PageUp':
        delta = this.step() * 10;
        break;
      case 'PageDown':
        delta = -this.step() * 10;
        break;
      case 'Home':
        this.setValue(which, this.min());
        event.preventDefault();
        return;
      case 'End':
        this.setValue(which, this.max());
        event.preventDefault();
        return;
      default:
        return;
    }
    event.preventDefault();
    const current = which === 'low' ? this.low() : this.high();
    this.setValue(which, current + delta);
  }

  protected onDragStart(event: PointerEvent, which: 'low' | 'high'): void {
    if (this.disabled()) return;
    event.preventDefault();
    const startX = event.clientX;
    const track = (event.currentTarget as HTMLElement).parentElement?.querySelector('div') as HTMLElement | null;
    if (!track) return;
    const rect = track.getBoundingClientRect();

    const move = (ev: PointerEvent) => {
      const pct = Math.max(0, Math.min(1, (ev.clientX - rect.left) / rect.width));
      const next = this.min() + pct * (this.max() - this.min());
      this.setValue(which, this.normalize(next));
    };
    const up = () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  }

  private setValue(which: 'low' | 'high', v: number): void {
    if (this.range()) {
      const low = which === 'low' ? Math.min(v, this.high()) : this.low();
      const high = which === 'high' ? Math.max(v, this.low()) : this.high();
      this._low.set(low);
      this._high.set(high);
      this.valueChange.emit([low, high]);
    } else {
      this._low.set(v);
      this.valueChange.emit(v);
    }
  }
}
