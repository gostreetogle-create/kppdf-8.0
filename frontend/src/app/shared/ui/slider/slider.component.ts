import { ChangeDetectionStrategy, Component, computed, forwardRef, input, model, output, signal } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

/**
 * Slider — single-thumb range primitive for Paper & Ink.
 * Renders native `<input type="range">` (best a11y) wrapped in
 * hairline track + mono eyebrow value display. Standalone, OnPush.
 */
@Component({
  selector: 'app-pi-slider',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: forwardRef(() => SliderComponent),
    },
  ],
  template: `
    <div class="block w-full">
      <input
        type="range"
        [min]="min()"
        [max]="max()"
        [step]="step()"
        [value]="value()"
        [disabled]="disabled()"
        [attr.aria-label]="ariaLabel()"
        [class]="computedClass()"
        (input)="onInput($event)"
      />
      @if (showValue()) {
        <div class="eyebrow mt-1 text-right mono">{{ value() }} / {{ max() }}</div>
      }
    </div>
  `,
  styles: [`
    :host { display: block; width: 100%; }
    input[type='range'] {
      -webkit-appearance: none;
      appearance: none;
      width: 100%;
      height: 1px;
      background: var(--color-rule);
      outline: none;
      cursor: pointer;
    }
    input[type='range']::-webkit-slider-thumb {
      -webkit-appearance: none;
      appearance: none;
      width: 16px;
      height: 16px;
      border-radius: 9999px;
      background: var(--color-ink);
      border: 1px solid var(--color-ink);
      cursor: pointer;
      transition: transform 150ms ease;
    }
    input[type='range']::-webkit-slider-thumb:hover { transform: scale(1.15); }
    input[type='range']::-moz-range-thumb {
      width: 16px;
      height: 16px;
      border-radius: 9999px;
      background: var(--color-ink);
      border: 1px solid var(--color-ink);
      cursor: pointer;
    }
    input[type='range']:focus-visible::-webkit-slider-thumb {
      box-shadow: 0 0 0 2px var(--color-paper), 0 0 0 4px var(--color-ink);
    }
    input[type='range']:disabled { opacity: 0.5; cursor: not-allowed; }
  `],
})
export class SliderComponent implements ControlValueAccessor {
  readonly value = model<number>(0);
  readonly min = input<number>(0);
  readonly max = input<number>(100);
  readonly step = input<number>(1);
  readonly disabled = input<boolean>(false);
  readonly showValue = input<boolean>(false);
  readonly ariaLabel = input<string | null>(null);

  readonly valueChange = output<number>();

  readonly computedClass = computed(() => 'block w-full h-1');

  // ─── ControlValueAccessor ───
  private onChange: (value: number) => void = () => {};
  private onTouched: () => void = () => {};
  protected readonly isDisabledFromForm = signal<boolean>(false);

  writeValue(value: number | null): void {
    this.value.set(value ?? this.min());
  }

  registerOnChange(fn: (value: number) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.isDisabledFromForm.set(isDisabled);
  }

  onInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    const num = Number(target.value);
    if (!Number.isNaN(num)) {
      this.value.set(num);
      this.onChange(num);
      this.onTouched();
      this.valueChange.emit(num);
    }
  }
}
