import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { firstValueFrom, Observable } from 'rxjs';
import { ButtonComponent } from '../../shared/ui/button/button.component';
import { PiDialogComponent } from '../../shared/ui/dialog/pi-dialog.component';
import { PI_DIALOG_DATA, PI_DIALOG_REF } from '../../shared/ui/dialog/dialog.tokens';
import type { DialogRef } from '../../shared/ui/dialog/pi-dialog.service';
import { extractErrorMessage, type SilentResult } from '../../core/silent-http';
import { PiRolesService, type AdminRole } from '../../shared/services/pi-roles.service';
import { roleLabelRu, SYSTEM_ROLE_ORDER, USER_FORM_ROLE_ORDER } from './permission-labels.ru';

export interface RoleOption {
  name: string;
  label: string;
}

const ROLE_PAGE_SIZE = 200;

export interface UserFormData {
  mode: 'create' | 'edit';
  submit?: (result: UserFormResult) => Observable<SilentResult<unknown>>;
  user?: {
    id: string;
    username: string;
    email: string;
    displayName: string;
    role: string;
    isActive: boolean;
  };
}

export interface UserFormResult {
  username: string;
  email?: string;
  displayName?: string;
  role: string;
  password?: string;
  isActive: boolean;
}

/**
 * TZ-257.A.1 §5 — user create/edit form dialog.
 *
 * Create mode adds a `password` field (required); edit mode hides it
 * (password changes go through the dedicated reset-password dialog).
 * Rendered inside `PiDialogComponent` (variant=form) via the
 * `PI_DIALOG_DATA` / `PI_DIALOG_REF` tokens from `PiDialogService.open()`.
 */
@Component({
  selector: 'pi-user-form-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ButtonComponent, PiDialogComponent],
  template: `
    <app-pi-dialog
      [title]="data.mode === 'create' ? 'Новый пользователь' : 'Редактирование пользователя'"
      [width]="'md'"
      variant="form"
      [showClose]="true"
      [animate]="false"
    >
      <div body>
        <div class="user-form">
          <label class="field">
            <span class="field__label">Логин * (уникальный)</span>
            <input
              class="field__input"
              [value]="username()"
              (input)="onUsernameInput($event)"
              autocomplete="off"
              placeholder="латиница, без пробелов"
              data-test="user-form-username"
            />
          </label>

          <label class="field">
            <span class="field__label">ФИО (необязательно)</span>
            <input
              class="field__input"
              [value]="displayName()"
              (input)="onDisplayNameInput($event)"
              autocomplete="off"
              placeholder="Если пусто — покажем логин"
              data-test="user-form-display-name"
            />
          </label>

          <label class="field">
            <span class="field__label">Email (необязательно)</span>
            <input
              class="field__input"
              type="email"
              [value]="email()"
              (input)="onEmailInput($event)"
              autocomplete="off"
              data-test="user-form-email"
            />
          </label>

          @if (data.mode === 'create') {
            <label class="field">
              <span class="field__label">Пароль * (мин. 8 символов)</span>
              <input
                class="field__input"
                type="password"
                [value]="password()"
                (input)="onPasswordInput($event)"
                autocomplete="new-password"
                data-test="user-form-password"
              />
            </label>
          }

          <label class="field">
            <span class="field__label">Роль</span>
            <select
              class="field__input"
              [value]="role()"
              (change)="onRoleChange($event)"
              [disabled]="rolesLoading()"
              data-test="user-form-role"
            >
              @if (rolesLoading()) {
                <option value="user" selected>Загрузка ролей…</option>
              } @else {
                @for (opt of roleOptions(); track opt.name) {
                  <option [value]="opt.name" [selected]="opt.name === role()">
                    {{ opt.label }}
                  </option>
                }
              }
            </select>
            @if (rolesError(); as err) {
              <span class="field__error" data-test="user-form-roles-error">{{ err }}</span>
            }
          </label>

          <label class="field field--inline">
            <input
              type="checkbox"
              class="field__checkbox"
              [checked]="isActive()"
              (change)="onIsActiveChange($event)"
              data-test="user-form-active"
            />
            <span class="field__label field__label--inline">Активен</span>
          </label>

          @if (error()) {
            <p class="field__error" data-test="user-form-error">{{ error() }}</p>
          }
        </div>
      </div>
      <div footer>
        <app-pi-button variant="ghost" size="sm" (click)="onCancel()">Отмена</app-pi-button>
        <app-pi-button
          variant="default"
          size="sm"
          [disabled]="!canSubmit() || submitting()"
          (click)="onSubmit()"
          data-test="user-form-submit"
        >
          {{ submitting() ? 'Сохранение…' : data.mode === 'create' ? 'Создать' : 'Сохранить' }}
        </app-pi-button>
      </div>
    </app-pi-dialog>
  `,
  styles: [
    `
      .user-form {
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

      .field--inline {
        flex-direction: row;
        align-items: center;
        gap: 8px;
      }

      .field__label {
        font-family: 'JetBrains Mono', monospace;
        font-size: 10px;
        font-weight: 500;
        text-transform: uppercase;
        letter-spacing: 0.1em;
        color: var(--color-muted);
      }

      .field__label--inline {
        text-transform: none;
        letter-spacing: 0;
        font-family: inherit;
        font-size: 13px;
        color: var(--color-ink);
      }

      .field__input {
        width: 100%;
        padding: 8px 10px;
        font-size: 13px;
        color: var(--color-ink);
        background: var(--color-paper);
        border: 1px solid var(--color-rule);
        border-radius: 2px;
        outline: none;
        transition: border-color 120ms ease;
      }

      .field__input:focus {
        border-color: var(--color-sunrise-warm);
      }

      .field__checkbox {
        width: 16px;
        height: 16px;
        accent-color: var(--color-sunrise-warm);
      }

      .field__error {
        font-size: 12px;
        color: var(--color-destructive);
        margin: 0;
      }
    `,
  ],
})
export class UserFormDialogComponent {
  readonly data = inject<UserFormData>(PI_DIALOG_DATA);
  private readonly ref = inject<DialogRef<UserFormResult>>(PI_DIALOG_REF);
  private readonly rolesService = inject(PiRolesService);

  /**
   * TZ-ADMIN-306 — role dropdown = live API list (system + custom).
   * Loaded once from `PiRolesService.list` (GET /admin/roles); the value
   * is the role `name` (matches the create-user contract), the label is
   * RU via `roleLabelRu` (system roles) or the custom role `label`.
   */
  protected readonly roleOptions = signal<RoleOption[]>([]);
  protected readonly rolesLoading = signal(true);
  protected readonly rolesError = signal<string | null>(null);

  protected readonly username = signal<string>(this.data.user?.username ?? '');
  protected readonly displayName = signal<string>(this.data.user?.displayName ?? '');
  protected readonly email = signal<string>(this.data.user?.email ?? '');
  protected readonly password = signal<string>('');
  protected readonly role = signal<string>(this.data.user?.role ?? 'user');
  protected readonly isActive = signal<boolean>(this.data.user?.isActive ?? true);
  protected readonly error = signal<string | null>(null);
  protected readonly submitting = signal(false);

  constructor() {
    void this.loadRoles();
  }

  private async loadRoles(): Promise<void> {
    const res = await firstValueFrom(this.rolesService.list({ page: 1, limit: ROLE_PAGE_SIZE }));
    if (res.ok) {
      this.roleOptions.set(mergeRoles(res.data.items, this.role()));
      this.rolesError.set(null);
    } else {
      // Never block the form on a roles-list failure: fall back to
      // the canonical system roles so create/edit still works.
      this.roleOptions.set(
        mergeRoles(
          SYSTEM_ROLE_ORDER.map((name): AdminRole => ({
            id: name,
            name,
            label: name,
            permissions: [],
            isSystem: true,
          })),
          this.role(),
        ),
      );
      this.rolesError.set(extractErrorMessage(res.error));
    }
    // Create: always land on the lowest privilege role after options render
    // (native <select> otherwise often sticks on the first option = admin).
    if (this.data.mode === 'create') {
      this.role.set('user');
    }
    this.rolesLoading.set(false);
  }

  protected onUsernameInput(event: Event): void {
    this.username.set((event.target as HTMLInputElement).value);
  }

  protected onDisplayNameInput(event: Event): void {
    this.displayName.set((event.target as HTMLInputElement).value);
  }

  protected onEmailInput(event: Event): void {
    this.email.set((event.target as HTMLInputElement).value);
  }

  protected onPasswordInput(event: Event): void {
    this.password.set((event.target as HTMLInputElement).value);
  }

  protected onRoleChange(event: Event): void {
    this.role.set((event.target as HTMLSelectElement).value);
  }

  protected onIsActiveChange(event: Event): void {
    this.isActive.set((event.target as HTMLInputElement).checked);
  }

  protected readonly canSubmit = (): boolean => {
    if (this.username().trim().length < 3) return false;
    const email = this.email().trim();
    if (email.length > 0 && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return false;
    if (this.data.mode === 'create' && this.password().length < 8) return false;
    return true;
  };

  protected onSubmit(): void {
    if (this.submitting()) return;
    const email = this.email().trim();
    const displayName = this.displayName().trim();
    const result: UserFormResult = {
      username: this.username().trim().toLowerCase(),
      role: this.role(),
      isActive: this.isActive(),
    };
    if (email) result.email = email;
    if (displayName) result.displayName = displayName;
    if (this.data.mode === 'create') {
      result.password = this.password();
    }
    if (!this.data.submit) {
      this.ref.close(result);
      return;
    }
    this.submitting.set(true);
    this.error.set(null);
    this.data.submit(result).subscribe((res) => {
      if (res.ok) {
        this.submitting.set(false);
        this.ref.close(result);
      } else {
        this.error.set(extractErrorMessage(res.error));
        this.submitting.set(false);
      }
    });
  }

  protected onCancel(): void {
    this.ref.close();
  }
}

/**
 * Build the dropdown option list from the roles API response.
 *
 * - System roles come first in `USER_FORM_ROLE_ORDER` (user → … → admin),
 *   then custom roles sorted by RU label.
 * - The currently selected role is always kept in the list (edit mode
 *   with a deleted/renamed role must still render the current value).
 */
export function mergeRoles(items: AdminRole[], currentRole: string): RoleOption[] {
  const system = new Set(USER_FORM_ROLE_ORDER);
  const known = new Set<string>();
  const options: RoleOption[] = [];

  for (const name of USER_FORM_ROLE_ORDER) {
    const role = items.find((r) => r.name === name);
    const label = role ? roleLabelRu(role.name, role.label) : roleLabelRu(name);
    options.push({ name, label });
    known.add(name);
  }

  const custom = items
    .filter((r) => !system.has(r.name))
    .map((r) => ({ name: r.name, label: roleLabelRu(r.name, r.label) }))
    .sort((a, b) => a.label.localeCompare(b.label, 'ru'));
  for (const opt of custom) {
    options.push(opt);
    known.add(opt.name);
  }

  // Edit-mode safety: a role absent from the API list stays selectable.
  if (currentRole && !known.has(currentRole)) {
    options.push({ name: currentRole, label: currentRole });
  }

  return options;
}
