import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

/** One segment of the path: last item is current page (no link). */
export type PageCrumb = {
  label: string;
  /** Omit on the current (last) crumb. */
  link?: string;
};

/**
 * Compact page chrome — breadcrumbs (+ optional short H1).
 * List pages: crumbs only (last crumb = page name). No H1 + no `PiSection` «Каталог».
 */
@Component({
  selector: 'app-pi-page-chrome',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  template: `
    <header class="pi-edge-bleed py-2 hairline-b mb-2" data-test="page-chrome">
      @if (crumbs().length > 0) {
        <nav
          class="flex flex-wrap items-baseline gap-1.5 text-xs"
          aria-label="Навигация"
          data-test="page-crumbs"
        >
          @for (c of crumbs(); track $index; let last = $last; let first = $first) {
            @if (!last) {
              @if (c.link) {
                <a
                  [routerLink]="c.link"
                  class="text-muted-foreground hover:text-ink underline decoration-dotted"
                  [attr.data-test]="first ? 'back-button' : null"
                  >{{ c.label }}</a
                >
              } @else {
                <span class="text-muted-foreground">{{ c.label }}</span>
              }
              <span class="text-muted-foreground" aria-hidden="true">/</span>
            } @else {
              <span
                class="font-display text-base tracking-tight text-ink truncate max-w-[min(40rem,70vw)]"
                aria-current="page"
                >{{ c.label }}</span
              >
            }
          }
        </nav>
      }

      @if (title() || description()) {
        <div class="mt-1 flex flex-wrap items-start justify-between gap-2">
          <div class="min-w-0 space-y-0.5">
            @if (title()) {
              <h1
                class="font-display text-lg tracking-tight text-ink leading-snug m-0 break-words"
                data-test="page-chrome-title"
              >
                {{ title() }}
              </h1>
            }
            @if (description()) {
              <p class="text-xs text-muted-foreground max-w-[58ch] m-0 leading-relaxed">
                {{ description() }}
              </p>
            }
          </div>
          <div class="flex flex-wrap items-center gap-2 shrink-0" data-test="page-chrome-actions">
            <ng-content select="[actions]" />
          </div>
        </div>
      } @else {
        <div class="flex flex-wrap items-center gap-2" data-test="page-chrome-actions">
          <ng-content select="[actions]" />
        </div>
      }
    </header>
  `,
})
export class PiPageChromeComponent {
  readonly crumbs = input<readonly PageCrumb[]>([]);
  readonly title = input<string>('');
  readonly description = input<string>('');
}
