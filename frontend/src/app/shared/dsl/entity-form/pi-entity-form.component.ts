import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { FormGroup } from '@angular/forms';
import { map } from 'rxjs/operators';

import { PiDialogComponent } from '../../ui/dialog/pi-dialog.component';
import { ButtonComponent } from '../../ui/button/button.component';
import { DialogRef } from '../../ui/dialog/pi-dialog.service';
import { PI_DIALOG_DATA, PI_DIALOG_REF } from '../../ui/dialog/dialog.tokens';
import { PiToastService } from '../../ui/toast';
import { extractErrorMessage } from '../../../core/silent-http';

import { SubmitGuard } from '../submit-guard';
import { EntityMutator } from './entity-mutator';

/**
 * `<pi-entity-form>` — generic create/edit dialog wrapper for
 * canonical 5-CRUD entities.
 *
 * Eliminates ~80% of the boilerplate previously duplicated across
 * 10 form-dialog components:
 *  - SubmitGuard orchestration (debounce + in-flight dedup)
 *  - `submitting` / `formError` signal management
 *  - Success toast on save / error toast + inline error on failure
 *  - Cancel + submit button rendering + `[disabled]` toggling
 *  - DialogRef.close() with the saved entity on success
 *
 * **The dialog (parent) provides:**
 *  - `FormGroup` construction (its own validators, masking, etc.)
 *  - Form template via ng-content projection (`[fields]` slot)
 *  - `payloadFn` — pure mapping from `formGroup.getRawValue()` to
 *    the entity-specific shape the mutator expects (e.g. coalescing
 *    empty strings to `undefined`, transforming WorkTypeInModule etc.)
 *
 * **The wrapper provides (built-in safety / UX):**
 *  1. **SubmitGuard-guarded save** — wired at submit time, prevents
 *     rapid double-click duplicates reaching the backend. The dialog's
 *     own `submitting()` signal is the UI-level lock; SubmitGuard is
 *     the network-level lock.
 *  2. **Derived `valid` signal** — `toSignal(formGroup().statusChanges)`
 *     so the submit button disables as soon as the form becomes
 *     invalid (rather than the parent having to construct a
 *     `computed(() => form.valid)` boilerplate per dialog).
 *  3. **POST vs PATCH auto-resolution** — derived from `isEdit()`
 *     and `data._id` presence. The mutator's `.create()` or
 *     `.update()` is invoked automatically.
 *  4. **Toast on success / fail** — wrapping `PiToastService` so
 *     dialogs don't need to inject it.
 *  5. **Inline `errorMessage()` signal** — exposed so the dialog
 *     can project it via `[fields]` projection if it wants inline
 *     error rendering (otherwise the wrapper default rendering at
 *     end of form fields is used).
 *  6. **`saved` + `cancelled` outputs** — allow parent to intercept
 *     without owning DialogRef. Useful for pages that want to do
 *     extra side-effects (e.g. analytics) after save.
 *
 * **FormArray subsumption:** the wrapper has no specific awareness
 * of FormArrays. The parent provides the full FormGroup (which may
 * contain a FormArray as a child control) and the entire form HTML
 * via the `[fields]` slot. For FormArray UI (e.g. ModuleFormDialog's
 * workTypes[] row tracker), the parent owns the `@for` loop.
 *
 * **Built-in dialog close:** on success, the wrapper calls
 * `ref.close(savedEntity)`. On cancel, it calls `ref.close(null)`.
 * Pages that `dialog.open()` the dialog receive the result via
 * `afterClosed()` — no additional wiring needed.
 *
 * **Usage:**
 * ```ts
 * @Component({
 *   template: `
 *     <app-pi-entity-form
 *       [mutator]="mutator"
 *       [endpoint]="'work-types'"
 *       [title]="isEdit ? 'Редактировать вид работ' : 'Создать вид работ'"
 *       [formGroup]="form"
 *       [payloadFn]="getPayload"
 *       [isEdit]="isEdit"
 *       [createSuccessMessage]="'Вид работ создан'"
 *       [updateSuccessMessage]="'Вид работ обновлён'"
 *     >
 *       <app-pi-form-field label="Название" ... fields> ... </app-pi-form-field>
 *     </app-pi-entity-form>
 *   `,
 * })
 * export class WorkTypeFormDialogComponent {
 *   protected readonly mutator = inject(WorkTypesService);
 *   protected readonly data = inject<WorkType | null>(PI_DIALOG_DATA);
 *   protected readonly form = this.fb.group({ ... });
 *   protected readonly getPayload = (): Partial<WorkType> => {
 *     const v = this.form.getRawValue();
 *     return { name: v.name, ... };
 *   };
 * }
 * ```
 *
 * Non-goals (out of scope):
 *  - Auto-save / draft persistence. Forms are dispatched on submit.
 *  - Inline edit (click-to-edit on a table row). Use a separate
 *    `pi-inline-edit` component if needed.
 *  - Multi-step wizards / steppers. The wrapper renders a single
 *    flat form. For wizards, composability is up to the parent.
 *  - Custom button labels per action (e.g. "Publish" vs "Save").
 *    Set `[saveLabel]` + `[createLabel]` strings.
 */
@Component({
  selector: 'app-pi-entity-form',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PiDialogComponent, ButtonComponent],
  template: `
    <app-pi-dialog [title]="title()" [width]="width()">
      <form
        body
        [formGroup]="formGroup()"
        (ngSubmit)="onSubmit()"
        class="space-y-form-field overflow-y-auto min-h-0"
        data-test="entity-form"
      >
        <ng-content select="[fields]" />

        @if (errorMessage()) {
          <p role="alert" class="text-xs text-destructive" data-test="entity-form-error">
            {{ errorMessage() }}
          </p>
        }

        <button type="submit" hidden aria-hidden="true"></button>
      </form>

      <div footer class="flex gap-3">
        <ng-content select="[footerExtras]" />

        <app-pi-button
          variant="ghost"
          type="button"
          (click)="onCancel()"
          data-test="cancel-button"
        >
          Отмена
        </app-pi-button>

        <app-pi-button
          variant="default"
          type="button"
          [disabled]="!valid() || submitting()"
          (click)="onSubmit()"
          data-test="submit-button"
        >
          {{ submitting() ? 'Сохранение…' : isEdit() ? saveLabel() : createLabel() }}
        </app-pi-button>
      </div>
    </app-pi-dialog>
  `,
})
export class PiEntityFormComponent<T extends { _id?: string }> {
  // ─── Required inputs ─────────────────────────────────────────────
  readonly mutator = input.required<EntityMutator<T>>();
  readonly endpoint = input.required<string>();
  readonly title = input.required<string>();
  readonly formGroup = input.required<FormGroup>();
  /**
   * Parent-supplied payload mapper: `formValue → API payload shape`.
   *
   * **Double-call discipline:** Because Angular's `InputSignal` stores
   * the parent's function reference verbatim, calling the input via
   * Angular signal convention (`this.payloadFn()`) returns the stored
   * function, NOT the value the function produces. Callers must invoke
   * it twice — `this.payloadFn()()` — to actually execute the parent's
   * mapper. This couples concretely to Angular framework internals;
   * TZ-G.2 will refactor to a non-Angular-callable plain-field pattern
   * if the smell compounds across the remaining 7 dialog migrations.
   */
  readonly payloadFn = input.required<() => Partial<T>>();
  /** formGroup().valid — computed continuously from statusChanges. */
  readonly createSuccessMessage = input.required<string>();
  readonly updateSuccessMessage = input.required<string>();

  // ─── Optional inputs ─────────────────────────────────────────────
  readonly isEdit = input<boolean>(false);
  readonly width = input<'sm' | 'md' | 'lg'>('md');
  readonly saveLabel = input<string>('Сохранить');
  readonly createLabel = input<string>('Создать');

  // ─── Outputs ─────────────────────────────────────────────────────
  readonly saved = output<T>();
  readonly cancelled = output<void>();

  // ─── Internal state ──────────────────────────────────────────────
  private readonly destroyRef = inject(DestroyRef);
  private readonly ref = inject<DialogRef<T | null>>(PI_DIALOG_REF);
  private readonly data = inject<T | null>(PI_DIALOG_DATA);
  private readonly toast = inject(PiToastService);
  private readonly guard = inject(SubmitGuard);

  protected readonly submitting = signal<boolean>(false);
  protected readonly errorMessage = signal<string | null>(null);

  /**
   * Continuously tracks the form's validity via `statusChanges`.
   * Initial value is the form's current validity (so the submit
   * button starts in the right state on first render before any
   * status change has had a chance to emit).
   *
   * Why `toSignal` instead of `computed(() => form.valid)`?
   * `computed` would not re-read `form.valid` on every CD cycle —
   * signals only track via their reactive graph, and a function call
   * into `form.valid` is not a signal read. `toSignal` on
   * `statusChanges` makes the validity a true signal.
   */
  protected readonly valid = toSignal(
    this.formGroup().statusChanges.pipe(
      map(() => this.formGroup().valid),
      takeUntilDestroyed(this.destroyRef),
    ),
    { initialValue: this.formGroup().valid },
  );

  /** Convenience: id of the entity being edited (null on create). */
  protected readonly id = computed<string | null>(() => {
    const data = this.data;
    return data && typeof data === 'object' && '_id' in data
      ? String(data._id)
      : null;
  });

  // ─── Event handlers ──────────────────────────────────────────────
  protected async onSubmit(): Promise<void> {
    if (this.submitting()) return;
    if (!this.valid()) {
      this.formGroup().markAllAsTouched();
      return;
    }

    // InputSignal stores the parent's payloadFn function reference;
    // first invocation reads the stored function, second invokes it.
    const payload: Partial<T> = this.payloadFn()();
    const id = this.id();
    const isEdit = this.isEdit() && id !== null;
    const method = isEdit ? 'PATCH' : 'POST';
    const url = isEdit ? `${this.endpoint()}/${id}` : this.endpoint();
    const formKey = id ?? 'new';

    this.submitting.set(true);
    this.errorMessage.set(null);

    // SubmitGuard protects against rapid double-clicks racing the
    // button-disable; the dialog's submitting() signal is the UI
    // level. `debounceMs: 0` so the fetcher fires immediately on
    // the first click — the wrapper's submitting() guard already
    // prevents the second click from reaching here.
    const op = isEdit
      ? this.mutator().update(id, payload)
      : this.mutator().create(payload);

    const result = await this.guard.guard<T>({
      formKey,
      url,
      method,
      debounceMs: 0,
      fetcher: () => op,
    });

    this.submitting.set(false);

    if (result.ok) {
      this.toast.success(
        isEdit ? this.updateSuccessMessage() : this.createSuccessMessage(),
      );
      this.saved.emit(result.data);
      this.ref.close(result.data);
      return;
    }

    const msg = extractErrorMessage(result.error);
    this.errorMessage.set(msg);
    this.toast.error(msg);
  }

  protected onCancel(): void {
    this.cancelled.emit();
    this.ref.close(null);
  }
}
