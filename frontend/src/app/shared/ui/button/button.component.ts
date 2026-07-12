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
  /* TZ-96: Design Reference — gold primary, grey bg (user request), executive-shadow */
  default: 'bg-[oklch(0.55_0.007_260)] text-white border border-gold executive-shadow hover:brightness-110',
  secondary: 'bg-tertiary text-white hover:brightness-110',
  outline: 'bg-transparent border border-rule text-ink hover:bg-paper-2',
  ghost: 'bg-transparent text-ink hover:bg-paper-2',
  link: 'bg-transparent text-ink underline underline-offset-4 hover:text-ink',
  destructive: 'bg-destructive text-white hover:brightness-110',
};

const SIZE_CLASS: Record<PiButtonSize, string> = {
  sm: 'h-8 px-3 text-xs',
  md: 'h-10 px-4 text-sm',
  lg: 'h-12 px-6 text-base',
  icon: 'h-9 w-9 p-0',
};

const BASE_CLASS =
  'inline-flex items-center justify-center gap-2 font-medium font-mono ' + /* TZ-96: JetBrains Mono uppercase */
  'uppercase tracking-wider ' +
  'rounded-sm transition-all ' +
  'pi-focus-ring ' +
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

  /**
   * Click event emitted from the inner `<button>` / `<a>`.
   * (Renamed from `pressed` 2026-07-11 fix #1: 23 template sites in pages/* and
   * kit/* bind `(click)="fn($event)"` — Angular convention is to name mouse
   * click Output `click`, not `pressed`. Zero `(pressed)` consumers existed
   * pre-fix, so no consumers break. Public API is now: `<app-pi-button
   * (click)="someHandler($event)">`.)
   */
  readonly click = output<MouseEvent>();

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
    this.click.emit(event);
  }
}
