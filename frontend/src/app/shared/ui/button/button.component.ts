import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
} from '@angular/core';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const cn = (...inputs: Array<string | false | null | undefined>) =>
  twMerge(clsx(inputs));

export type PiButtonVariant =
  | 'default'
  | 'secondary'
  | 'outline'
  | 'ghost'
  | 'link'
  | 'destructive';

export type PiButtonSize = 'sm' | 'md' | 'lg' | 'icon';

const VARIANT_CLASS: Record<PiButtonVariant, string> = {
  default: 'bg-ink text-paper hover:opacity-90',
  secondary: 'bg-paper-2 text-ink hover:bg-paper',
  outline: 'bg-transparent border border-rule text-ink hover:bg-paper-2',
  ghost: 'bg-transparent text-ink hover:bg-paper-2',
  link: 'bg-transparent text-ink underline underline-offset-4 hover:text-ink',
  destructive: 'bg-destructive text-paper hover:opacity-90',
};

const SIZE_CLASS: Record<PiButtonSize, string> = {
  sm: 'h-8 px-3 text-xs',
  md: 'h-10 px-4 text-sm',
  lg: 'h-12 px-6 text-base',
  icon: 'h-9 w-9 p-0',
};

const BASE_CLASS =
  'inline-flex items-center justify-center gap-2 font-medium font-body ' +
  'rounded-sm transition-colors ' +
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink ' +
  'focus-visible:ring-offset-2 focus-visible:ring-offset-paper ' +
  'disabled:opacity-50 disabled:cursor-not-allowed';

/**
 * Paper & Ink editorial Button.
 * 6 variants × 4 sizes, hairline rule, no shadows, mono numerals.
 * Renders `<a>` if `href` is set, otherwise native `<button>`.
 */
@Component({
  selector: 'app-pi-button',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (href()) {
      <a
        [attr.href]="href()"
        [attr.aria-label]="ariaLabel()"
        [attr.aria-disabled]="disabled() ? 'true' : null"
        [class]="computedClass()"
        (click)="onClick($event)"
      >
        <ng-content select="[pi-icon]"></ng-content>
        <ng-content></ng-content>
      </a>
    } @else {
      <button
        [type]="type()"
        [disabled]="disabled()"
        [attr.aria-label]="ariaLabel()"
        [attr.aria-disabled]="disabled() ? 'true' : null"
        [class]="computedClass()"
        (click)="onClick($event)"
      >
        <ng-content select="[pi-icon]"></ng-content>
        <ng-content></ng-content>
      </button>
    }
  `,
})
export class ButtonComponent {
  readonly variant = input<PiButtonVariant>('default');
  readonly size = input<PiButtonSize>('md');
  readonly disabled = input<boolean>(false);
  readonly type = input<'button' | 'submit' | 'reset'>('button');
  readonly href = input<string | null>(null);
  /** Accessible name for icon-only buttons. Set when content is purely icon
   *  (e.g. <app-pi-button size="icon" ariaLabel="Settings">). */
  readonly ariaLabel = input<string | null>(null);

  readonly pressed = output<MouseEvent>();

  readonly computedClass = computed(() =>
    cn(
      BASE_CLASS,
      VARIANT_CLASS[this.variant()],
      SIZE_CLASS[this.size()],
      this.disabled() && 'pointer-events-none',
    ),
  );

  onClick(event: MouseEvent): void {
    if (this.disabled()) return;
    this.pressed.emit(event);
  }
}
