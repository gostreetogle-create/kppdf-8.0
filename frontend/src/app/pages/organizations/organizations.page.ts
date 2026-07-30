import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  Injector,
  TemplateRef,
  ViewChild,
  inject,
} from '@angular/core';
import { PiEntityListComponent } from '../../shared/dsl/entity-list/entity-list.component';
import { PiRowActionsComponent } from '../../shared/ui/pi-row-actions/pi-row-actions.component';
import { ColumnDef } from '../../shared/ui/pi-table.component';
import { PiDialogService, type DialogRef } from '../../shared/ui/dialog/pi-dialog.service';
import { AlertDialogComponent } from '../../shared/ui/dialog/pi-alert-dialog.component';
import { PiToastService } from '../../shared/ui/toast';
import { onDialogCloseOnce } from '../../shared/util/on-dialog-close-once';
import { extractErrorMessage } from '../../core/silent-http';
import {
  Organization,
  OrganizationsService,
  ORG_TYPE_LABELS,
} from '../../shared/services/organizations.service';
import { OrganizationFormDialogComponent } from './organization-form-dialog.component';

/**
 * TZ-232 sub-TZ PoC — OrganizationsPage migrated to <pi-entity-list>.
 *
 * DSL handles: server-side pagination, search (300ms debounce), loading/error
 * states, page header, toolbar, search input, create button.
 *
 * Page owns: row-action template (edit + delete), Dialog lifecycle, custom
 * column accessor (type → comma-separated ORG_TYPE_LABELS).
 *
 * Note: PiEntityListComponent does NOT yet expose [cellTemplates] — type column
 * uses `accessor` to render comma-separated types. Future: full chip template
 * via content projection once DSL supports it.
 */
@Component({
  selector: 'app-organizations-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PiEntityListComponent, PiRowActionsComponent],
  template: `
    <app-pi-entity-list
      endpoint="organizations"
      [columns]="cols"
      title="Организации"
      eyebrow="раздел · партнёры"
      description="Юр. лица и ИП — покупатели, поставщики, подрядчики. Один контрагент может совмещать несколько ролей."
      emptyMessage="Нет организаций. Нажмите «Создать», чтобы добавить первую."
      [rowActions]="rowActionsTpl"
      (create)="openCreate()"
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
    </app-pi-entity-list>
  `,
})
export class OrganizationsPage {
  private readonly service = inject(OrganizationsService);
  private readonly dialog = inject(PiDialogService);
  private readonly toast = inject(PiToastService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly injector = inject(Injector);

  /**
   * TZ-104.3 batch-2: organizations backend = Pattern A-mixed (no `sortBy`
   * support). Sending `sortKey`/`sortDir` would 400. We disable server-side
   * sort here; client-side initial sort is configured via [initialSortKey].
   * TODO: enable server-side sort once backend lands `sortBy` for `/api/organizations`.
   */
  protected readonly cols: ColumnDef<Organization>[] = [
    { key: 'name', label: 'Название', sortable: false, sticky: 'left' },
    { key: 'shortName', label: 'Краткое', sortable: false, cellClass: 'empty-cell' },
    { key: 'inn', label: 'ИНН', sortable: false, cellClass: 'font-mono text-xs whitespace-nowrap' },
    {
      key: 'type',
      label: 'Типы',
      accessor: (row) =>
        row.type?.map((t) => ORG_TYPE_LABELS[t] ?? t).join(', ') ?? '—',
    },
  ];

  @ViewChild('rowActionsTpl', { static: true })
  protected readonly rowActionsTpl!: TemplateRef<{ $implicit: Organization }>;

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
          this.toast.success('Организация удалена. Обновите страницу.');
        } else {
          this.toast.error(extractErrorMessage(res.error));
        }
      });
    });
  }

  private refreshOnDialogClose<TResult>(ref: DialogRef<TResult>): void {
    onDialogCloseOnce(ref, this.injector, () => {
      // TODO: refresh entity list gracefully after entity-list exposes reload() method.
    });
  }
}
