import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { LucideAngularModule, User } from 'lucide-angular';

export type PiAvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type PiAvatarShape = 'square' | 'rounded';

const SIZE_CLASS: Record<PiAvatarSize, string> = {
  xs: 'w-6 h-6 text-[10px]',
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-14 h-14 text-base',
  xl: 'w-20 h-20 text-xl',
};

const LUCIDE_SIZE: Record<PiAvatarSize, number> = {
  xs: 12,
  sm: 16,
  md: 20,
  lg: 28,
  xl: 40,
};

const SHAPE_CLASS: Record<PiAvatarShape, string> = {
  square: 'rounded-none',
  rounded: 'rounded-sm',
};

const BASE_CLASS = [
  'inline-flex',
  'items-center',
  'justify-center',
  'overflow-hidden',
  'border',
  'hairline',
  'border-rule',
  'bg-paper-2',
  'text-ink',
  'font-display',
  'font-semibold',
  'tracking-tight',
  'uppercase',
  'select-none',
].join(' ');

/**
 * Paper & Ink editorial Avatar.
 *
 * Three-tier fallback chain (rendered via @if/@else):
 *  1. If `src` is set → render `<img>` (object-cover, fills container).
 *  2. Else if `initials` (or derived from `alt`) is non-empty →
 *     render monogram text in font-display uppercase.
 *  3. Else → render lucide `user` icon as 50%-size fallback.
 *
 * Shape: `square` (default, hairline border) or `rounded`
 * (rounded-sm 0.375rem, NOT pill/circular — Paper & Ink anti-SaaS-cliché).
 *
 * A11y: `role="img"` + `aria-label` (alt is shown as image alt text;
 * ariaLabel is the human-readable label for screen readers).
 * Initials auto-derived from alt ("John Doe" → "JD") when not explicit.
 *
 * Standalone + OnPush + signal-based. Imports LucideAngularModule
 * for the `user` icon fallback (matches peer badge/card pattern).
 */
@Component({
  selector: 'app-pi-avatar',
  standalone: true,
  imports: [LucideAngularModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span role="img" [attr.aria-label]="ariaLabel()" [class]="computedClass()">
      @if (hasImage()) {
        <img [src]="src()" [alt]="alt()" class="w-full h-full object-cover" draggable="false" />
      } @else if (computedInitials()) {
        <span aria-hidden="true">{{ computedInitials() }}</span>
      } @else {
        <lucide-angular [img]="userIcon" [size]="lucideSize()" aria-hidden="true" />
      }
    </span>
  `,
})
export class AvatarComponent {
  /** User icon used in the no-initials fallback. */
  protected readonly userIcon = User;

  readonly src = input<string | null>(null);
  readonly alt = input<string>('');
  readonly initials = input<string>('');
  readonly size = input<PiAvatarSize>('md');
  readonly rounded = input<PiAvatarShape>('square');
  readonly ariaLabel = input<string>('Аватар');

  readonly hasImage = computed(() => !!this.src());

  /**
   * Initials priority: explicit `initials()` (trimmed, uppercased,
   * first 2 chars) > derived from `alt()` (first letter of each word,
   * uppercased, joined, first 2 chars) > '' (triggers lucide fallback).
   * `alt().split(/\s+/)` handles multi-space gracefully (no empty
   * tokens in the array).
   */
  readonly computedInitials = computed(() => {
    const explicit = this.initials().trim();
    if (explicit) return explicit.slice(0, 2).toUpperCase();
    const alt = this.alt().trim();
    if (!alt) return '';
    return alt
      .split(/\s+/)
      .filter((s) => s.length > 0)
      .map((s) => s.charAt(0).toUpperCase())
      .slice(0, 2)
      .join('');
  });

  /** Lucide icon size for the `user` fallback (50% of container). */
  readonly lucideSize = computed(() => LUCIDE_SIZE[this.size()]);

  readonly computedClass = computed(
    () => `${BASE_CLASS} ${SIZE_CLASS[this.size()]} ${SHAPE_CLASS[this.rounded()]}`,
  );
}
