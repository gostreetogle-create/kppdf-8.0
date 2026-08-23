import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  viewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';
import { LucideAngularModule, ChevronDown } from 'lucide-angular';
import type { PermissionKey } from '../../../core/capabilities/capabilities.metadata';

/** Lucide icon structural type. */
type LucideIcon = typeof ChevronDown;

import { MenuTriggerDirective } from './pi-menu-trigger.directive';
import { DropdownMenuComponent, type DropdownMenuItem } from './pi-dropdown-menu.component';

export interface PiNavDropdownItem {
  path: string;
  label: string;
  pageKey?: string;
  icon?: LucideIcon;
  disabled?: boolean;
  separatorLabel?: string;
  capabilities?: readonly PermissionKey[];
}

/**
 * Paper & Ink categorized top-bar nav dropdown — single level only.
 *
 *   <app-pi-nav-dropdown
 *      [label]="'Каталог'"
 *      [icon]="PackageIcon"
 *      [items]="[...]"
 *      [active]="isCatalogActive"
 *      [ariaLabel]="'Каталог'"
 *   />
 *
 * Uses <app-pi-dropdown-menu> for the overlay content — no inline menu chrome.
 * Items are converted from PiNavDropdownItem[] → DropdownMenuItem[] via a computed.
 *
 * Standalone + OnPush + signal-based.
 */
@Component({
  selector: 'app-pi-nav-dropdown',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [LucideAngularModule, MenuTriggerDirective, DropdownMenuComponent],
  host: {
    '[class.contents]': 'compact()',
  },
  template: `
    <button
      type="button"
      piDropdownTrigger
      class="inline-flex items-center justify-center rounded-sm
             transition-colors pi-focus-ring cursor-pointer hairline"
      [class.flex-col]="compact()"
      [class.gap-px]="compact()"
      [class.gap-1]="!compact()"
      [class.h-10]="compact()"
      [class.w-full]="compact()"
      [class.px-1.5]="compact()"
      [class.py-1]="compact()"
      [class.px-3]="!compact()"
      [class.py-1.5]="!compact()"
      [class.text-sm]="!compact()"
      [class.bg-sunrise-warm]="active()"
      [class.text-on-gold]="active()"
      [class.border-sunrise-warm]="active()"
      [class.text-ink]="!active()"
      [class.hover:bg-paper-2]="!active()"
      [attr.aria-label]="ariaLabel() || label() + ' (открыть меню)'"
      [attr.title]="label()"
      aria-haspopup="menu"
    >
      <lucide-angular
        [img]="icon()"
        [size]="compact() ? 12 : 15"
        class="opacity-90 shrink-0"
        aria-hidden="true"
      />
      @if (!compact()) {
        <span>{{ label() }}</span>
        <lucide-angular
          [img]="chevronIcon"
          [size]="11"
          class="opacity-60 ml-0.5"
          aria-hidden="true"
        />
      } @else {
        <span
          class="block w-full text-center text-[11px] leading-none
                 font-medium whitespace-nowrap"
          aria-hidden="true"
        >
          {{ shortLabel() || label() }}
        </span>
        <span class="sr-only">{{ label() }}</span>
      }
      <ng-template #piDropdownContent>
        <app-pi-dropdown-menu [items]="menuItems()" [ariaLabel]="ariaLabel() || label()" />
      </ng-template>
    </button>
  `,
})
export class PiNavDropdownComponent {
  readonly label = input.required<string>();
  readonly shortLabel = input<string>('');
  readonly icon = input.required<LucideIcon>();
  readonly items = input.required<readonly PiNavDropdownItem[]>();
  readonly active = input<boolean>(false);
  readonly ariaLabel = input<string>('');
  readonly compact = input<boolean>(false);

  protected readonly chevronIcon: LucideIcon = ChevronDown;

  /** Convert PiNavDropdownItem[] → DropdownMenuItem[] for the shared menu component. */
  protected readonly menuItems = computed<DropdownMenuItem[]>(() =>
    this.items().map((item) => ({
      label: item.label,
      href: item.disabled ? undefined : item.path,
      icon: item.icon,
      disabled: item.disabled,
      separatorLabel: item.separatorLabel,
    })),
  );

  private readonly router = inject(Router);
  private readonly trigger = viewChild(MenuTriggerDirective);

  constructor() {
    this.router.events
      .pipe(
        filter((e): e is NavigationEnd => e instanceof NavigationEnd),
        takeUntilDestroyed(),
      )
      .subscribe(() => {
        const t = this.trigger();
        if (t?.isOpen()) {
          t.close();
        }
      });
  }
}
