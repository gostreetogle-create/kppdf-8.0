import { ChangeDetectionStrategy, Component, inject, input, viewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { filter } from 'rxjs/operators';
import { LucideAngularModule, ChevronDown } from 'lucide-angular';

/**
 * Lucide icon structural type — `lucide-angular@0.460.0` keeps `LucideIconData`
 * internal (private), so we capture the literal shape via `typeof ChevronDown`.
 * All ~2000 lucide icons share this same shape — therefore any icon
 * (`Package`, `Briefcase`, `BookOpen`, …) is assignable to this type.
 */
type LucideIcon = typeof ChevronDown;
import { MenuTriggerDirective } from './pi-menu-trigger.directive';

export interface PiNavDropdownItem {
  /** Route path; either '/products' (exact) or '/products/:id' (via startsWith). */
  path: string;
  /** Visible label inside the dropdown. */
  label: string;
  /** When true, item is rendered muted/disabled with title='скоро' tooltip. */
  disabled?: boolean;
}

/**
 * Paper & Ink categorized top-bar nav dropdown — single level only.
 *
 *   <app-pi-nav-dropdown
 *      [label]="'Каталог'"
 *      [icon]="PackageIcon"
 *      [items]="[
 *         { path: '/products', label: 'Продукция' },
 *         { path: '/modules',  label: 'Модули' },
 *      ]"
 *      [active]="isCatalogActive"
 *      [ariaLabel]="'Каталог'"
 *   />
 *
 * Trigger behaviour:
 *  - Click / Enter / Space / ArrowDown opens
 *  - Escape + outside-pointer close
 *  - Focus returns to trigger on close
 *  - aria-haspopup="menu" + aria-expanded managed by the directive
 *  - Active state (sub-route matched) inverts the trigger to bg-sunrise-warm
 *
 * Standalone + OnPush + signal-based.
 */
@Component({
  selector: 'app-pi-nav-dropdown',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, LucideAngularModule, MenuTriggerDirective],
  template: `
    <button
      type="button"
      piDropdownTrigger
      class="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-sm
             transition-colors pi-focus-ring cursor-pointer"
      [class.bg-sunrise-warm]="active()"
      [class.text-paper]="active()"
      [class.text-ink]="!active()"
      [class.hover:bg-paper-2]="!active()"
      [attr.aria-label]="ariaLabel() || label() + ' (открыть меню)'"
      aria-haspopup="menu"
    >
      <lucide-angular [img]="icon()" [size]="14" class="opacity-80" aria-hidden="true" />
      <span>{{ label() }}</span>
      <lucide-angular
        [img]="chevronIcon"
        [size]="11"
        class="opacity-60 ml-0.5"
        aria-hidden="true"
      />
      <ng-template #piDropdownContent>
        <!--
          Inline menu chrome — bypasses <app-pi-dropdown-menu> wrapper.
          Reason: the previous design used <app-pi-dropdown-menu> with
          <ng-content select="[item]" />, but Angular's CDK Overlay
          TemplatePortal drops @for dynamic nodes across the <ng-content>
          view boundary (browser-use iteration 3: panelCount=1,
          menuItems=[]). Rendering the menu container + items inline in
          the same template avoids the projection entirely; the rendered
          DOM is identical, and MenuTriggerDirective's TemplatePortal
          projects the whole tree atomically.
        -->
        <div
          role="menu"
          [attr.aria-label]="ariaLabel() || label()"
          class="bg-paper hairline rounded-sm min-w-[200px] py-1"
        >
          @for (item of items(); track item.path) {
            @if (item.disabled) {
              <span
                role="menuitem"
                [attr.aria-disabled]="true"
                [title]="item.label + ' — скоро'"
                class="block px-3 py-1.5 text-sm text-muted-foreground
                       opacity-60 cursor-not-allowed select-none"
              >
                {{ item.label }}
              </span>
            } @else {
              <a
                role="menuitem"
                [routerLink]="item.path"
                class="block px-3 py-1.5 text-sm text-ink
                       hover:bg-paper-2 focus-visible:outline-none
                       focus-visible:bg-paper-2 transition-colors pi-focus-ring
                       cursor-pointer"
              >
                {{ item.label }}
              </a>
            }
          }
        </div>
      </ng-template>
    </button>
  `,
})
export class PiNavDropdownComponent {
  readonly label = input.required<string>();
  /** Lucide icon reference — passed in by the layout (e.g. `Package`, `Briefcase`). */
  readonly icon = input.required<LucideIcon>();
  readonly items = input.required<readonly PiNavDropdownItem[]>();
  /** When true, trigger is highlighted bg-sunrise-warm text-paper. */
  readonly active = input<boolean>(false);
  readonly ariaLabel = input<string>('');

  protected readonly chevronIcon: LucideIcon = ChevronDown;

  private readonly router = inject(Router);
  private readonly trigger = viewChild(MenuTriggerDirective);

  constructor() {
    // Auto-close on navigation: clicking <a routerLink> already navigates, but
    // the CDK overlay stays attached until the next outside-pointerdown. This
    // subscriber closes the overlay as soon as the URL changes, so the menu
    // doesn't hang over the new route. takeUntilDestroyed() handles cleanup.
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
