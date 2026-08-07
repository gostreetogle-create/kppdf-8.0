import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/**
 * TZ-68 PiPageHeader — editorial page header (compact by default).
 *
 * PO 2026-08-07: no text-5xl «простыни». Use size="display" only on kit demos.
 * Prefer app-pi-page-chrome (crumbs + title) on ERP screens.
 */
@Component({
  selector: 'app-pi-page-header',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="pt-2 pb-4 hairline-b mb-4">
      <p class="eyebrow mb-2">{{ eyebrow() }}</p>
      <h1
        class="font-display font-bold tracking-tight leading-snug break-words"
        [class.text-xl]="size() === 'compact'"
        [class.sm:text-2xl]="size() === 'compact'"
        [class.text-3xl]="size() === 'display'"
        [class.sm:text-4xl]="size() === 'display'"
      >
        {{ title() }}
      </h1>
      @if (subtitle()) {
        <p class="mt-2 font-display text-base text-muted-foreground tracking-tight">
          {{ subtitle() }}
        </p>
      }
      @if (description()) {
        <p class="mt-2 max-w-[58ch] text-sm text-muted-foreground font-body leading-relaxed">
          {{ description() }}
        </p>
      }
      @if (version()) {
        <span class="mt-3 inline-block eyebrow hairline rounded-sm px-2 py-1">
          {{ version() }}
        </span>
      }
      <div class="mt-3 flex flex-wrap gap-2">
        <ng-content select="[header-actions]" />
      </div>
    </header>
  `,
  styles: [
    `
      :host {
        display: block;
      }
    `,
  ],
})
export class PiPageHeaderComponent {
  readonly eyebrow = input.required<string>();
  readonly title = input.required<string>();
  readonly subtitle = input<string>('');
  readonly description = input<string>('');
  readonly version = input<string>('');
  /** compact = ERP default; display = UI-kit showcase only */
  readonly size = input<'compact' | 'display'>('compact');
}
