import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

export type DropdownMenuPosition = 'bottom-start' | 'bottom-end' | 'top-start' | 'top-end';

/**
 * Paper & Ink DropdownMenu — vertical contextual list with role="menu".
 * Items use <app-pi-menu-item> children (TZ-55) for keyboard nav.
 */
@Component({
  selector: 'app-pi-dropdown-menu',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      role="menu"
      [attr.aria-label]="ariaLabel()"
      class="bg-paper hairline rounded-sm min-w-[200px] py-1"
    >
      <ng-content select="[item]" />
    </div>
  `,
})
export class DropdownMenuComponent {
  readonly position = input<DropdownMenuPosition>('bottom-start');
  readonly ariaLabel = input<string>('Меню');
  readonly close = output<void>();
}
