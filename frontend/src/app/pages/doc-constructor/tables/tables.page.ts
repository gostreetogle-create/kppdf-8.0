import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  Injector,
  TemplateRef,
  ViewChild,
  inject,
} from '@angular/core';
import { PiEntityListComponent } from '../../../shared/dsl/entity-list/entity-list.component';
import { PiRowActionsComponent } from '../../../shared/ui/pi-row-actions/pi-row-actions.component';
import { ColumnDef } from '../../../shared/ui/pi-table.component';
import { PiDialogService, type DialogRef } from '../../../shared/ui/dialog/pi-dialog.service';
import { AlertDialogComponent } from '../../../shared/ui/dialog/pi-alert-dialog.component';
import { PiToastService } from '../../../shared/ui/toast';
import { onDialogCloseOnce } from '../../../shared/util/on-dialog-close-once';
import { extractErrorMessage } from '../../../core/silent-http';
import {
  TableTemplate,
  TableTemplatesService,
} from '../../../shared/services/pi-table-templates.service';
import { TableTemplateFormDialogComponent } from './table-template-form-dialog.component';

/**
 * TZ-232 Wave 2 — Tables (table-templates) страница переведена на <pi-entity-list>.
 * Входит в doc-constructor (композиция документов).
 * Backend sortBy статус не подтверждён → все sortable: false (безопасно).
 */
@Component({
  selector: 'app-tables-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PiEntityListComponent, PiRowActionsComponent],
  template: `
    <app-pi-entity-list
      endpoint="table-templates"
      [columns]="cols"
      title="Шаблоны таблиц"
      eyebrow="раздел · конструктор"
      description="Переиспользуемые пресеты колонок: спецификации, сметы, КП-таблицы."
      emptyMessage="Нет шаблонов. Нажмите «Создать», чтобы добавить первый."
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
export class TablesPage {
  private readonly service = inject(TableTemplatesService);
  private readonly dialog = inject(PiDialogService);
  private readonly toast = inject(PiToastService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly injector = inject(Injector);

  protected readonly cols: ColumnDef<TableTemplate>[] = [
    { key: 'name', label: 'Название', sortable: false, sticky: 'left' },
    {
      key: 'columns',
      label: 'Колонок',
      sortable: false,
      width: '5rem',
      align: 'right',
      accessor: (r) => String(r.columns?.length ?? 0),
    },
    {
      key: 'sampleRows',
      label: 'Образцов строк',
      sortable: false,
      width: '6rem',
      align: 'right',
      accessor: (r) => String(r.sampleRows?.length ?? 0),
    },
    {
      key: 'description',
      label: 'Описание',
      sortable: false,
      accessor: (r) => r.description ?? '—',
    },
  ];

  @ViewChild('rowActionsTpl', { static: true })
  protected readonly rowActionsTpl!: TemplateRef<{ $implicit: TableTemplate }>;

  protected openCreate(): void {
    this.refreshOnDialogClose(
      this.dialog.open(TableTemplateFormDialogComponent, {
        data: null,
        width: 'lg',
        parentDestroyRef: this.destroyRef,
      }),
    );
  }

  protected openEdit(row: TableTemplate): void {
    this.refreshOnDialogClose(
      this.dialog.open(TableTemplateFormDialogComponent, {
        data: row,
        width: 'lg',
        parentDestroyRef: this.destroyRef,
      }),
    );
  }

  protected onDelete(row: TableTemplate): void {
    const ref = this.dialog.open(AlertDialogComponent, {
      data: {
        title: 'Удалить шаблон таблицы?',
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
          this.toast.success('Шаблон удалён.');
        } else {
          this.toast.error(extractErrorMessage(res.error));
        }
      });
    });
  }

  private refreshOnDialogClose<TResult>(ref: DialogRef<TResult>): void {
    onDialogCloseOnce(ref, this.injector, () => {
      // TODO: refresh entity list once entity-list exposes reload() method.
    });
  }
}
