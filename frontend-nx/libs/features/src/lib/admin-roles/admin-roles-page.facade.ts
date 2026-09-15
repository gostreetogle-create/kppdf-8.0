/**
 * TZ-NX-ADMIN-ROLES-PAGE-FACADE — domain facade for `RolesAdminPage`.
 * TZ-NX-ADMIN-ROLES-TO-FEATURES — moved into `@kppdf/features/admin-roles`
 * (lib root), reusing the `RoleFormDialogComponent` already here (B4) as a
 * normal lib-local sibling import (not the public barrel — self-referential
 * otherwise) and the `permission-labels.ru.ts` duplicate already in `ui/`.
 *
 * Owns: list load/search/paginate, CRUD (create/edit/view/delete) via
 * `RoleFormDialogComponent`, table column defs — moved as-is from the page.
 * No role/permission rule change.
 *
 * A plain route page with no `input.required<T>()`/`@Input()`, so the
 * facade's own constructor safely calls `refresh()` directly — same shape
 * as `ShippingFacade`, no `bind(host)` indirection needed.
 */
import { DestroyRef, Injectable, Injector, inject, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { extractErrorMessage, type SilentResult } from '@kppdf/util-http';
import { PiToastService } from '@kppdf/ui/toast';
import { PiDialogService, AlertDialogComponent } from '@kppdf/ui/dialog';
import type { ColumnDef } from '@kppdf/ui/table';
import { PiRolesService, type AdminRole } from '@kppdf/data-access/admin';
import { onDialogCloseOnce } from './ui/on-dialog-close-once';
import { RoleFormDialogComponent, type RoleFormData, type RoleFormResult } from './ui/role-form-dialog.component';
import { ROLE_FORM_COPY, permissionsSummary, roleLabelRu } from './ui/permission-labels.ru';

type ClientRole = AdminRole;
const PAGE_SIZE = 10;

@Injectable()
export class AdminRolesPageFacade {
  private readonly rolesService = inject(PiRolesService);
  private readonly toast = inject(PiToastService);
  private readonly dialog = inject(PiDialogService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly injector = inject(Injector);

  readonly roles = signal<ClientRole[]>([]);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly loadingRowId = signal<string | null>(null);
  readonly page = signal(1);
  readonly total = signal(0);
  readonly pageSize = PAGE_SIZE;
  readonly searchQuery = signal('');
  private requestVersion = 0;

  readonly cols: ColumnDef<ClientRole>[] = [
    { key: 'name', label: 'Имя', sticky: 'left', cellClass: 'font-mono text-xs' },
    {
      key: 'label',
      label: 'Название',
      cellClass: 'text-xs',
      format: (r) => roleLabelRu(r.name, r.label),
    },
    {
      key: 'permissions',
      label: 'Права',
      cellClass: 'text-xs text-muted-foreground',
      format: (r) => permissionsSummary(r.permissions),
    },
    {
      key: 'isSystem',
      label: 'Тип',
      cellClass: 'text-xs',
      format: (r) => (r.isSystem ? ROLE_FORM_COPY.systemBadge : ROLE_FORM_COPY.customBadge),
    },
  ];

  constructor() {
    this.refresh();
  }

  refresh(): void {
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

  onSearchInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value.trim();
    this.searchQuery.set(value);
    this.page.set(1);
    this.refresh();
  }

  onPageChange(nextPage: number): void {
    if (nextPage === this.page()) return;
    this.page.set(nextPage);
    this.refresh();
  }

  // ── Create ──
  onCreate(): void {
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
  onEdit(r: ClientRole): void {
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

  // ── View (read-only) — system roles always, or custom roles when the
  //    viewer has neither role:write nor role:admin (T1 fix: previously
  //    such a viewer had no way to see a custom role's detail at all).
  onView(r: ClientRole): void {
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
          isSystem: r.isSystem,
        },
      } satisfies RoleFormData,
      parentDestroyRef: this.destroyRef,
    });
  }

  // ── Delete ──
  onDelete(r: ClientRole): void {
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
      this.silentRun(this.rolesService.remove(r.id), 'Роль удалена', r.id);
    });
  }

  private createRole(result: RoleFormResult): Observable<SilentResult<ClientRole>> {
    return this.rolesService.create(result);
  }

  private updateRole(id: string, result: RoleFormResult): Observable<SilentResult<ClientRole>> {
    const payload = {
      label: result.label,
      description: result.description,
      permissions: result.permissions,
      pages: result.pages,
    };
    return this.rolesService.update(id, payload);
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
        const body = res.error.error as { code?: string; message?: string } | null;
        const msg = typeof body?.message === 'string' ? body.message : '';
        const frozen =
          body?.code === 'SYSTEM_ROLE_FROZEN' || msg === 'System roles cannot be deleted';
        const escalation =
          body?.code === 'SYSTEM_ROLE_ESCALATION' || /Cannot set isSystem/i.test(msg);
        this.toast.error(
          frozen
            ? 'Системные роли нельзя удалить'
            : escalation
              ? 'Нельзя сделать роль системной'
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
