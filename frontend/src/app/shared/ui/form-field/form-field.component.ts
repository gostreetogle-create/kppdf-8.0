import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { LabelComponent } from '../label/label.component';

/**
 * FormField — composition primitive for Paper & Ink.
 * Lays out Label (top), ng-content input, and hint/error (bottom).
 * `error` shadows `hint` when set. `required` toggles Label asterisk.
 *
 * TZ-94 — the inner `<app-pi-label>` defaults to `variant="eyebrow"`.
 * This makes editorial typography (small mono caps) the canonical form
 * label style across the app, replacing the pre-TZ-94 mix of "default"
 * and "required" variants. Combined with the decoupled `required`
 * input on `LabelComponent` (see label.component.ts), form authors
 * get a clean composition:
 *   `<app-pi-form-field label="Email" [required]="true" htmlFor="email">`
 * renders an eyebrow-style "EMAIL *" label without any variant juggling.
 *
 * Standalone, OnPush, signal-based.
 */
@Component({
  selector: 'app-pi-form-field',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [LabelComponent],
  template: `
    <div class="flex flex-col gap-form-row">
      @if (label()) {
        <app-pi-label
          variant="eyebrow"
          [required]="required()"
          [htmlFor]="htmlFor()"
        >{{ label() }}</app-pi-label>
      }
      <div class="block">
        <ng-content />
      </div>
      @if (error()) {
        <span class="text-xs text-destructive" role="alert">{{ error() }}</span>
      } @else if (hint()) {
        <span class="text-xs text-muted-foreground">{{ hint() }}</span>
      }
    </div>
  `,
})
export class FormFieldComponent {
  readonly label = input<string | null>(null);
  readonly hint = input<string | null>(null);
  readonly error = input<string | null>(null);
  readonly required = input<boolean>(false);
  readonly htmlFor = input<string | null>(null);
}
