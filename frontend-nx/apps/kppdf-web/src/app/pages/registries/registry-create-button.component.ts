import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { LucideAngularModule, Plus } from 'lucide-angular';

/** TZ-NX-REGISTRIES-FULL-CLOSEOUT — icon-only toolbar create (Plus + accent tokens). */
@Component({
  selector: 'pi-registry-create-button',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [LucideAngularModule],
  template: `
    <button
      type="button"
      class="pi-icon-btn registry-icon-btn-accent pi-focus-ring"
      [attr.aria-label]="label()"
      [attr.title]="label()"
      data-test="registry-create"
      (click)="createClick.emit()"
    >
      <lucide-angular [img]="plusIcon" [size]="14" aria-hidden="true" />
    </button>
  `,
  styles: [
    `
      :host {
        display: inline-flex;
      }
      .registry-icon-btn-accent {
        color: var(--color-gold-deep);
        border-color: color-mix(in oklch, var(--color-gold-deep) 50%, var(--color-rule));
        background-color: color-mix(in oklch, var(--color-gold) 12%, var(--color-paper-raised));
        --pi-btn-hover-bg: color-mix(in oklch, var(--color-gold) 22%, var(--color-paper));
        --pi-btn-hover-fg: var(--color-gold-deep);
        --pi-btn-hover-border: var(--color-gold-deep);
      }
    `,
  ],
})
export class RegistryCreateButtonComponent {
  readonly label = input.required<string>();
  readonly createClick = output<void>();

  protected readonly plusIcon = Plus;
}
