import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { LabelComponent } from '../label/label.component';

/**
 * FormField — composition primitive for Paper & Ink.
 * Lays out Label (top), ng-content input, and hint/error (bottom).
 * `error` shadows `hint` when set. `required` toggles Label asterisk.
 *
 * Standalone, OnPush, signal-based.
 */
@Component({
  selector: 'app-pi-form-field',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [LabelComponent],
  template: `
    <div class="flex flex-col gap-1">
      @if (label()) {
        <app-pi-label
          [variant]="required() ? 'required' : 'default'"
          [htmlFor]="htmlFor()"
        >{{ label() }}</app-pi-label>
      }
      <div class="block">
        <ng-content />
      </div>
      @if (error()) {
        <span class="text-xs text-destructive mt-1" role="alert">{{ error() }}</span>
      } @else if (hint()) {
        <span class="text-xs text-muted mt-1">{{ hint() }}</span>
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
