import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/**
 * Paper & Ink BreadcrumbItem — single segment in <app-pi-breadcrumb>.
 * Current (last) item gets aria-current="page" + ink color (no chevron after).
 * Other items render as <a> link with chevron-right glyph separator.
 */
@Component({
  selector: 'app-pi-breadcrumb-item',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (current()) {
      <!-- Current item is purely informational; no role="link" (axe
           aria-command-name: a span without href claiming role="link"
           is flagged as missing accessible name + non-interactive link). -->
      <span
        aria-current="page"
        class="text-ink font-medium"
      ><ng-content /></span>
    } @else {
      <a
        [href]="href()"
        class="text-muted-foreground hover:text-ink underline-offset-4 hover:underline transition-colors"
      >
        <ng-content />
      </a>
      <span aria-hidden="true" class="text-muted-foreground mx-1">›</span>
    }
  `,
})
export class BreadcrumbItemComponent {
  readonly href = input<string>('');
  readonly current = input<boolean>(false);
}
