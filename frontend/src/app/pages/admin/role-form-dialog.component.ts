import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { ButtonComponent } from '../../shared/ui/button/button.component';
import { PiDialogComponent } from '../../shared/ui/dialog/pi-dialog.component';
import { PI_DIALOG_DATA, PI_DIALOG_REF } from '../../shared/ui/dialog/dialog.tokens';
import type { DialogRef } from '../../shared/ui/dialog/pi-dialog.service';

export interface RoleFormData {
  mode: 'create' | 'edit';
  role?: {
    id: string;
    name: string;
    label: string;
    description?: string;
    permissions: string[];
  };
}

export interface RoleFormResult {
  name: string;
  label: string;
  description?: string;
  permissions: string[];
}

/**
 * TZ-256.B — role create/edit form dialog.
 *
 * Create mode requires `name` (lowercase slug); edit mode keeps the
 * original name (renaming would cascade `user.role` updates and is
 * intentionally not offered in the admin UI — PATCH still accepts it
 * for API completeness, but the dialog locks the field).
 * Rendered inside `PiDialogComponent` (variant=form) via the
 * `PI_DIALOG_DATA` / `PI_DIALOG_REF` tokens from `PiDialogService.open()`.
 */
@Component({
  selector: 'pi-role-form-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ButtonComponent, PiDialogComponent],
  template: `
    <app-pi-dialog
      [title]="data.mode === 'create' ? 'Новая роль' : 'Редактирование роли'"
      [width]="'md'"
      variant="form"
      [showClose]="true"
      [animate]="false"
    >
      <div body>
        <div class="role-form">
          <label class="field">
            <span class="field__label">Системное имя</span>
            <input
              class="field__input"
              [value]="name()"
              [disabled]="data.mode === 'edit'"
              (input)="name.set(($event.target as HTMLInputElement).value)"
              autocomplete="off"
              spellcheck="false"
              data-test="role-form-name"
            />
            @if (data.mode === 'create') {
              <span class="field__hint">строчные a–z, цифры, «_», «-» (мин. 2 символа)</span>
            }
          </label>

          <label class="field">
            <span class="field__label">Название</span>
            <input
              class="field__input"
              [value]="label()"
              (input)="label.set(($event.target as HTMLInputElement).value)"
              autocomplete="off"
              data-test="role-form-label"
            />
          </label>

          <label class="field">
            <span class="field__label">Описание</span>
            <input
              class="field__input"
              [value]="description()"
              (input)="description.set(($event.target as HTMLInputElement).value)"
              autocomplete="off"
              data-test="role-form-description"
            />
          </label>

          <label class="field">
            <span class="field__label">Permissions (через запятую)</span>
            <textarea
              class="field__input field__textarea"
              [value]="permissionsText()"
              (input)="permissionsText.set(($event.target as HTMLTextAreaElement).value)"
              rows="4"
              spellcheck="false"
              data-test="role-form-permissions"
            ></textarea>
            <span class="field__hint">например: orders.read, orders.write, report.export</span>
          </label>

          @if (error()) {
            <p class="field__error" data-test="role-form-error">{{ error() }}</p>
          }
        </div>
      </div>
      <div footer>
        <app-pi-button variant="ghost" size="sm" (click)="onCancel()">Отмена</app-pi-button>
        <app-pi-button
          variant="default"
          size="sm"
          [disabled]="!canSubmit()"
          (click)="onSubmit()"
          data-test="role-form-submit"
        >
          {{ data.mode === 'create' ? 'Создать' : 'Сохранить' }}
        </app-pi-button>
      </div>
    </app-pi-dialog>
  `,
  styles: [
    `
      .role-form {
        display: flex;
        flex-direction: column;
        gap: 16px;
        padding: 4px 0;
      }

      .field {
        display: flex;
        flex-direction: column;
        gap: 6px;
      }

      .field__label {
        font-family: 'JetBrains Mono', monospace;
        font-size: 10px;
        font-weight: 500;
        text-transform: uppercase;
        letter-spacing: 0.1em;
        color: var(--color-muted, #7f7663);
      }

      .field__hint {
        font-size: 11px;
        color: var(--color-muted-foreground, #8a8172);
      }

      .field__input {
        width: 100%;
        padding: 8px 10px;
        font-size: 13px;
        color: var(--color-ink, #191c1d);
        background: var(--color-paper, #f8f9fa);
        border: 1px solid var(--color-rule, #d0c5af);
        border-radius: 2px;
        outline: none;
        transition: border-color 120ms ease;
        font-family: inherit;
      }

      .field__input:focus {
        border-color: var(--color-sunrise-warm, #735c00);
      }

      .field__input:disabled {
        opacity: 0.55;
        cursor: not-allowed;
      }

      .field__textarea {
        resize: vertical;
        min-height: 72px;
        font-family: 'JetBrains Mono', monospace;
        font-size: 12px;
      }

      .field__error {
        font-size: 12px;
        color: var(--color-destructive, #b91c1c);
        margin: 0;
      }
    `,
  ],
})
export class RoleFormDialogComponent {
  readonly data = inject<RoleFormData>(PI_DIALOG_DATA);
  private readonly ref = inject<DialogRef<RoleFormResult>>(PI_DIALOG_REF);

  protected readonly name = signal<string>(this.data.role?.name ?? '');
  protected readonly label = signal<string>(this.data.role?.label ?? '');
  protected readonly description = signal<string>(this.data.role?.description ?? '');
  protected readonly permissionsText = signal<string>(
    (this.data.role?.permissions ?? []).join(', '),
  );
  protected readonly error = signal<string | null>(null);

  protected readonly canSubmit = (): boolean => {
    const name = this.name().trim();
    if (this.data.mode === 'create' && !/^[a-z][a-z0-9_-]{1,63}$/.test(name)) return false;
    if (this.label().trim().length < 2) return false;
    return true;
  };

  protected onSubmit(): void {
    const permissions = this.permissionsText()
      .split(',')
      .map((p) => p.trim())
      .filter((p) => p.length > 0);
    this.ref.close({
      name: this.data.mode === 'create' ? this.name().trim() : (this.data.role?.name ?? ''),
      label: this.label().trim(),
      description: this.description().trim() || undefined,
      permissions,
    });
  }

  protected onCancel(): void {
    this.ref.close();
  }
}
