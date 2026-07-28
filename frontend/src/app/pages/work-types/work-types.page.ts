import {
  ChangeDetectionStrategy,
  Component,
  Injector,
  TemplateRef,
  computed,
  inject,
  viewChild,
} from '@angular/core';
import { PiPageHeaderComponent } from '../../shared/page/pi-page-header.component';
import { PiSectionComponent } from '../../shared/page/pi-section.component';
import { PiRowActionsComponent } from '../../shared/ui/pi-row-actions/pi-row-actions.component';
import { ButtonComponent } from '../../shared/ui/button/button.component';
import { SwitchComponent } from '../../shared/ui/switch/switch.component';
import { PiDialogService, type DialogRef } from '../../shared/ui/dialog/pi-dialog.service';
import { AlertDialogComponent } from '../../shared/ui/dialog/pi-alert-dialog.component';
import { PiToastService } from '../../shared/ui/toast';
import { onDialogCloseOnce } from '../../shared/util/on-dialog-close-once';
import { extractErrorMessage } from '../../core/silent-http';
import { ColumnDef } from '../../shared/ui/pi-table.component';
import {
  DefaultListParams,
  PiEntityListComponent,
} from '../../shared/dsl/entity-list/pi-entity-list.component';
import { toEntityService } from '../../shared/dsl/entity/entity-service';
import { WorkType, WorkTypesService } from '../../shared/services/pi-work-types.service';
import { WorkTypeFormDialogComponent } from './work-type-form-dialog.component';

/**
 * Params bag for `<pi-entity-list>` — extends `DefaultListParams` (page,
 * limit, search) with work-types-specific filters (workCenterId,
 * activeOnly). Wrapper strips `DefaultListParams` keys for `[params]`,
 * so the page contributes only the extra fields.
 */
export interface WorkTypesListParams extends DefaultListParams {
  workCenterId?: string;
  activeOnly?: boolean;
}

/**
 * Полная документация страницы: docs/pages/work-types.page.md
 *
 * TZ-232.E warmup #1 — work-types migrated to <pi-entity-list> wrapper.
 *
 * Wrapper covers: debounced search, in-flight cancellation, loading
 * skeleton, error banner, empty state, create/rowEdit/rowDelete outputs,
 * reload button, initial sort, cell templates passthrough. Page keeps:
 * isActive Switch cell template, row actions template, dialog-based
 * create/edit/delete flows, toast notifications.
 *
 * Trade-offs:
 *  - **Search hidden** via `[showSearch]="false"` — backend
 *    WorkTypesController doesn't accept `?search=` param. Original
 *    client-side filter via `createClientSearchState` was removed.
 *  - **Client-side sort** replaced by wrapper's built-in `localSort=true`
 *    (pi-table default) — same UX, less code.
 *  - **Count hint** "X видов" was removed (was bound to client-side
 *    `totalItems()` computed). Could be restored via wrapper.total()
 *    if needed.
 */
@Component({
  selector: 'app-work-types-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    PiPageHeaderComponent,
    PiSectionComponent,
    PiRowActionsComponent,
    ButtonComponent,
    SwitchComponent,
    PiEntityListComponent,
  ],
  template: `
    <app-pi-page-header
      eyebrow="раздел · справочники"
      title="Виды работ"
      description="Справочник видов работ с нормативами часов, ставкой и привязкой к рабочему центру. Используется в составе модулей продукции."
    />

    <app-pi-section
      title="Каталог"
      hint="сортировка · клик по заголовку · деактивированные — приглушены"
      eyebrow="I"
    >
      <app-pi-entity-list
        #list
        [service]="listService"
        [cols]="cols"
        ariaLabel="Список видов работ"
        [pageSize]="20"
        [showSearch]="false"
        emptyMessage="Нет видов работ. Нажмите «Создать», чтобы добавить первый."
        [initialSortKey]="'name'"
        [initialSortDir]="'asc'"
        [cellTemplates]="cellTemplates()"
        [rowActionsTpl]="rowActionsTplBinding()"
        (create)="openCreate()"
        (rowEdit)="openEdit($event)"
        (rowDelete)="onDelete($event)"
      >
        <ng-template #rowActionsTpl let-row>
          <app-pi-row-actions
            [row]="row"
            [editLabel]="'Редактировать ' + row.name"
            [deleteLabel]="'Удалить ' + row.name"
            [dataTestEdit]="'edit-button-' + row._id"
            [dataTestDelete]="'delete-button-' + row._id"
            (edit)="openEdit($event)"
            (delete)="onDelete($event)"
          />
        </ng-template>

        <ng-template #isActiveTpl let-row>
          <app-pi-switch
            [checked]="row.isActive"
            [id]="'switch-' + row._id"
            [ariaLabel]="(row.isActive ? 'Деактивировать ' : 'Активировать ') + row.name"
            (checkedChange)="onToggleActive(row, $event)"
            data-test="active-switch"
          />
        </ng-template>
      </app-pi-entity-list>
    </app-pi-section>
  `,
})
export class WorkTypesPage {
  private readonly workTypesService = inject(WorkTypesService);
  private readonly dialog = inject(PiDialogService);
  private readonly toast = inject(PiToastService);
  private readonly injector = inject(Injector);

  /** 1-LOC adapter via `toEntityService` helper. */
  protected readonly listService = toEntityService<
    WorkType,
    WorkTypesListParams
  >(this.workTypesService);

  /** Reference to the wrapper for programmatic reload after mutations. */
  private readonly listRef = viewChild<
    PiEntityListComponent<WorkType, WorkTypesListParams>
  >('list');

  /**
   * Template refs via `viewChild` signal — modern Angular 20 pattern.
   * No `static: true` (always reads AFTER first CD), but wrapper's
   * initial render doesn't depend on these being ready synchronously
   * since the wrapper reads them as input signal values each CD cycle.
   */
  private readonly rowActionsTplRef = viewChild<TemplateRef<{ $implicit: WorkType }>>(
    'rowActionsTpl',
  );
  private readonly isActiveTplRef = viewChild<TemplateRef<{ $implicit: WorkType }>>(
    'isActiveTpl',
  );

  /**
   * Cell templates map — filters out undefined refs so the wrapper's
   * `Record<string, TemplateRef>` (non-nullable values) is satisfied
   * at compile time. Pre-resolution (first CD cycle), `cellTemplates`
   * is `{}`; the table renders normally and gains the isActive switch
   * column on CD-2+ when the template ref resolves.
   *
   * TS narrowing note: `tpl ? { isActive: tpl } : {}` would infer the
   * empty branch as `{ isActive?: undefined }` (literal-narrowing rule
   * for object literals in conditionals), which violates the strict
   * `Record<string, TemplateRef>` contract. We instead build the
   * object conditionally — the result is typed as an explicit
   * `Record` from creation, so the conditional assignment satisfies
   * the index signature regardless of whether the template ref has
   * resolved.
   */
  protected readonly cellTemplates = computed<
    Record<string, TemplateRef<{ $implicit: WorkType }>>
  >(() => {
    const result: Record<string, TemplateRef<{ $implicit: WorkType }>> = {};
    const tpl = this.isActiveTplRef();
    if (tpl) {
      result['isActive'] = tpl;
    }
    return result;
  });

  protected readonly rowActionsTplBinding = computed<
    TemplateRef<{ $implicit: WorkType }> | null
  >(() => this.rowActionsTplRef() ?? null);

  protected readonly cols: ColumnDef<WorkType>[] = [
    { key: 'name', label: 'Название', sortable: true, sticky: 'left' },
    { key: 'section', label: 'Секция', sortable: true, cellClass: 'empty-cell' },
    { key: 'department', label: 'Отдел', sortable: true, cellClass: 'empty-cell' },
    {
      key: 'hourlyRate',
      label: 'Час/₽',
      sortable: true,
      align: 'right',
      cellClass: 'empty-cell font-mono text-xs',
    },
    { key: 'isActive', label: 'Активен', cellClass: 'text-center' },
  ];

  protected openCreate(): void {
    const ref = this.dialog.open(WorkTypeFormDialogComponent, {
      data: null,
      width: 'md',
    });
    this.refreshOnDialogClose(ref);
  }

  protected openEdit(wt: WorkType): void {
    const ref = this.dialog.open(WorkTypeFormDialogComponent, {
      data: wt,
      width: 'md',
    });
    this.refreshOnDialogClose(ref);
  }

  /**
   * Subscribe to dialog close and reload wrapper on successful save.
   * `onDialogCloseOnce` requires an Injector to run the callback
   * (used to create the closing subscription inside a zone-free context).
   */
  private refreshOnDialogClose<TResult>(ref: DialogRef<TResult>): void {
    onDialogCloseOnce(ref, this.injector, () => this.listRef()?.reload());
  }

  protected onToggleActive(wt: WorkType, checked: boolean): void {
    this.workTypesService.update(wt._id, { isActive: checked }).subscribe((res) => {
      if (res.ok) {
        this.toast.success(
          checked ? `«${wt.name}» активирован` : `«${wt.name}» деактивирован`,
        );
        this.listRef()?.reload();
      } else {
        this.toast.error(extractErrorMessage(res.error));
      }
    });
  }

  protected onDelete(wt: WorkType): void {
    const ref = this.dialog.open<boolean>(AlertDialogComponent, {
      data: {
        title: 'Удалить вид работ?',
        description: `Удалить «${wt.name}»? Если он используется в модулях продукции — операция может быть отклонена сервером.`,
        confirmLabel: 'Удалить',
        variant: 'destructive',
      },
      width: 'sm',
    });
    onDialogCloseOnce(ref, this.injector, () => {
      this.workTypesService.remove(wt._id).subscribe((res) => {
        if (res.ok) {
          this.toast.success('Вид работ удалён');
          this.listRef()?.reload();
        } else {
          this.toast.error(extractErrorMessage(res.error));
        }
      });
    });
  }
}