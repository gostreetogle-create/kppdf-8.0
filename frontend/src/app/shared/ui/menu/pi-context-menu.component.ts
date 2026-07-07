import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

/**
 * Paper & Ink ContextMenu component — same template as DropdownMenu,
 * but no trigger; opened programmatically at cursor position.
 */
@Component({
  selector: 'app-pi-context-menu',
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
export class ContextMenuComponent {
  readonly ariaLabel = input<string>('Контекстное меню');
  readonly close = output<void>();
}
