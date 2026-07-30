/**
 * Form i18n — Russian validation messages + errorFor helper.
 *
 * Audit 2 PoC (2026-07-30, deep project audit).
 *
 * Project requirement: no English text in user-facing validation messages.
 * Before this helper existed, every form dialog called `errorFor('field')`
 * inline with hand-written Russian strings (or English strings — leaks).
 *
 * This helper centralizes Russian validation messages in one DSL piece.
 * Forms then use:
 *
 *   <app-pi-form-field
 *     [label]="'Email'"
 *     [control]="form.controls.email"
 *     [error]="formError.errorFor(form.controls.email)"
 *     ...>
 *   </app-pi-form-field>
 *
 * `errorFor()` reads Angular's `AbstractControl.errors` map and picks the
 * first matching key from RU_VALIDATION_MESSAGES. Returns '' when control
 * is untouched/invalid/empty — so messages only appear AFTER user touch.
 *
 * To use in a form dialog:
 * 1. import { FormErrorI18n } from '../../../shared/dsl/form-i18n';
 * 2. in constructor: `protected readonly formError = new FormErrorI18n();`
 * 3. template: `[error]="formError.errorFor(form.controls.X)"`
 *
 * Round 2 of this PoC (optional): if patterns prove valuable, copy this
 * pattern to all 16 form dialogs (currently each writes its own inline
 * messages).
 */
import { Injectable } from '@angular/core';
import type { AbstractControl, ValidationErrors } from '@angular/forms';

type ErrorMessage =
  | string
  | ((params: Record<string, unknown>) => string);

/**
 * Mapping from Angular's `AbstractControl.errors` keys to user-facing
 * Russian strings. Add new validators here, NOT inline in form templates.
 *
 * Keys covered:
 *   required    → standard Validators.required
 *   email       → standard Validators.email
 *   minlength   → standard Validators.minLength(n)
 *   maxlength   → standard Validators.maxLength(n)
 *   pattern     → standard Validators.pattern(regex)
 *   min         → standard Validators.min(n)
 *   max         → standard Validators.max(n)
 *   ruPhone     → custom RU phone pattern (e.g. +7 999 123-45-67)
 *   ruInn       → custom 10/12-digit ИНН pattern
 */
export const RU_VALIDATION_MESSAGES: Readonly<Record<string, ErrorMessage>> = Object.freeze(
  {
    required: 'Обязательное поле',
    email: 'Неверный формат email',
    minlength: (p) => `Минимум ${p['requiredLength']} символов (сейчас ${p['actualLength']})`,
    maxlength: (p) => `Максимум ${p['requiredLength']} символов`,
    pattern: 'Неверный формат',
    min: (p) => `Минимум ${p['min']}`,
    max: (p) => `Максимум ${p['max']}`,
    ruPhone: 'Неверный формат телефона. Ожидается +7 999 123-45-67',
    ruInn: 'ИНН должен содержать 10 или 12 цифр',
  },
);

/**
 * Helper class — pure, no Angular DI deps. Each form dialog instantiates
 * its own OR shares a single instance (stateless, both fine).
 */
@Injectable({ providedIn: 'root' })
export class FormErrorI18n {
  /**
   * Returns the user-facing message for a control's first error, or '' if
   * the control is untouched or has no errors. Skipped keys (untouched
   * state, pristine state) prevent premature yellow-red field highlighting
   * before the user has interacted with the control.
   *
   * @param control Angular `AbstractControl` — typically `form.controls.x`.
   * @param opts.showAlways - if true, return error message even before
   *   touched (useful in dialogs that should highlight required fields
   *   immediately). Default: false (only after touch).
   */
  errorFor(control: AbstractControl | null | undefined, opts: { showAlways?: boolean } = {}): string {
    if (!control || !control.errors) return '';
    if (!opts.showAlways && (control.untouched || control.pristine)) return '';
    const errors: ValidationErrors = control.errors;
    const keys = Object.keys(errors);
    if (keys.length === 0) return '';
    // Convention: report first error in key order (Angular convention).
    const firstKey = keys[0];
    const value = errors[firstKey];
    const format = RU_VALIDATION_MESSAGES[firstKey];
    if (!format) {
      // Unknown validator — surface a generic cue so the developer notes it.
      return `Некорректное значение (${firstKey})`;
    }
    return typeof format === 'function' ? format(value as Record<string, unknown>) : format;
  }

  /**
   * Returns the first failing key name (e.g. 'minlength') WITHOUT the
   * user-facing string. Useful for [attr.data-error]="..." styling hooks.
   */
  firstErrorKey(control: AbstractControl | null | undefined): string {
    if (!control || !control.errors) return '';
    return Object.keys(control.errors)[0] ?? '';
  }
}
