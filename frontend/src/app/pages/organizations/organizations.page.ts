import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  Injector,
  TemplateRef,
  computed,
  inject,
  viewChild,
} from '@angular/core';
import { PiPageHeaderComponent } from '../../shared/page/pi-page-header.component';
import { PiRowActionsComponent } from '../../shared/ui/pi-row-actions/pi-row-actions.component';
import { ButtonComponent } from '../../shared/ui/button/button.component';
import { PiDialogService, type DialogRef } from '../../shared/ui/dialog/pi-dialog.service';
import { AlertDialogComponent } from '../../shared/ui/dialog/pi-alert-dialog.component';
import { PiToastService } from '../../shared/ui/toast';
import { onDialogCloseOnce } from '../../shared/util/on-dialog-close-once';
import { extractErrorMessage } from '../../core/silent-http';
import { pluralize } from '../../shared/util/format';
import { ColumnDef } from '../../shared/ui/pi-table.component';
import { PiEntityListComponent } from '../../shared/dsl/entity-list/pi-entity-list.component';
import { toEntityService } from '../../shared/dsl/entity/entity-service';
import {
  Organization,
  OrganizationsService,
  ORG_TYPE_LABELS,
  type OrgType,
} from '../../shared/services/organizations.service';
import { OrganizationFormDialogComponent } from './organization-form-dialog.component';

const PAGE_SIZE = 50;

/**
 * TZ-232.E warmup #2 — organizations migrated to <pi-entity-list> wrapper.
 *
 * Backend OrganizationsController honors `?page=&limit=&search=` but
 * IGNORES `?sortBy=` (recipe §4A.4 pattern A-mixed). Wrapper is
 * configured with `[localSort]="true"` so pi-table sorts the current
 * 50-row server page slice client-side on header click — preserving
 * the original UX.
 *
 * Trade-offs:
 *  - **`httpResource` removed** — replaced by wrapper's RxJS pipeline
 *    (subject + debounce + switchMap).
 *  - **Count hint** `"{{ total() }} {{ totalLabel(total()) }}"` lives
 *    in the wrapper's toolbar via `[toolbarExtras]` projection slot,
 *    reading `wrapper.total()` (public readonly signal).
 *  - **Sort disclosure message** also lives in `toolbarExtras` —
 *    grouped with count hint for visual cohesion (page-level UX copy,
 *    not a wrapper concern). Reads `[localSort]="true"` policy so
 *    users know sort is local-only.
 *  - **Outer `<app-pi-toolbar>` removed** — wrapper has its own
 *    toolbar (search + create + reload + extras). Two stacked
 *    toolbars created visual duplication; wrapper's toolbar is the
 *    single source of truth now.
 *  - **`<app-pi-section>` removed** — was a semantic placeholder
 *    around the now-moved table content. Dead code post-migration.
 *  - **Sort change handler** removed — pi-table's local sort doesn't
 *    emit `sortChange` (it sorts internally). The old `sortKeySig` /
 *    `sortDirSig` were page-level state for showing "sorted by X"
 *    badges which we drop (UX improvement: the column header arrow
 *    is sufficient indicator).
 *  - **Cell template for `type` column** (chips for org types)
 *    forwarded via `[cellTemplates]`.
 */
@Component({
  selector: 'app-organizations-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    PiPageHeaderComponent,
    PiRowActionsComponent,
    ButtonComponent,
    PiEntityListComponent,
  ],
  template: `
    <app-pi-page-header
      eyebrow="раздел · партнёры"
      title="Организации"
      description="Юр. лица и ИП — покупатели, поставщики, подрядчики. Один контрагент может совмещать несколько ролей."
    />

    <app-pi-entity-list
      #list
      [service]="listService"
      [cols]="cols"
      ariaLabel="Список организаций"
      [pageSize]="PAGE_SIZE"
      [localSort]="true"
      [initialSortKey]="'name'"
      [initialSortDir]="'asc'"
      emptyMessage="Нет организаций. Нажмите «Создать», чтобы добавить первую."
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

      <ng-template #typeTpl let-row>
        <div class="flex flex-wrap gap-1">
          @for (t of row.type || []; track t) {
            <span class="eyebrow text-[10px] px-2 py-1 hairline rounded-sm">
              {{ orgTypeLabel(t) }}
            </span>
          }
        </div>
      </ng-template>

      <!-- Page-level extras projected into wrapper toolbar -->
      <div toolbarExtras class="flex flex-col items-end gap-1 text-xs text-muted-foreground">
        <span data-test="org-count">
          {{ listTotal() }} {{ totalLabel(listTotal()) }}
        </span>
        <p data-test="sort-disclosure" class="text-[10px]">
          Сортировка применяется только к текущей странице ({{ PAGE_SIZE }} записей).
        </p>
      </div>
    </app-pi-entity-list>
  `,
})
export class OrganizationsPage {
  private readonly service = inject(OrganizationsService);
  private readonly dialog = inject(PiDialogService);
  private readonly toast = inject(PiToastService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly injector = inject(Injector);

  protected readonly PAGE_SIZE = PAGE_SIZE;

  /** 1-LOC adapter via `toEntityService` helper. */
  protected readonly listService = toEntityService(this.service);

  /** Wrapper ref — used for `reload()` after mutations + reading `total()` for count hint. */
  private readonly listRef = viewChild<
    PiEntityListComponent<Organization>
  >('list');

  /** Mirror of wrapper.total() for the toolbar count hint (page-level concern). */
  protected readonly listTotal = computed<number>(() => this.listRef()?.total() ?? 0);

  /**
   * Template refs via `viewChild` signal — modern Angular 20 pattern.
   * No `static: true` (always reads AFTER first CD), but wrapper's
   * initial render doesn't depend on these being ready synchronously
   * since the wrapper reads them as input signal values each CD cycle.
   */
  private readonly rowActionsTplRef = viewChild<TemplateRef<{ $implicit: Organization }>>(
    'rowActionsTpl',
  );
  private readonly typeTplRef = viewChild<TemplateRef<{ $implicit: Organization }>>(
    'typeTpl',
  );

  /**
   * Cell templates map — filters out undefined refs so the wrapper's
   * `Record<string, TemplateRef>` (non-nullable values) is satisfied
   * at compile time. Pre-resolution (first CD cycle), `cellTemplates`
   * is `{}`; the table renders normally and gains the type chips
   * column on CD-2+ when the template ref resolves.
   */
  protected readonly cellTemplates = computed<
    Record<string, TemplateRef<{ $implicit: Organization }>>
  >(() => {
    const result: Record<string, TemplateRef<{ $implicit: Organization }>> = {};
    const tpl = this.typeTplRef();
    if (tpl) {
      result['type'] = tpl;
    }
    return result;
  });

  protected readonly rowActionsTplBinding = computed<
    TemplateRef<{ $implicit: Organization }> | null
  >(() => this.rowActionsTplRef() ?? null);

  protected readonly cols: ColumnDef<Organization>[] = [
    { key: 'name', label: 'Название', sortable: true, sticky: 'left' },
    { key: 'shortName', label: 'Краткое', sortable: true, cellClass: 'empty-cell' },
    { key: 'inn', label: 'ИНН', sortable: true, cellClass: 'font-mono text-xs whitespace-nowrap' },
    { key: 'type', label: 'Типы' },
  ];

  protected orgTypeLabel(t: OrgType): string {
    return ORG_TYPE_LABELS[t] ?? t;
  }

  protected totalLabel(n: number): string {
    return pluralize(n, ['организация', 'организации', 'организаций']);
  }

  protected openCreate(): void {
    const ref = this.dialog.open(OrganizationFormDialogComponent, {
      data: null,
      width: 'lg',
      parentDestroyRef: this.destroyRef,
    });
    this.refreshOnDialogClose(ref);
  }

  protected openEdit(org: Organization): void {
    const ref = this.dialog.open(OrganizationFormDialogComponent, {
      data: org,
      width: 'lg',
      parentDestroyRef: this.destroyRef,
    });
    this.refreshOnDialogClose(ref);
  }

  protected onDelete(row: Organization): void {
    const ref = this.dialog.open(AlertDialogComponent, {
      data: {
        title: 'Удалить организацию?',
        description: `Удалить «${row.name}»? Это действие нельзя отменить.`,
        confirmLabel: 'Удалить',
        variant: 'destructive',
      },
      width: 'sm',
      parentDestroyRef: this.destroyRef,
    });
    onDialogCloseOnce(ref, this.injector, (confirmed: unknown) => {
      if (!confirmed) return;
      this.service.remove(row._id).subscribe((res) => {
        if (res.ok) {
          this.toast.success('Организация удалена');
          this.listRef()?.reload();
        } else {
          this.toast.error(extractErrorMessage(res.error));
        }
      });
    });
  }

  private refreshOnDialogClose<TResult>(ref: DialogRef<TResult>): void {
    onDialogCloseOnce(ref, this.injector, () => this.listRef()?.reload());
  }
}