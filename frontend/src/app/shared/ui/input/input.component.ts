import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  model,
  output,
} from '@angular/core';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const cn = (...inputs: Array<string | false | null | undefined>) =>
  twMerge(clsx(inputs));

export type PiInputType =
  | 'text'
  | 'email'
  | 'password'
  | 'number'
  | 'tel'
  | 'url'
  | 'search';

export type PiInputSize = 'sm' | 'md';

const BASE_CLASS =
  'flex w-full bg-paper text-ink border rounded-sm outline-none ' +
  'transition-colors ' +
  'focus-visible:ring-2 focus-visible:ring-ink ' +
  'focus-visible:ring-offset-2 focus-visible:ring-offset-paper ' +
  'disabled:opacity-50 disabled:cursor-not-allowed';

const SIZE_CLASS: Record<PiInputSize, string> = {
  sm: 'h-8 px-3 text-xs',
  md: 'h-10 px-control-x text-sm',
};

/**
 * Paper & Ink editorial Input.
 * 7 native types, signal-based `model()` for two-way binding,
 * `invalid=true` flips border to destructive token.
 */
@Component({
  selector: 'app-pi-input',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <input
      [type]="type()"
      [value]="value()"
      [placeholder]="placeholder() ?? ''"
      [disabled]="disabled()"
      [attr.aria-label]="ariaLabel()"
      [attr.aria-invalid]="invalid() ? 'true' : null"
      [class]="computedClass()"
      (input)="onInput($any($event.target).value)"
    />
  `,
})
export class InputComponent {
  readonly value = model<string>('');
  readonly placeholder = input<string | null>(null);
  readonly disabled = input<boolean>(false);
  readonly invalid = input<boolean>(false);
  readonly type = input<PiInputType>('text');
  readonly size = input<PiInputSize>('md');
  readonly ariaLabel = input<string | null>(null);

  readonly valueChange = output<string>();

  readonly computedClass = computed(() =>
    cn(
      BASE_CLASS,
      SIZE_CLASS[this.size()],
      this.invalid() ? 'border-destructive' : 'border-rule',
    ),
  );

  onInput(next: string): void {
    this.value.set(next);
    this.valueChange.emit(next);
  }
}
