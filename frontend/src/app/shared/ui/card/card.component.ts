import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';

/**
 * Paper & Ink Card — editorial hierarchy primitive.
 *
 * Slots: eyebrow, title, description. Default is static; `interactive`
 * flips on hover and renders `arrow-up-right` lucide icon via the
 * `<i-lucide>` global selector (auto-registered once LucideAngularModule
 * is imported anywhere — single load registers it project-wide for free).
 */
@Component({
  selector: 'app-pi-card',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [LucideAngularModule],
  template: `
    <article [class]="computedClass()">
      @if (eyebrow()) {
        <span class="eyebrow block">{{ eyebrow() }}</span>
      }
      @if (title()) {
        <h3 class="font-display text-lg tracking-tight mt-1 text-ink">{{ title() }}</h3>
      }
      @if (description()) {
        <p class="text-sm text-muted mt-1">{{ description() }}</p>
      }
      <ng-content />
      @if (interactive() && arrow()) {
        <i-lucide
          name="arrow-up-right"
          [size]="14"
          class="card-arrow block mt-2 text-ink"
          aria-hidden="true"
        ></i-lucide>
      }
    </article>
  `,
  styles: [`
    :host { display: block; }
    .card-arrow {
      transition: transform 200ms cubic-bezier(0.4, 0, 0.2, 1);
    }
    article:hover .card-arrow {
      transform: translate(2px, -2px);
    }
  `],
})
export class CardComponent {
  readonly eyebrow = input<string>('');
  readonly title = input<string>('');
  readonly description = input<string>('');
  readonly interactive = input<boolean>(false);
  readonly arrow = input<boolean>(true);

  readonly computedClass = computed(() => {
    const interactive = this.interactive();
    return [
      'block',
      'p-4',
      'bg-paper',
      interactive ? 'cursor-pointer transition-colors hover:bg-paper-2' : '',
      'border',
      'hairline',
      'border-rule',
      'rounded-sm',
    ].filter(Boolean).join(' ');
  });
}
