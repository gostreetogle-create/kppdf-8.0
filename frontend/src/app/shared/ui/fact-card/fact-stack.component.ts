import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/**
 * Section stack of fact cards with an optional title.
 * Canon: docs/pages/ui-fact-card.md (TZ-UX-FACT-301).
 */
@Component({
  selector: 'app-pi-fact-stack',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section
      class="space-y-2"
      [attr.aria-labelledby]="headingId() || null"
      [attr.data-test]="dataTest() || 'pi-fact-stack'"
    >
      @if (title()) {
        <p [id]="headingId() || null" class="pi-label text-ink" data-test="pi-fact-stack-title">
          {{ title() }}
        </p>
      }
      <div class="space-y-2" data-test="pi-fact-stack-body">
        <ng-content />
      </div>
    </section>
  `,
})
export class PiFactStackComponent {
  readonly title = input<string>('');
  readonly headingId = input<string>('');
  readonly dataTest = input<string>('');
}
