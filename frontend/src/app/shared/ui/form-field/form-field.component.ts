import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { LabelComponent } from '../label/label.component';

export type FormFieldHintTone = 'default' | 'ai' | 'success' | 'warn';

const HINT_TONE_CLASS: Record<FormFieldHintTone, string> = {
  default: 'text-muted-foreground',
  ai: 'text-hint-ai',
  success: 'text-hint-success',
  warn: 'text-hint-warn',
};

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
 * TZ-UI-DEN-502 — `hintTone` selects semantic hint ink:
 *   - `default` — muted helper text (backward compatible)
 *   - `ai` — AI/suggestion hints (`text-hint-ai`)
 *   - `success` — confirmation hints (`text-hint-success`)
 *   - `warn` — caution hints (`text-hint-warn`)
 * Error line always uses `text-destructive` + `role="alert"`.
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
        <app-pi-label variant="eyebrow" [required]="required()" [htmlFor]="htmlFor()">{{
          label()
        }}</app-pi-label>
      }
      <div class="block">
        <ng-content />
      </div>
      @if (error()) {
        <span class="text-xs text-destructive" role="alert">{{ error() }}</span>
      } @else if (hint()) {
        <span [class]="hintClass()">{{ hint() }}</span>
      }
    </div>
  `,
})
export class FormFieldComponent {
  readonly label = input<string | null>(null);
  readonly hint = input<string | null>(null);
  /** Semantic tone for the hint line. Default = muted; ai/success/warn use density tokens. */
  readonly hintTone = input<FormFieldHintTone>('default');
  readonly error = input<string | null>(null);
  readonly required = input<boolean>(false);
  readonly htmlFor = input<string | null>(null);

  protected readonly hintClass = computed(() => `text-xs ${HINT_TONE_CLASS[this.hintTone()]}`);
}
