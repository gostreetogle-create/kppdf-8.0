import { ChangeDetectionStrategy, Component, input } from '@angular/core';

export type PiFormSectionTone = 'gold' | 'neutral' | 'dimensions' | 'default';

/** Shared Material-style grouping primitive for form-dialog content. */
@Component({
  selector: 'app-pi-form-section',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section
      [class]="sectionClasses()"
      [attr.aria-labelledby]="headingId()"
      [attr.data-test]="'form-section-' + headingId()"
    >
      <p [id]="headingId()" class="text-sm font-medium text-ink m-0">{{ title() }}</p>
      <ng-content />
    </section>
  `,
})
export class PiFormSectionComponent {
  readonly title = input.required<string>();
  readonly headingId = input.required<string>();
  readonly tone = input<PiFormSectionTone>('default');

  protected sectionClasses(): string {
    const base = 'space-y-2 rounded-sm p-4';
    switch (this.tone()) {
      case 'gold':
        return `${base} bg-paper-2/40 border-l-[3px] border-l-gold`;
      case 'neutral':
        return `${base} bg-paper hairline border-l-[3px] border-l-ink/25`;
      case 'dimensions':
        return `${base} bg-paper-2/30 border-l-[3px] border-l-sunrise-warm hairline-t`;
      default:
        return base;
    }
  }
}
