import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';

export type PiBadgeVariant = 'default' | 'secondary' | 'outline' | 'destructive';
export type PiBadgeSize = 'sm' | 'md';

/* TZ-96: Design Reference alignment — semi-transparent bg + border tint pattern */
const VARIANT_CLASS: Record<PiBadgeVariant, string> = {
  default: 'bg-gold/10 border border-gold/20 text-gold',
  secondary: 'bg-green-500/10 border border-green-500/20 text-green-700',
  outline: 'bg-surface-container border border-rule text-muted-foreground',
  destructive: 'bg-destructive/10 border border-destructive/20 text-destructive',
};

const SIZE_CLASS: Record<PiBadgeSize, string> = {
  sm: 'px-1.5 py-0.5 text-[10px]',
  md: 'px-2 py-1 text-xs',
};

const BASE_CLASS =
  'inline-flex items-center gap-1 rounded-sm ' + 'font-mono uppercase tracking-wider';

/**
 * Paper & Ink editorial Badge.
 * 4 variants × 2 sizes. Optional Lucide icon (left via <i-lucide global>)
 * and pulsing dot. `icon` is default '' (never null) so the template
 * binding [name]="icon()" stays string-compatible with i-lucide's input
 * type without nullable coercion.
 *
 * TZ-94 §C.2 alignment: all 4 variants use `bg-transparent hairline`
 * (no solid fills). The variant color decides emphasis through BORDER +
 * TEXT color, never through solid fill — this matches the hairline-first
 * convention (TZ-AUDIT-8) and editorial restraint. See `tasks/TZ-94.md`
 * for the full architectural rationale + variant merge decision
 * (`outline` and `secondary` are visually merged by design; `outline`
 * is kept as an API alias for backward compatibility).
 */
@Component({
  selector: 'app-pi-badge',
  standalone: true,
  imports: [LucideAngularModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span [class]="computedClass()">
      @if (icon()) {
        <i-lucide [name]="icon()" [size]="12"></i-lucide>
      }
      @if (dot()) {
        <span
          class="block w-1.5 h-1.5 rounded-sm bg-current opacity-80 animate-pulse"
          aria-hidden="true"
        ></span>
      }
      <ng-content></ng-content>
    </span>
  `,
})
export class BadgeComponent {
  readonly variant = input<PiBadgeVariant>('default');
  readonly size = input<PiBadgeSize>('sm');
  readonly icon = input<string>('');
  readonly dot = input<boolean>(false);

  readonly computedClass = computed(() => {
    const variant = this.variant();
    const size = this.size();
    return [BASE_CLASS, VARIANT_CLASS[variant], SIZE_CLASS[size]].join(' ');
  });
}
