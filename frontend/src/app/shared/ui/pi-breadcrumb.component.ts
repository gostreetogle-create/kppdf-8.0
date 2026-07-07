import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/**
 * Paper & Ink Breadcrumb container — mono typographic path.
 */
@Component({
  selector: 'app-pi-breadcrumb',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <nav
      role="navigation"
      [attr.aria-label]="ariaLabel()"
      class="flex items-center gap-1 font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground"
    >
      <ng-content />
    </nav>
  `,
})
export class BreadcrumbComponent {
  readonly ariaLabel = input<string>('Навигация');
}
