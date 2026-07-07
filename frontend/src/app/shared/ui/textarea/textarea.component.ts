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

export type PiTextareaSize = 'sm' | 'md';

const BASE_CLASS =
  'flex w-full bg-paper text-ink border rounded-sm outline-none ' +
  'transition-colors min-h-24 resize-none ' +
  'focus-visible:ring-2 focus-visible:ring-ink ' +
  'focus-visible:ring-offset-2 focus-visible:ring-offset-paper ' +
  'disabled:opacity-50 disabled:cursor-not-allowed';

const SIZE_CLASS: Record<PiTextareaSize, string> = {
  sm: 'px-2 py-1 text-xs',
  md: 'px-3 py-2 text-sm',
};

/**
 * Paper & Ink editorial Textarea.
 * Optional character counter shown when `maxLength` is set.
 */
@Component({
  selector: 'app-pi-textarea',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="block">
      <textarea
        [value]="value()"
        [placeholder]="placeholder() ?? ''"
        [disabled]="disabled()"
        [rows]="rows()"
        [attr.maxlength]="maxLength() ?? null"
        [attr.aria-label]="ariaLabel()"
        [attr.aria-invalid]="invalid() ? 'true' : null"
        [class]="computedClass()"
        (input)="onInput($any($event.target).value)"
      ></textarea>
      @if (maxLength()) {
        <div class="eyebrow mt-1 text-right text-muted-foreground">
          {{ value().length }} / {{ maxLength() }}
        </div>
      }
    </div>
  `,
})
export class TextareaComponent {
  readonly value = model<string>('');
  readonly placeholder = input<string | null>(null);
  readonly disabled = input<boolean>(false);
  readonly invalid = input<boolean>(false);
  readonly size = input<PiTextareaSize>('md');
  readonly rows = input<number>(4);
  readonly maxLength = input<number | null>(null);
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
