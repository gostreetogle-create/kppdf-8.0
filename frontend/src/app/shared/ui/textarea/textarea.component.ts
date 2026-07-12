import {
  ChangeDetectionStrategy,
  Component,
  computed,
  forwardRef,
  input,
  model,
  output,
  signal,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const cn = (...inputs: Array<string | false | null | undefined>) =>
  twMerge(clsx(inputs));

export type PiTextareaSize = 'sm' | 'md';

const BASE_CLASS =
  'flex w-full bg-paper text-ink border rounded-sm outline-none ' +
  'transition-colors min-h-24 resize-none ' +
  'pi-focus-ring ' +
  'disabled:opacity-50 disabled:cursor-not-allowed';

const SIZE_CLASS: Record<PiTextareaSize, string> = {
  sm: 'px-2 py-1 text-xs',
  md: 'px-3 py-2 text-sm',
};

@Component({
  selector: 'app-pi-textarea',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: forwardRef(() => TextareaComponent),
    },
  ],
  template: `
    <div class="block">
      <textarea
        [value]="value()"
        [placeholder]="placeholder() ?? ''"
        [disabled]="disabled() || isDisabledFromForm()"
        [rows]="rows()"
        [attr.maxlength]="maxLength() ?? null"
        [attr.id]="id() ?? null"
        [attr.aria-label]="ariaLabel()"
        [attr.aria-invalid]="invalid() ? 'true' : null"
        [class]="computedClass()"
        (input)="onInput($any($event.target).value)"
        (blur)="onTouched()"
      ></textarea>
      @if (maxLength()) {
        <div class="eyebrow mt-1 text-right text-muted-foreground">
          {{ value().length }} / {{ maxLength() }}
        </div>
      }
    </div>
  `,
})
export class TextareaComponent implements ControlValueAccessor {
  readonly value = model<string>('');
  readonly placeholder = input<string | null>(null);
  readonly disabled = input<boolean>(false);
  readonly invalid = input<boolean>(false);
  readonly size = input<PiTextareaSize>('md');
  readonly rows = input<number>(4);
  readonly maxLength = input<number | null>(null);
  readonly ariaLabel = input<string | null>(null);
  /**
   * TZ-104.1 — DOM id for the inner native `<textarea>` element.
   * Pairs with the `htmlFor` input on `<app-pi-form-field>` so
   * `<label>`-click focuses the textarea correctly. Bound via
   * `[attr.id]` on the inner element (not the host wrapper div).
   */
  readonly id = input<string | null>(null);

  readonly valueChange = output<string>();

  readonly computedClass = computed(() =>
    cn(
      BASE_CLASS,
      SIZE_CLASS[this.size()],
      this.invalid() ? 'border-destructive' : 'border-rule',
    ),
  );

  private onChange: (value: string) => void = () => {};
  private onTouchedFn: () => void = () => {};
  protected readonly isDisabledFromForm = signal<boolean>(false);

  writeValue(value: string | null): void {
    this.value.set(value ?? '');
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouchedFn = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.isDisabledFromForm.set(isDisabled);
  }

  onInput(next: string): void {
    this.value.set(next);
    this.onChange(next);
    this.valueChange.emit(next);
  }

  onTouched(): void {
    this.onTouchedFn();
  }
}
