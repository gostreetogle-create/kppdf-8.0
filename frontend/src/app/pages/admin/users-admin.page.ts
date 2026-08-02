import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  Injector,
  inject,
  signal,
} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom, Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { API_BASE_URL } from '../../core/api.tokens';
import { CapabilitiesService } from '../../core/capabilities/capabilities.service';
import {
  extractErrorMessage,
  silentDelete,
  silentGet,
  silentPatch,
  silentPost,
  type SilentResult,
} from '../../core/silent-http';
import { PiPageHeaderComponent } from '../../shared/page/pi-page-header.component';
import { ButtonComponent } from '../../shared/ui/button/button.component';
import { PiToastService } from '../../shared/ui/toast';
import { PiDialogService } from '../../shared/ui/dialog/pi-dialog.service';
import { AlertDialogComponent } from '../../shared/ui/dialog/pi-alert-dialog.component';
import { PiRowActionsComponent } from '../../shared/ui/pi-row-actions/pi-row-actions.component';
import { onDialogCloseOnce } from '../../shared/util/on-dialog-close-once';
import {
  UserFormDialogComponent,
  type UserFormData,
  type UserFormResult,
} from './user-form-dialog.component';
import {
  ResetPasswordDialogComponent,
  type ResetPasswordData,
} from './reset-password-dialog.component';

/**
 * TZ-257.A.1 §5 — users-admin page (full mutation surface).
 *
 * Create / edit / reset-password / activate / deactivate / delete with
 * confirmation dialogs, toast feedback, and refresh after every
 * successful mutation. `LAST_ADMIN_INVARIANT` 403 from the backend is
 * surfaced as the user-visible message «Нельзя удалить/понизить
 * последнего админа».
 *
 * All HTTP goes through `silent-*` helpers — the observables never
 * error, so RxJS never logs noise for expected 4xx responses.
 */
interface ClientUser {
  id: string;
  username: string;
  email: string;
  displayName: string;
  role: string;
  isActive: boolean;
  permissions: string[];
  createdAt?: string;
  updatedAt?: string;
}

@Component({
  selector: 'pi-users-admin-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PiPageHeaderComponent, ButtonComponent, PiRowActionsComponent],
  template: `
    <app-pi-page-header
      eyebrow="администрирование"
      title="Пользователи"
      subtitle="Управление учётными записями системы"
      data-testid="users-admin-header"
    />

    <section class="pi-page-frame pi-edge-bleed py-page-y">
      <div class="flex items-center justify-end mb-4">
        @if (caps.hasAny(['user:write'])) {
          <app-pi-button
            variant="default"
            size="sm"
            (click)="onCreate()"
            data-test="users-admin-create"
          >
            Создать пользователя
          </app-pi-button>
        }
      </div>
      @if (loading()) {
        <p class="text-sm text-muted-foreground">Загрузка…</p>
      } @else if (error(); as err) {
        <p class="text-sm text-destructive" data-testid="users-admin-error">{{ err }}</p>
      } @else {
        <table class="pi-table w-full" data-testid="users-admin-table">
          <thead>
            <tr>
              <th class="text-left pi-table-th">Логин</th>
              <th class="text-left pi-table-th">ФИО</th>
              <th class="text-left pi-table-th">Email</th>
              <th class="text-left pi-table-th">Роль</th>
              <th class="text-left pi-table-th">Активен</th>
              <th class="text-left pi-table-th w-64">Действия</th>
            </tr>
          </thead>
          <tbody>
            @for (u of users(); track u.id) {
              <tr class="pi-table-tr">
                <td class="pi-table-td font-mono text-xs">{{ u.username }}</td>
                <td class="pi-table-td">{{ u.displayName }}</td>
                <td class="pi-table-td text-muted-foreground">{{ u.email }}</td>
                <td class="pi-table-td">
                  <span class="font-mono text-xs pi-badge pi-badge-neutral">{{ u.role }}</span>
                </td>
                <td class="pi-table-td">
                  @if (u.isActive) {
                    <span class="pi-badge pi-badge-success">да</span>
                  } @else {
                    <span class="pi-badge pi-badge-warning">нет</span>
                  }
                </td>
                <td class="pi-table-td">
                  <div class="flex items-center justify-end gap-2">
                    @if (loadingRowId() === u.id) {
                      <span
                        class="text-xs text-muted-foreground"
                        role="status"
                        aria-label="Загрузка"
                        data-test="users-admin-row-loading"
                      >
                        Загрузка…
                      </span>
                    }
                    @if (caps.hasAny(['user:admin'])) {
                      <button
                        type="button"
                        class="pi-icon-btn pi-focus-ring"
                        (click)="onResetPassword(u)"
                        [attr.aria-label]="'Сбросить пароль ' + u.username"
                        title="Сбросить пароль"
                        [disabled]="loadingRowId() === u.id"
                        data-test="users-admin-reset-password"
                      >
                        <span aria-hidden="true">⚿</span>
                      </button>
                    }
                    @if (caps.hasAny(['user:write'])) {
                      <button
                        type="button"
                        class="pi-icon-btn pi-focus-ring"
                        (click)="onToggleActive(u)"
                        [attr.aria-label]="
                          u.isActive ? 'Деактивировать ' + u.username : 'Активировать ' + u.username
                        "
                        [title]="u.isActive ? 'Деактивировать' : 'Активировать'"
                        [disabled]="loadingRowId() === u.id"
                        data-test="users-admin-toggle-active"
                      >
                        <span aria-hidden="true">{{ u.isActive ? '⏸' : '▶' }}</span>
                      </button>
                    }
                    <app-pi-row-actions
                      [row]="u"
                      [showEdit]="caps.hasAny(['user:write'])"
                      [showDelete]="caps.hasAny(['user:admin'])"
                      [loading]="loadingRowId() === u.id"
                      editLabel="Редактировать"
                      dataTestEdit="users-admin-edit"
                      deleteLabel="Удалить"
                      dataTestDelete="users-admin-delete"
                      (edit)="onEdit($event)"
                      (delete)="onDelete($event)"
                    />
                  </div>
                </td>
              </tr>
            } @empty {
              <tr>
                <td colspan="6" class="pi-table-td text-center text-muted-foreground py-8">
                  Пользователи не найдены.
                </td>
              </tr>
            }
          </tbody>
        </table>
      }
    </section>
  `,
})
export class UsersAdminPage {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL);
  private readonly toast = inject(PiToastService);
  private readonly dialog = inject(PiDialogService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly injector = inject(Injector);
  protected readonly caps = inject(CapabilitiesService);

  readonly users = signal<ClientUser[]>([]);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly loadingRowId = signal<string | null>(null);

  constructor() {
    void this.refresh();
  }

  private async refresh(): Promise<void> {
    this.loading.set(true);
    try {
      const data = await firstValueFrom(
        silentGet<ClientUser[]>(this.http, `${this.baseUrl}/admin/users?limit=200`),
      );
      if (data.ok) {
        this.users.set(data.data);
        this.error.set(null);
      } else {
        this.error.set(this.describe(data.error));
      }
    } catch (err) {
      this.error.set(this.describe(err));
    } finally {
      this.loading.set(false);
    }
  }

  // ── Create ──
  protected onCreate(): void {
    const ref = this.dialog.open<UserFormResult>(UserFormDialogComponent, {
      data: {
        mode: 'create',
        submit: (result) => this.createUser(result),
      } satisfies UserFormData,
    });
    onDialogCloseOnce(ref, this.injector, () => {
      this.toast.success('Пользователь создан');
      void this.refresh();
    });
  }

  // `refresh` invoked from constructor before dialog service is used; no parentDestroyRef needed there.

  // ── Edit ──
  protected onEdit(u: ClientUser): void {
    const ref = this.dialog.open<UserFormResult>(UserFormDialogComponent, {
      data: {
        mode: 'edit',
        user: {
          id: u.id,
          username: u.username,
          email: u.email,
          displayName: u.displayName,
          role: u.role,
          isActive: u.isActive,
        },
        submit: (result) => this.updateUser(u.id, result),
      } satisfies UserFormData,
      parentDestroyRef: this.destroyRef,
    });
    onDialogCloseOnce(ref, this.injector, () => {
      this.toast.success('Пользователь обновлён');
      void this.refresh();
    });
  }

  // ── Reset password ──
  protected onResetPassword(u: ClientUser): void {
    const ref = this.dialog.open<string>(ResetPasswordDialogComponent, {
      data: {
        username: u.username,
        submit: (newPassword) => this.resetPassword(u.id, newPassword),
      } satisfies ResetPasswordData,
      parentDestroyRef: this.destroyRef,
    });
    onDialogCloseOnce(ref, this.injector, () => {
      this.toast.success('Пароль сброшен');
      void this.refresh();
    });
  }

  // ── Toggle active ──
  protected onToggleActive(u: ClientUser): void {
    const activating = !u.isActive;
    const ref = this.dialog.open<boolean>(AlertDialogComponent, {
      data: {
        title: activating ? 'Активировать пользователя?' : 'Деактивировать пользователя?',
        description: `«${u.displayName || u.username}» будет ${
          activating ? 'активирован' : 'деактивирован'
        }.`,
        confirmLabel: activating ? 'Активировать' : 'Деактивировать',
        variant: activating ? 'default' : 'destructive',
      },
      width: 'sm',
      parentDestroyRef: this.destroyRef,
    });
    onDialogCloseOnce(ref, this.injector, (ok) => {
      if (!ok) return;
      const url = `${this.baseUrl}/admin/users/${u.id}/${activating ? 'activate' : 'deactivate'}`;
      this.silentRun(
        silentPost<ClientUser>(this.http, url, {}),
        activating ? 'Пользователь активирован' : 'Пользователь деактивирован',
        u.id,
      );
    });
  }

  // ── Delete ──
  protected onDelete(u: ClientUser): void {
    const ref = this.dialog.open<boolean>(AlertDialogComponent, {
      data: {
        title: 'Удалить пользователя?',
        description: `«${u.displayName || u.username}» будет удалён. Это действие нельзя отменить.`,
        confirmLabel: 'Удалить',
        variant: 'destructive',
      },
      width: 'sm',
      parentDestroyRef: this.destroyRef,
    });
    onDialogCloseOnce(ref, this.injector, (ok) => {
      if (!ok) return;
      this.silentRun(
        silentDelete<ClientUser>(this.http, `${this.baseUrl}/admin/users/${u.id}`),
        'Пользователь удалён',
        u.id,
      );
    });
  }

  /**
   * Shared mutation runner: toast on success, refresh the table, and
   * map the `LAST_ADMIN_INVARIANT` 403 to the user-visible message.
   */
  private createUser(result: UserFormResult): Observable<SilentResult<ClientUser>> {
    return silentPost<ClientUser>(this.http, `${this.baseUrl}/admin/users`, {
      username: result.username,
      email: result.email,
      displayName: result.displayName,
      password: result.password,
      role: result.role,
      isActive: result.isActive,
    });
  }

  private updateUser(id: string, result: UserFormResult): Observable<SilentResult<ClientUser>> {
    return silentPatch<ClientUser>(this.http, `${this.baseUrl}/admin/users/${id}`, {
      username: result.username,
      email: result.email,
      displayName: result.displayName,
      role: result.role,
      isActive: result.isActive,
    });
  }

  private resetPassword(id: string, newPassword: string): Observable<SilentResult<ClientUser>> {
    this.loadingRowId.set(id);
    return silentPost<ClientUser>(this.http, `${this.baseUrl}/admin/users/${id}/reset-password`, {
      newPassword,
    }).pipe(finalize(() => this.loadingRowId.set(null)));
  }

  private silentRun(
    obs: Observable<SilentResult<ClientUser>>,
    successMsg: string,
    rowId?: string,
  ): void {
    if (rowId && this.loadingRowId() === rowId) return;
    if (rowId) this.loadingRowId.set(rowId);
    obs.subscribe((res) => {
      if (rowId) this.loadingRowId.set(null);
      if (res.ok) {
        this.toast.success(successMsg);
        void this.refresh();
        return;
      }
      if (res.error.status === 403) {
        const body = res.error.error as { code?: string } | null;
        this.toast.error(
          body?.code === 'LAST_ADMIN_INVARIANT'
            ? 'Нельзя удалить/понизить последнего админа'
            : extractErrorMessage(res.error),
        );
        return;
      }
      this.toast.error(extractErrorMessage(res.error));
    });
  }

  private describe(err: unknown): string {
    if (err instanceof Error) return err.message;
    return String(err);
  }
}
