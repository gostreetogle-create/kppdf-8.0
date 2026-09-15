import {
  ChangeDetectionStrategy,
  Component,
  TemplateRef,
  ViewChild,
  inject,
  OnInit,
} from '@angular/core';
import { CapabilitiesService } from '@kppdf/data-access/capabilities';
import { PiGroupWorkspaceComponent } from '@kppdf/features';
import { ADMIN_ENTITY_SECTION_CHIPS, ADMIN_TOC_CHIPS } from './admin-group-chips';
import { ButtonComponent } from '@kppdf/ui/button';
import { TableComponent, PiRowActionsComponent } from '@kppdf/ui/table';
import type { AdminRole } from '@kppdf/data-access/admin';
import { AdminRolesPageFacade } from './admin-roles.facade';
import { ROLE_FORM_COPY } from './permission-labels.ru';

type ClientRole = AdminRole;

/**
 * TZ-256.B — `roles-admin.page` (full CRUD surface).
 * TZ-ADMIN-301 / PO 2026-08-09 — system roles keep badge; site admin
 * (`role:write`) may Edit permissions/pages. DELETE of system roles
 * stays forbidden (BE `SYSTEM_ROLE_FROZEN`). Custom roles unchanged.
 *
 * TZ-NX-ADMIN-ROLES-PAGE-FACADE — list/CRUD orchestration moved to
 * `AdminRolesPageFacade`; this page stays a thin host.
 */
@Component({
  selector: 'pi-roles-admin-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [AdminRolesPageFacade],
  imports: [PiGroupWorkspaceComponent, ButtonComponent, PiRowActionsComponent, TableComponent],
  template: `
    <app-pi-group-workspace [toc]="toc" tocActiveId="roles" [chips]="chips" activeId="">
      <div tools class="flex items-center gap-form-field flex-wrap w-full">
        <input
          type="search"
          class="pi-input w-72 pi-focus-ring"
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
        <div
          role="alert"
          class="mb-4 border hairline border-destructive rounded-sm px-4 py-3 text-xs text-destructive"
          data-test="roles-admin-error"
        >
          {{ err }}
        </div>
      }
      <div class="pi-table-surface hairline rounded-sm overflow-hidden bg-paper-raised">
        <app-pi-table
          [compact]="true"
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
                @if (caps.hasAny(['role:write']) || caps.hasAny(['role:admin'])) {
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
                } @else {
                  <app-pi-button
                    variant="ghost"
                    size="sm"
                    type="button"
                    (click)="onView(r)"
                    data-test="roles-admin-view"
                  >
                    {{ copy.viewLabel }}
                  </app-pi-button>
                }
              </div>
            } @else {
              <div class="flex items-center justify-end gap-2">
                <span
                  class="text-xs text-muted-foreground whitespace-nowrap"
                  data-test="roles-admin-system-badge"
                >
                  {{ copy.systemBadge }}
                </span>
                @if (caps.hasAny(['role:write'])) {
                  <app-pi-row-actions
                    [row]="r"
                    [showEdit]="true"
                    [showDelete]="false"
                    [loading]="loadingRowId() === r.id"
                    editLabel="Редактировать"
                    deleteLabel="Удалить"
                    dataTestEdit="roles-admin-edit"
                    (edit)="onEdit($event)"
                  />
                } @else {
                  <app-pi-button
                    variant="ghost"
                    size="sm"
                    type="button"
                    (click)="onView(r)"
                    data-test="roles-admin-view"
                  >
                    {{ copy.viewLabel }}
                  </app-pi-button>
                }
              </div>
            }
          </ng-template>
        </app-pi-table>
      </div>
    </app-pi-group-workspace>
  `,
})
export class RolesAdminPage implements OnInit {
  protected readonly toc = ADMIN_TOC_CHIPS;
  protected readonly chips = ADMIN_ENTITY_SECTION_CHIPS;
  protected readonly copy = ROLE_FORM_COPY;
  protected readonly caps = inject(CapabilitiesService);

  private readonly facade = inject(AdminRolesPageFacade);

  protected readonly roles = this.facade.roles;
  protected readonly loading = this.facade.loading;
  protected readonly error = this.facade.error;
  protected readonly loadingRowId = this.facade.loadingRowId;
  protected readonly page = this.facade.page;
  protected readonly total = this.facade.total;
  protected readonly pageSize = this.facade.pageSize;
  protected readonly searchQuery = this.facade.searchQuery;
  protected readonly cols = this.facade.cols;

  @ViewChild('rowActionsTpl', { static: true })
  private readonly rowActionsTplRef!: TemplateRef<{ $implicit: ClientRole }>;
  protected rowActionsTplBinding: TemplateRef<{ $implicit: ClientRole }> | null = null;

  ngOnInit(): void {
    this.rowActionsTplBinding = this.rowActionsTplRef;
  }

  protected onSearchInput(event: Event): void {
    this.facade.onSearchInput(event);
  }

  protected onPageChange(nextPage: number): void {
    this.facade.onPageChange(nextPage);
  }

  protected onCreate(): void {
    this.facade.onCreate();
  }

  protected onEdit(r: ClientRole): void {
    this.facade.onEdit(r);
  }

  protected onView(r: ClientRole): void {
    this.facade.onView(r);
  }

  protected onDelete(r: ClientRole): void {
    this.facade.onDelete(r);
  }
}
