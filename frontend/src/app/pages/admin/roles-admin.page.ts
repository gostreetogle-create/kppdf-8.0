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
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../../core/api.tokens';
import { CapabilitiesService } from '../../core/capabilities/capabilities.service';
import {
  extractErrorMessage,
  silentDelete,
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
import { TableComponent, type ColumnDef } from '../../shared/ui/pi-table.component';
import { PiRolesService, type AdminRole } from '../../shared/services/pi-roles.service';
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
type ClientRole = AdminRole;
const PAGE_SIZE = 50;

@Component({
  selector: 'pi-roles-admin-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PiPageHeaderComponent, ButtonComponent, PiRowActionsComponent, TableComponent],
  template: `
    <app-pi-page-header
      eyebrow="администрирование"
      title="Роли"
      subtitle="Управление ролями и их набором прав"
      data-testid="roles-admin-header"
    />

    <section class="pi-page-frame pi-edge-bleed py-page-y">
      <div class="flex items-center justify-between gap-3 mb-4">
        <input
          type="search"
          class="pi-input w-72"
          [value]="searchQuery()"
          (input)="onSearchInput($event)"
          placeholder="Поиск ролей…"
          aria-label="Поиск ролей"
          data-test="roles-admin-search"
        />
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
      @if (error(); as err) {
        <p role="alert" class="text-sm text-destructive mb-4" data-testid="roles-admin-error">
          {{ err }}
        </p>
      }
      <div class="overflow-x-auto hairline rounded-sm">
        <app-pi-table
          [data]="roles()"
          [columns]="cols"
          [loading]="loading()"
          [total]="total()"
          [page]="page()"
          [pageSize]="pageSize"
          [emptyMessage]="searchQuery() ? 'Ничего не найдено.' : 'Роли не найдены.'"
          [ariaLabel]="'Список ролей'"
          [rowActions]="rowActionsTplBinding"
          (pageChange)="onPageChange($event)"
        >
          <ng-template #rowActionsTpl let-r>
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
          </ng-template>
        </app-pi-table>
      </div>
    </section>
  `,
})
export class RolesAdminPage implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly rolesService = inject(PiRolesService);
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
  readonly page = signal(1);
  readonly total = signal(0);
  readonly pageSize = PAGE_SIZE;
  readonly searchQuery = signal('');
  private requestVersion = 0;

  protected readonly cols: ColumnDef<ClientRole>[] = [
    { key: 'name', label: 'Имя', sticky: 'left', cellClass: 'font-mono text-xs' },
    { key: 'label', label: 'Название' },
    {
      key: 'permissions',
      label: 'Permissions',
      format: (r) => (r.permissions.length > 0 ? r.permissions.join(', ') : '—'),
    },
    {
      key: 'isSystem',
      label: 'Тип',
      format: (r) => (r.isSystem ? 'system' : 'custom'),
    },
  ];

  @ViewChild('rowActionsTpl', { static: true })
  private readonly rowActionsTplRef!: TemplateRef<{ $implicit: ClientRole }>;
  protected rowActionsTplBinding: TemplateRef<{ $implicit: ClientRole }> | null = null;

  constructor() {
    this.refresh();
  }

  ngOnInit(): void {
    this.rowActionsTplBinding = this.rowActionsTplRef;
  }

  private refresh(): void {
    const version = ++this.requestVersion;
    this.loading.set(true);
    this.rolesService
      .list({ page: this.page(), limit: PAGE_SIZE, search: this.searchQuery() })
      .subscribe((data) => {
        if (version !== this.requestVersion) return;
        this.loading.set(false);
        if (data.ok) {
          this.roles.set(data.data.items);
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

  protected onPageChange(nextPage: number): void {
    if (nextPage === this.page()) return;
    this.page.set(nextPage);
    this.refresh();
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
