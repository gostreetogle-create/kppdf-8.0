import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';

export type PiBadgeVariant = 'default' | 'secondary' | 'outline' | 'destructive';
export type PiBadgeSize = 'sm' | 'md';

const VARIANT_CLASS: Record<PiBadgeVariant, string> = {
  default: 'bg-sunrise-warm text-paper',
  secondary: 'bg-paper-2 text-ink',
  outline: 'bg-transparent hairline text-ink',
  destructive: 'bg-destructive text-paper',
};

const SIZE_CLASS: Record<PiBadgeSize, string> = {
  sm: 'px-1.5 py-0.5 text-[10px]',
  md: 'px-2 py-1 text-xs',
};

const BASE_CLASS =
  'inline-flex items-center gap-1 rounded-sm ' +
  'font-mono uppercase tracking-wider';

/**
 * Paper & Ink editorial Badge.
 * 4 variants × 2 sizes. Optional Lucide icon (left via <i-lucide global>)
 * and pulsing dot. `icon` is default '' (never null) so the template
 * binding [name]="icon()" stays string-compatible with i-lucide's input
 * type without nullable coercion.
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
