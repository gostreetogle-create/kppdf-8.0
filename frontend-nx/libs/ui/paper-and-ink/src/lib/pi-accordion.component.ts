import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/**
 * Paper & Ink Accordion — container for <app-pi-accordion-item> children.
 * Single vs multi expand tracking is left to children (no global state).
 */
@Component({
  selector: 'app-pi-accordion',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="block">
      <ng-content />
    </div>
  `,
})
export class AccordionComponent {
  readonly multi = input<boolean>(true);
}
