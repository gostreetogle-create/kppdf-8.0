import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  Injector,
  TemplateRef,
  ViewChild,
  inject,
  signal,
  OnInit,
} from '@angular/core';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { AuthService } from '../../core/auth.service';
import { CapabilitiesService } from '../../core/capabilities/capabilities.service';
import { extractErrorMessage, type SilentResult } from '../../core/silent-http';
import { PiGroupWorkspaceComponent } from '../../shared/page/pi-group-workspace.component';
import { ADMIN_ENTITY_SECTION_CHIPS, ADMIN_TOC_CHIPS } from './admin-group-chips';
import { ButtonComponent } from '../../shared/ui/button/button.component';
import { PiToastService } from '../../shared/ui/toast';
import { PiDialogService } from '../../shared/ui/dialog/pi-dialog.service';
import { AlertDialogComponent } from '../../shared/ui/dialog/pi-alert-dialog.component';
import { PiRowActionsComponent } from '../../shared/ui/pi-row-actions/pi-row-actions.component';
import { TableComponent, type ColumnDef } from '../../shared/ui/pi-table.component';
import { PiUsersService, type AdminUser } from '../../shared/services/pi-users.service';
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
 * PiUsersService owns the HTTP transport; this page keeps orchestration,
 * permissions, dialog state, and user-visible result handling.
 */
type ClientUser = AdminUser;
const PAGE_SIZE = 10;

@Component({
  selector: 'pi-users-admin-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PiGroupWorkspaceComponent, ButtonComponent, PiRowActionsComponent, TableComponent],
  template: `
    <app-pi-group-workspace [toc]="toc" tocActiveId="users" [chips]="chips" activeId="">
      <div tools class="flex items-center gap-form-field flex-wrap w-full">
        <input
          type="search"
          class="pi-input w-72"
          [value]="searchQuery()"
          (input)="onSearchInput($event)"
          placeholder="Поиск пользователей…"
          aria-label="Поиск пользователей"
          data-test="users-admin-search"
        />
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
      @if (error(); as err) {
        <p role="alert" class="text-sm text-destructive mb-4" data-testid="users-admin-error">
          {{ err }}
        </p>
      }
      <app-pi-table
        [data]="users()"
        [columns]="cols"
        [loading]="loading()"
        [total]="total()"
        [page]="page()"
        [pageSize]="pageSize"
        [emptyMessage]="searchQuery() ? 'Ничего не найдено.' : 'Пользователи не найдены.'"
        [ariaLabel]="'Список пользователей'"
        [rowActions]="rowActionsTplBinding"
        (pageChange)="onPageChange($event)"
      >
        <ng-template #rowActionsTpl let-u>
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
            @if (caps.hasAny(['user:write']) && !isSelfOwner(u)) {
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
              [showDelete]="caps.hasAny(['user:admin']) && !isSelfOwner(u)"
              [loading]="loadingRowId() === u.id"
              editLabel="Редактировать"
              dataTestEdit="users-admin-edit"
              deleteLabel="Удалить"
              dataTestDelete="users-admin-delete"
              (edit)="onEdit($event)"
              (delete)="onDelete($event)"
            />
          </div>
        </ng-template>
      </app-pi-table>
    </app-pi-group-workspace>
  `,
})
export class UsersAdminPage implements OnInit {
  protected readonly toc = ADMIN_TOC_CHIPS;
  protected readonly chips = ADMIN_ENTITY_SECTION_CHIPS;

  private readonly usersService = inject(PiUsersService);
  private readonly toast = inject(PiToastService);
  private readonly dialog = inject(PiDialogService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly injector = inject(Injector);
  protected readonly caps = inject(CapabilitiesService);
  private readonly auth = inject(AuthService);

  readonly users = signal<ClientUser[]>([]);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly loadingRowId = signal<string | null>(null);
  readonly page = signal(1);
  readonly total = signal(0);
  readonly pageSize = PAGE_SIZE;
  readonly searchQuery = signal('');
  private requestVersion = 0;

  protected readonly cols: ColumnDef<ClientUser>[] = [
    { key: 'username', label: 'Логин', sticky: 'left' },
    { key: 'displayName', label: 'ФИО' },
    { key: 'email', label: 'Email', cellClass: 'text-muted-foreground' },
    { key: 'role', label: 'Роль', cellClass: 'font-mono text-xs' },
    {
      key: 'isActive',
      label: 'Активен',
      format: (u) => (u.isActive ? 'да' : 'нет'),
    },
  ];

  @ViewChild('rowActionsTpl', { static: true })
  private readonly rowActionsTplRef!: TemplateRef<{ $implicit: ClientUser }>;
  protected rowActionsTplBinding: TemplateRef<{ $implicit: ClientUser }> | null = null;

  constructor() {
    this.refresh();
  }

  ngOnInit(): void {
    this.rowActionsTplBinding = this.rowActionsTplRef;
  }

  private refresh(): void {
    const version = ++this.requestVersion;
    this.loading.set(true);
    this.usersService
      .list({ page: this.page(), limit: PAGE_SIZE, search: this.searchQuery() })
      .subscribe((data) => {
        if (version !== this.requestVersion) return;
        this.loading.set(false);
        if (data.ok) {
          this.users.set(data.data.items);
          this.total.set(data.data.total);
          this.page.set(data.data.page);
          this.error.set(null);
        } else {
          this.error.set(this.describe(data.error));
        }
      });
  }

  protected onSearchInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value.trim();
    this.searchQuery.set(value);
    this.page.set(1);
    this.refresh();
  }

  /**
   * TZ-AUTH-306 — the owner's own row: destructive actions (deactivate /
   * delete) are hidden. The owner may still reset their own password
   * (break-glass) and edit name/email; server-side `OWNER_SELF_PROTECTED`
   * additionally refuses self-demotion via a direct API call.
   */
  protected isSelfOwner(u: ClientUser): boolean {
    return this.auth.isOwner() && u.id === this.auth.user()?.id;
  }

  protected onPageChange(nextPage: number): void {
    if (nextPage === this.page()) return;
    this.page.set(nextPage);
    this.refresh();
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
      this.silentRun(
        activating ? this.usersService.activate(u.id) : this.usersService.deactivate(u.id),
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
      this.silentRun(this.usersService.remove(u.id), 'Пользователь удалён', u.id);
    });
  }

  /**
   * Shared mutation runner: toast on success, refresh the table, and
   * map the `LAST_ADMIN_INVARIANT` 403 to the user-visible message.
   */
  private createUser(result: UserFormResult): Observable<SilentResult<ClientUser>> {
    const body: {
      username: string;
      password?: string;
      role: string;
      isActive: boolean;
      email?: string;
      displayName?: string;
    } = {
      username: result.username,
      password: result.password,
      role: result.role,
      isActive: result.isActive,
    };
    if (result.email) body.email = result.email;
    if (result.displayName) body.displayName = result.displayName;
    return this.usersService.create(body);
  }

  private updateUser(id: string, result: UserFormResult): Observable<SilentResult<ClientUser>> {
    const body: {
      username: string;
      role: string;
      isActive: boolean;
      email?: string;
      displayName?: string;
    } = {
      username: result.username,
      role: result.role,
      isActive: result.isActive,
    };
    if (result.email) body.email = result.email;
    if (result.displayName) body.displayName = result.displayName;
    return this.usersService.update(id, body);
  }

  private resetPassword(id: string, newPassword: string): Observable<SilentResult<ClientUser>> {
    this.loadingRowId.set(id);
    return this.usersService
      .resetPassword(id, newPassword)
      .pipe(finalize(() => this.loadingRowId.set(null)));
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
        if (body?.code === 'LAST_ADMIN_INVARIANT') {
          this.toast.error('Нельзя удалить/понизить последнего админа');
        } else if (body?.code === 'OWNER_SELF_PROTECTED') {
          this.toast.error('Нельзя удалить, отключить или понизить владельца');
        } else if (body?.code === 'OWNER_ONLY') {
          this.toast.error('Это действие доступно только владельцу системы');
        } else {
          this.toast.error(extractErrorMessage(res.error));
        }
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
