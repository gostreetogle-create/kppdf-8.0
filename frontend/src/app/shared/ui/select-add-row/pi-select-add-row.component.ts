import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

/**
 * TZ-UI-PLUS-605 — overflow-select + green «+» in one row.
 * Styles live here (not global styles.css) so KP workspace flyouts always match.
 */
@Component({
  selector: 'app-pi-select-add-row',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="pi-select-add-row">
      <ng-content />
      <button
        type="button"
        class="pi-select-add-btn"
        [disabled]="addDisabled()"
        [title]="addTitle()"
        [attr.aria-label]="addAriaLabel() || addTitle()"
        [attr.data-test]="addDataTest()"
        (click)="addClick.emit()"
      >
        +
      </button>
    </div>
  `,
  /* Visual styles for .pi-select-add-btn live in src/styles.css (SoT).
   * Only grid layout rules stay here — scoped to the host. */
  styles: `
    .pi-select-add-row {
      display: grid;
      grid-template-columns: minmax(0, 1fr) auto;
      gap: 0.5rem;
      align-items: end;
      min-width: 0;
      width: 100%;
    }
    .pi-select-add-row > :not(.pi-select-add-btn) {
      grid-column: 1;
      min-width: 0;
    }
    .pi-select-add-btn {
      grid-column: 2;
      align-self: end;
    }
  `,
})
export class PiSelectAddRowComponent {
  readonly addDisabled = input(false);
  readonly addTitle = input('Добавить');
  readonly addAriaLabel = input('');
  readonly addDataTest = input('');
  readonly addClick = output<void>();
}
