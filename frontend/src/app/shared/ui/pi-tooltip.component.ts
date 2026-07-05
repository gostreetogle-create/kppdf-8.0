import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

export type TooltipPosition = 'top' | 'bottom' | 'left' | 'right';

/**
 * Paper & Ink Tooltip — inverse ink-on-paper, mono 11px, NO arrow, NO shadow.
 * Used by pi-tooltip.directive via CDK Overlay.
 */
@Component({
  selector: 'app-pi-tooltip',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      role="tooltip"
      [attr.aria-label]="text()"
      class="bg-ink text-paper px-2 py-1 rounded-sm font-mono text-[11px] leading-tight max-w-[240px]"
      style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap;"
    >
      {{ text() }}
    </div>
  `,
})
export class TooltipComponent {
  readonly text = input.required<string>();
  readonly position = input<TooltipPosition>('top');
  readonly hide = output<void>();
}
