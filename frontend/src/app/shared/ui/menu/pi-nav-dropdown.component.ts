import { ChangeDetectionStrategy, Component, inject, input, viewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { filter } from 'rxjs/operators';
import { LucideAngularModule, ChevronDown } from 'lucide-angular';
import type { PermissionKey } from '../../../core/capabilities/capabilities.metadata';

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
  /**
   * Optional page ACL key (TZ-ACCESS-301). Used by AppLayout for capability
   * filtering; omitted items stay visible at the nav-item level.
   */
  pageKey?: string;
  /**
   * TZ-PRODUCTS-301 — optional per-item Lucide icon rendered before the label
   * (e.g. `Palette` for the «Цвета» dictionary). Backward compatible: when
   * omitted the item renders as a plain text row (existing consumers unchanged).
   */
  icon?: LucideIcon;
  /** When true, item is rendered muted/disabled with title='скоро' tooltip. */
  disabled?: boolean;
  /**
   * TZ-DICT-303: optional group separator rendered ABOVE this item.
   * Renders as a non-interactive eyebrow label dividing sections.
   */
  separatorLabel?: string;
  /**
   * TZ-256 §ШАГ 3 — Optional OR-list of canonical permission keys.
   * When omitted (or empty) the item is publicly visible inside the
   * nav dropdown (caller is responsible for capability filtering at
   * the route level). When set, AppLayoutComponent filters the item
   * out unless `CapabilitiesService.hasAny(keys) === true`.
   *
   * OR semantics — at least one key match required.
   */
  capabilities?: readonly PermissionKey[];
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
      class="inline-flex items-center justify-center gap-1 rounded-sm
             transition-colors pi-focus-ring cursor-pointer hairline"
      [class.size-9]="compact()"
      [class.px-3]="!compact()"
      [class.py-1.5]="!compact()"
      [class.text-sm]="!compact()"
      [class.bg-sunrise-warm]="active()"
      [class.text-paper]="active()"
      [class.border-sunrise-warm]="active()"
      [class.text-ink]="!active()"
      [class.hover:bg-paper-2]="!active()"
      [attr.aria-label]="ariaLabel() || label() + ' (открыть меню)'"
      [attr.title]="label()"
      aria-haspopup="menu"
    >
      <lucide-angular [img]="icon()" [size]="15" class="opacity-90" aria-hidden="true" />
      @if (!compact()) {
        <span>{{ label() }}</span>
        <lucide-angular
          [img]="chevronIcon"
          [size]="11"
          class="opacity-60 ml-0.5"
          aria-hidden="true"
        />
      } @else {
        <span class="sr-only">{{ label() }}</span>
      }
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
  /**
   * TZ-UX-301 — icon-first trigger (title + aria-label); label text hidden.
   * Default false keeps kit/demo menus with visible labels.
   */
  readonly compact = input<boolean>(false);

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
