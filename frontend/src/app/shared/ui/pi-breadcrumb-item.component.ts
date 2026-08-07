import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

/**
 * Paper & Ink BreadcrumbItem — single segment in <app-pi-breadcrumb>.
 * Prefer routerLink over href (SPA navigation).
 */
@Component({
  selector: 'app-pi-breadcrumb-item',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  template: `
    @if (current()) {
      <span aria-current="page" class="text-ink font-medium"><ng-content /></span>
    } @else {
      @if (link()) {
        <a
          [routerLink]="link()"
          class="text-muted-foreground hover:text-ink underline-offset-4 hover:underline transition-colors"
        >
          <ng-content />
        </a>
      } @else if (href()) {
        <a
          [href]="href()"
          class="text-muted-foreground hover:text-ink underline-offset-4 hover:underline transition-colors"
        >
          <ng-content />
        </a>
      } @else {
        <span class="text-muted-foreground"><ng-content /></span>
      }
      <span aria-hidden="true" class="text-muted-foreground mx-1">›</span>
    }
  `,
})
export class BreadcrumbItemComponent {
  /** SPA route (preferred). */
  readonly link = input<string | null>(null);
  /** Legacy full href; prefer link. */
  readonly href = input<string>('');
  readonly current = input<boolean>(false);
}
