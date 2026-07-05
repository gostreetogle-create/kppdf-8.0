import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
// NOTE: `lucide-angular` is technically deprecated in favour of `@lucide/angular`,
// but `@lucide/angular` v1.x uses a per-icon SVG component model with weird
// attribute selectors — ergonomically worse for our config-driven icon strings.
// We stick with lucide-angular v1.0 API (`LucideAngularModule.pick` + `<lucide-icon [name]>`).
// TODO: re-evaluate when @lucide/angular ships a clean generic icon component.
import { LucideAngularModule } from 'lucide-angular';

/**
 * Wrapper around @lucide/angular's `<lucide-icon>` directive.
 * Replaces emoji-text rendering across the app with professional Lucide icons.
 *
 * ## Usage
 *
 * Decorative:
 * ```html
 * <app-icon name="Package" [size]="20" />
 * ```
 *
 * With custom colour via Tailwind:
 * ```html
 * <app-icon name="LayoutDashboard" class="text-primary" [size]="22" />
 * ```
 *
 * Meaningful (for buttons / links):
 * ```html
 * <app-icon name="Trash2" ariaLabel="Удалить" [size]="16" />
 * ```
 *
 * Icons must be registered globally via `LucideAngularModule.pick(...)` in
 * `app.config.ts`. If an unknown name is passed, the component renders
 * nothing (we deliberately do NOT fall back to a HelpCircle — that would
 * hide configuration mistakes from the developer).
 *
 * Names are the PascalCase icon exports from the `lucide-angular` package.
 * The `pages.config.ts` registry is the canonical mapping for pages.
 */
@Component({
  selector: 'app-icon',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [LucideAngularModule],
  template: `
    <lucide-icon
      [name]="name()"
      [size]="size()"
      [strokeWidth]="strokeWidth()"
      [class]="class()"
      [attr.aria-hidden]="ariaLabel() ? null : 'true'"
      [attr.role]="ariaLabel() ? 'img' : null"
      [attr.aria-label]="ariaLabel()"
    ></lucide-icon>
  `,
  styles: `
    :host {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
  `,
})
export class IconComponent {
  /** PascalCase Lucide icon name matching a registered icon (e.g. `'Package'`). Required. */
  readonly name = input.required<string>();

  /** Icon size in pixels. Default 20 — matches Tailwind's `w-5 h-5`. */
  readonly size = input<number>(20);

  /** Lucide stroke width. Default 1.75 — crisper at small sizes than the default 2. */
  readonly strokeWidth = input<number>(1.75);

  /** Tailwind / CSS class names applied to the underlying `<lucide-icon>`. */
  readonly class = input<string>('');

  /**
   * Accessible label for screen readers. If set, the icon is meaningful
   * (role="img", aria-label="…"). If left null, the icon is treated as
   * decorative (aria-hidden="true").
   */
  readonly ariaLabel = input<string | null>(null);

  /** Resolved icon name — exposed for templates that want to bind by reference. */
  readonly lucideName = computed(() => this.name());
}
