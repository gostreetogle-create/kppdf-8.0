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
import { PiGroupWorkspaceComponent } from '../../shared/page/pi-group-workspace.component';
import { ADMIN_ENTITY_SECTION_CHIPS, ADMIN_TOC_CHIPS } from './admin-group-chips';
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
import { ROLE_FORM_COPY, permissionsSummary, roleLabelRu } from './permission-labels.ru';

/**
 * TZ-256.B — `roles-admin.page` (full CRUD surface).
 * TZ-ADMIN-301 — system roles show RU badge + read-only view; custom
 * roles edit pages[] (nav pageKey ACL) + permissions.
 * TZ-ADMIN-302 — system «Смотреть» shows full catalog checked (not empty `*`).
 *
 * System roles (`isSystem: true`) are frozen by design —
 * `SystemRoleGuard` returns 403 `SYSTEM_ROLE_FROZEN` / `SYSTEM_ROLE_ESCALATION`.
 * Non-system (custom / director / manager when `isSystem: false`) keep Edit.
 */
type ClientRole = AdminRole;
const PAGE_SIZE = 50;

@Component({
  selector: 'pi-roles-admin-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PiGroupWorkspaceComponent, ButtonComponent, PiRowActionsComponent, TableComponent],
  template: `
    <app-pi-group-workspace
      pathLabel="Администрирование"
      [toc]="toc"
      tocActiveId="roles"
      [chips]="chips"
      activeId=""
    >
      <div tools class="flex items-center gap-form-field flex-wrap w-full">
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
            <div class="flex items-center justify-end gap-2">
              <span
                class="text-xs text-muted-foreground whitespace-nowrap"
                data-test="roles-admin-system-badge"
              >
                {{ copy.systemBadge }}
              </span>
              <app-pi-button
                variant="ghost"
                size="sm"
                type="button"
                (click)="onView(r)"
                data-test="roles-admin-view"
              >
                {{ copy.viewLabel }}
              </app-pi-button>
            </div>
          }
        </ng-template>
      </app-pi-table>
    </app-pi-group-workspace>
  `,
})
export class RolesAdminPage implements OnInit {
  protected readonly toc = ADMIN_TOC_CHIPS;
  protected readonly chips = ADMIN_ENTITY_SECTION_CHIPS;
  protected readonly copy = ROLE_FORM_COPY;

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
    {
      key: 'label',
      label: 'Название',
      format: (r) => roleLabelRu(r.name, r.label),
    },
    {
      key: 'permissions',
      label: 'Права',
      format: (r) => permissionsSummary(r.permissions),
    },
    {
      key: 'isSystem',
      label: 'Тип',
      format: (r) => (r.isSystem ? ROLE_FORM_COPY.systemBadge : ROLE_FORM_COPY.customBadge),
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

  // ── Edit custom ──
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
          pages: r.pages ?? [],
        },
        submit: (result) => this.updateRole(r.id, result),
      } satisfies RoleFormData,
      parentDestroyRef: this.destroyRef,
    });
    onDialogCloseOnce(ref, this.injector, () => {
      this.toast.success('Роль обновлена');
      void this.refresh();
    });
  }

  // ── View system (read-only) ──
  protected onView(r: ClientRole): void {
    this.dialog.open<RoleFormResult>(RoleFormDialogComponent, {
      data: {
        mode: 'view',
        role: {
          id: r.id,
          name: r.name,
          label: r.label,
          description: r.description,
          permissions: r.permissions,
          pages: r.pages ?? [],
          isSystem: true,
        },
      } satisfies RoleFormData,
      parentDestroyRef: this.destroyRef,
    });
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

  private createRole(result: RoleFormResult): Observable<SilentResult<ClientRole>> {
    return silentPost<ClientRole>(this.http, `${this.baseUrl}/admin/roles`, result);
  }

  private updateRole(id: string, result: RoleFormResult): Observable<SilentResult<ClientRole>> {
    const payload = {
      label: result.label,
      description: result.description,
      permissions: result.permissions,
      pages: result.pages,
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
