import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideAngularModule, ChevronDown } from 'lucide-angular';

/** Structural type matching any Lucide icon (ChevronDown, Package, …). */
type LucideIcon = typeof ChevronDown;

/** Single menu item decoded by <app-pi-dropdown-menu>. */
export interface DropdownMenuItem {
  label: string;
  /** Optional Lucide icon rendered before the label (13px). */
  icon?: LucideIcon;
  /** Optional route link; when set the item is an <a routerLink>. */
  href?: string;
  /** Optional click handler (fires on Enter/click; routerLink takes priority). */
  handler?: () => void;
  /** When true, item is rendered muted/disabled. */
  disabled?: boolean;
  /** Optional group separator rendered ABOVE this item (eyebrow label). */
  separatorLabel?: string;
  /** Custom data-test attribute for the menuitem element. */
  dataTest?: string;
}

/**
 * Paper & Ink DropdownMenu — items-input-driven vertical list with role="menu".
 *
 * Replaces the old ng-content+TemplatePortal design that dropped @for nodes
 * across the CDK Overlay view boundary. Accepts `items: DropdownMenuItem[]`
 * and renders them inline with @for in its own template.
 */
@Component({
  selector: 'app-pi-dropdown-menu',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, LucideAngularModule],
  template: `
    <div
      role="menu"
      [attr.aria-label]="ariaLabel()"
      class="bg-paper hairline rounded-sm min-w-[200px] py-1"
    >
      @for (item of items(); track $index) {
        @if (item.separatorLabel) {
          <span role="separator" class="block px-3 pt-2.5 pb-1 eyebrow opacity-50">
            {{ item.separatorLabel }}
          </span>
        }
        @if (item.disabled) {
          <span
            role="menuitem"
            [attr.aria-disabled]="true"
            [title]="item.label + ' — скоро'"
            [attr.data-test]="item.dataTest"
            class="block px-3 py-1.5 text-sm text-muted-foreground
                   opacity-60 cursor-not-allowed select-none"
          >
            {{ item.label }}
          </span>
        } @else if (item.href) {
          <a
            role="menuitem"
            [routerLink]="item.href"
            [attr.data-test]="item.dataTest"
            class="block px-3 py-1.5 text-sm text-ink
                   hover:bg-paper-2 focus-visible:outline-none
                   focus-visible:bg-paper-2 transition-colors pi-focus-ring
                   cursor-pointer"
          >
            @if (item.icon) {
              <lucide-angular
                [img]="item.icon"
                [size]="13"
                class="opacity-70 mr-1.5 -mt-0.5 inline-block align-middle"
                aria-hidden="true"
              />
            }
            {{ item.label }}
          </a>
        } @else {
          <span
            role="menuitem"
            tabindex="0"
            [attr.data-test]="item.dataTest"
            class="block px-3 py-1.5 text-sm text-ink
                   hover:bg-paper-2 focus-visible:outline-none
                   focus-visible:bg-paper-2 transition-colors pi-focus-ring
                   cursor-pointer"
            (click)="onItemClick(item)"
            (keydown.enter)="onItemClick(item)"
            (keydown.space)="onItemClick(item); $event.preventDefault()"
          >
            @if (item.icon) {
              <lucide-angular
                [img]="item.icon"
                [size]="13"
                class="opacity-70 mr-1.5 -mt-0.5 inline-block align-middle"
                aria-hidden="true"
              />
            }
            {{ item.label }}
          </span>
        }
      }
    </div>
  `,
})
export class DropdownMenuComponent {
  readonly items = input<readonly DropdownMenuItem[]>([]);
  readonly ariaLabel = input<string>('Меню');
  readonly close = output<void>();

  protected onItemClick(item: DropdownMenuItem): void {
    item.handler?.();
    this.close.emit();
  }
}
