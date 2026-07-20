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

const cn = (...inputs: Array<string | false | null | undefined>) => twMerge(clsx(inputs));

export type PiInputType = 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search';

export type PiInputSize = 'sm' | 'md';

const BASE_CLASS =
  'flex w-full bg-paper text-ink border rounded-sm outline-none ' +
  'transition-colors ' +
  'pi-focus-ring ' +
  'disabled:opacity-50 disabled:cursor-not-allowed';

const SIZE_CLASS: Record<PiInputSize, string> = {
  sm: 'h-8 px-3 text-xs',
  md: 'h-10 px-control-x text-sm',
};

@Component({
  selector: 'app-pi-input',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: forwardRef(() => InputComponent),
    },
  ],
  template: `
    <input
      [type]="type()"
      [value]="value()"
      [placeholder]="placeholder() ?? ''"
      [disabled]="disabled() || isDisabledFromForm()"
      [attr.aria-label]="ariaLabel()"
      [attr.aria-invalid]="invalid() ? 'true' : null"
      [class]="computedClass()"
      (input)="onInput($any($event.target).value)"
      (blur)="onTouched()"
    />
  `,
})
export class InputComponent implements ControlValueAccessor {
  readonly value = model<string>('');
  readonly placeholder = input<string | null>(null);
  readonly disabled = input<boolean>(false);
  readonly invalid = input<boolean>(false);
  readonly type = input<PiInputType>('text');
  readonly size = input<PiInputSize>('md');
  readonly ariaLabel = input<string | null>(null);

  readonly valueChange = output<string>();

  readonly computedClass = computed(() =>
    cn(BASE_CLASS, SIZE_CLASS[this.size()], this.invalid() ? 'border-destructive' : 'border-rule'),
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
