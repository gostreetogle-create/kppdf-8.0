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
  RoleFormDialogComponent,
  type RoleFormData,
  type RoleFormResult,
} from './role-form-dialog.component';

/**
 * TZ-256.B — `roles-admin.page` (full CRUD surface).
 *
 * Create / edit / delete with confirmation dialogs, toast feedback,
 * and refresh after every successful mutation. System roles
 * (`isSystem: true`) are rendered read-only — edit/delete controls
 * are hidden and the backend additionally refuses mutations via
 * `SystemRoleGuard` (403 `SYSTEM_ROLE_FROZEN` / `SYSTEM_ROLE_ESCALATION`),
 * surfaced as the user-visible message «Системные роли доступны только
 * для чтения».
 *
 * All HTTP goes through `silent-*` helpers — the observables never
 * error, so RxJS never logs noise for expected 4xx responses.
 */
interface ClientRole {
  id: string;
  name: string;
  label: string;
  description?: string;
  permissions: string[];
  isSystem: boolean;
  createdAt?: string;
  updatedAt?: string;
}

@Component({
  selector: 'pi-roles-admin-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PiPageHeaderComponent, ButtonComponent, PiRowActionsComponent],
  template: `
    <app-pi-page-header
      eyebrow="администрирование"
      title="Роли"
      subtitle="Управление ролями и их набором прав"
      data-testid="roles-admin-header"
    />

    <section class="pi-page-frame pi-edge-bleed py-page-y">
      <div class="flex items-center justify-end mb-4">
        @if (caps.hasAny(['role:write'])) {
          <app-pi-button
            variant="default"
            size="sm"
            (click)="onCreate()"
            data-test="roles-admin-create"
          >
            Создать роль
          </app-pi-button>
        }
      </div>
      @if (loading()) {
        <p class="text-sm text-muted-foreground">Загрузка…</p>
      } @else if (error(); as err) {
        <p class="text-sm text-destructive" data-testid="roles-admin-error">
          {{ err }}
        </p>
      } @else {
        <table class="pi-table w-full" data-testid="roles-admin-table">
          <thead>
            <tr>
              <th class="text-left pi-table-th">Имя</th>
              <th class="text-left pi-table-th">Название</th>
              <th class="text-left pi-table-th">Permissions</th>
              <th class="text-left pi-table-th">Тип</th>
              <th class="text-left pi-table-th w-40">Действия</th>
            </tr>
          </thead>
          <tbody>
            @for (r of roles(); track r.id) {
              <tr class="pi-table-tr">
                <td class="pi-table-td font-mono text-xs">{{ r.name }}</td>
                <td class="pi-table-td">{{ r.label }}</td>
                <td class="pi-table-td">
                  @if (r.permissions.length === 0) {
                    <span class="font-mono text-xs pi-badge pi-badge-neutral">—</span>
                  } @else {
                    @for (p of r.permissions; track p) {
                      <span class="font-mono text-xs pi-badge pi-badge-neutral mr-1">{{ p }}</span>
                    }
                  }
                </td>
                <td class="pi-table-td">
                  @if (r.isSystem) {
                    <span class="pi-badge pi-badge-warning">system</span>
                  } @else {
                    <span class="pi-badge pi-badge-success">custom</span>
                  }
                </td>
                <td class="pi-table-td">
                  @if (!r.isSystem) {
                    <div class="flex items-center justify-end gap-2">
                      @if (loadingRowId() === r.id) {
                        <span
                          class="text-xs text-muted-foreground"
                          role="status"
                          aria-label="Загрузка"
                          data-test="roles-admin-row-loading"
                        >
                          Загрузка…
                        </span>
                      }
                      <app-pi-row-actions
                        [row]="r"
                        [showEdit]="caps.hasAny(['role:write'])"
                        [showDelete]="caps.hasAny(['role:admin'])"
                        [loading]="loadingRowId() === r.id"
                        editLabel="Редактировать"
                        dataTestEdit="roles-admin-edit"
                        deleteLabel="Удалить"
                        dataTestDelete="roles-admin-delete"
                        (edit)="onEdit($event)"
                        (delete)="onDelete($event)"
                      />
                    </div>
                  } @else {
                    <span class="text-xs text-muted-foreground">read-only</span>
                  }
                </td>
              </tr>
            } @empty {
              <tr>
                <td colspan="5" class="pi-table-td text-center text-muted-foreground py-8">
                  Роли не найдены.
                </td>
              </tr>
            }
          </tbody>
        </table>
      }
    </section>
  `,
})
export class RolesAdminPage {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL);
  private readonly toast = inject(PiToastService);
  private readonly dialog = inject(PiDialogService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly injector = inject(Injector);
  protected readonly caps = inject(CapabilitiesService);

  readonly roles = signal<ClientRole[]>([]);
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
        silentGet<ClientRole[]>(this.http, `${this.baseUrl}/admin/roles`),
      );
      if (data.ok) {
        this.roles.set(data.data);
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
    const ref = this.dialog.open<RoleFormResult>(RoleFormDialogComponent, {
      data: {
        mode: 'create',
        submit: (result) => this.createRole(result),
      } satisfies RoleFormData,
      parentDestroyRef: this.destroyRef,
    });
    onDialogCloseOnce(ref, this.injector, () => {
      this.toast.success('Роль создана');
      void this.refresh();
    });
  }

  // ── Edit ──
  protected onEdit(r: ClientRole): void {
    const ref = this.dialog.open<RoleFormResult>(RoleFormDialogComponent, {
      data: {
        mode: 'edit',
        role: {
          id: r.id,
          name: r.name,
          label: r.label,
          description: r.description,
          permissions: r.permissions,
        },
        submit: (result) => this.updateRole(r.id, result),
      } satisfies RoleFormData,
      parentDestroyRef: this.destroyRef,
    });
    onDialogCloseOnce(ref, this.injector, () => {
      this.toast.success('Роль обновлена');
      void this.refresh();
    });
    // TZ-257.B whitelist: `updateRole` sends only label/description/permissions;
    // the locked role name is never sent to the strict backend DTO.
  }

  // ── Delete ──
  protected onDelete(r: ClientRole): void {
    const ref = this.dialog.open<boolean>(AlertDialogComponent, {
      data: {
        title: 'Удалить роль?',
        description: `Роль «${r.label || r.name}» будет удалена. Пользователи с этой ролью сохранятся, но потеряют связанные права.`,
        confirmLabel: 'Удалить',
        variant: 'destructive',
      },
      width: 'sm',
      parentDestroyRef: this.destroyRef,
    });
    onDialogCloseOnce(ref, this.injector, (ok) => {
      if (!ok) return;
      this.silentRun(
        silentDelete<{ success: true }>(this.http, `${this.baseUrl}/admin/roles/${r.id}`),
        'Роль удалена',
        r.id,
      );
    });
  }

  /**
   * Shared mutation runner: toast on success, refresh the table, and
   * map system-role 403 codes to the user-visible message.
   */
  private createRole(result: RoleFormResult): Observable<SilentResult<ClientRole>> {
    return silentPost<ClientRole>(this.http, `${this.baseUrl}/admin/roles`, result);
  }

  private updateRole(id: string, result: RoleFormResult): Observable<SilentResult<ClientRole>> {
    const payload = {
      label: result.label,
      description: result.description,
      permissions: result.permissions,
    };
    return silentPatch<ClientRole>(this.http, `${this.baseUrl}/admin/roles/${id}`, payload);
  }

  private silentRun(
    obs: Observable<SilentResult<ClientRole | { success: true }>>,
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
          body?.code === 'SYSTEM_ROLE_FROZEN' || body?.code === 'SYSTEM_ROLE_ESCALATION'
            ? 'Системные роли доступны только для чтения'
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
