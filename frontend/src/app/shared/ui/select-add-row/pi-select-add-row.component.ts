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
      display: inline-flex;
      flex-shrink: 0;
      align-items: center;
      justify-content: center;
      width: 2.4rem;
      height: 2.25rem;
      margin: 0;
      padding: 0;
      border: 1px solid color-mix(in oklch, var(--color-sunrise-warm) 55%, var(--color-rule));
      border-radius: 4px;
      background: var(--color-sunrise-soft);
      color: var(--color-success);
      font: inherit;
      font-size: var(--text-title);
      font-weight: 700;
      line-height: 1;
      cursor: pointer;
      appearance: none;
      -webkit-appearance: none;
    }
    .pi-select-add-btn:hover:not(:disabled) {
      border-color: color-mix(in oklch, var(--color-sunrise-warm) 80%, var(--color-gold-deep));
      background: color-mix(in oklch, var(--color-sunrise-soft) 55%, var(--color-sunrise-warm));
      color: color-mix(in oklch, var(--color-success) 82%, #000000);
    }
    .pi-select-add-btn:focus-visible {
      outline: none;
      box-shadow: var(--focus-ring-shadow);
    }
    .pi-select-add-btn:disabled {
      opacity: 0.45;
      cursor: not-allowed;
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
