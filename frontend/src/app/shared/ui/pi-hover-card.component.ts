import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

/**
 * Paper & Ink HoverCard component — used by pi-hover-card.directive.
 * role="tooltip" (HTMLElement-grade preview, NOT modal).
 */
@Component({
  selector: 'app-pi-hover-card',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      role="tooltip"
      [attr.aria-label]="ariaLabel()"
      class="bg-paper border hairline border-rule rounded-sm px-4 py-3 max-w-[320px] text-sm"
    >
      <ng-content />
    </div>
  `,
})
export class HoverCardComponent {
  readonly ariaLabel = input<string>('');
  readonly close = output<void>();
}
