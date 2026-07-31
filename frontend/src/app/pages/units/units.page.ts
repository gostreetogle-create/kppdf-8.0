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
import { Unit, UnitsService } from '../dictionaries/units.service';
import { UnitFormDialogComponent } from './unit-form-dialog.component';

@Component({
  selector: 'app-units-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PiEntityListComponent, PiRowActionsComponent],
  template: `
    <app-pi-entity-list
      endpoint="units"
      [columns]="cols"
      title="Единицы измерения"
      eyebrow="раздел · справочники"
      description="Единицы, используемые в материалах, продуктах и производственных операциях."
      emptyMessage="Нет единиц измерения. Нажмите «Создать», чтобы добавить первую."
      [rowActions]="rowActionsTpl"
      (create)="openCreate()"
    >
      <ng-template #rowActionsTpl let-row>
        <app-pi-row-actions
          [row]="row"
          [editLabel]="
            row.isSystem
              ? 'Системная единица — редактирование ограничено'
              : 'Редактировать ' + row.label
          "
          [deleteLabel]="'Удалить ' + row.label"
          [deleteTitle]="row.isSystem ? 'Системная единица — нельзя удалить' : 'Удалить'"
          [deleteDisabled]="row.isSystem"
          [dataTestEdit]="'edit-button-' + row.key"
          [dataTestDelete]="'delete-button-' + row.key"
          (edit)="openEdit($event)"
          (delete)="onDelete($event)"
        />
      </ng-template>
    </app-pi-entity-list>
  `,
})
export class UnitsPage {
  private readonly service = inject(UnitsService);
  private readonly dialog = inject(PiDialogService);
  private readonly toast = inject(PiToastService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly injector = inject(Injector);

  protected readonly cols: ColumnDef<Unit>[] = [
    { key: 'key', label: 'Ключ', sortable: false, sticky: 'left', cellClass: 'font-mono text-xs' },
    { key: 'label', label: 'Название', sortable: false },
    { key: 'symbol', label: 'Символ', sortable: false, accessor: (row) => row.symbol ?? '—' },
    {
      key: 'category',
      label: 'Категория',
      sortable: false,
      accessor: (row) => row.category ?? '—',
    },
    {
      key: 'isActive',
      label: 'Активна',
      sortable: false,
      accessor: (row) => (row.isActive ? 'Да' : 'Нет'),
    },
    {
      key: 'isSystem',
      label: 'Системная',
      sortable: false,
      accessor: (row) => (row.isSystem ? 'Да' : 'Нет'),
    },
  ];

  @ViewChild('rowActionsTpl', { static: true })
  protected readonly rowActionsTpl!: TemplateRef<{ $implicit: Unit }>;

  @ViewChild(PiEntityListComponent)
  private readonly entityList?: PiEntityListComponent<Unit>;

  protected openCreate(): void {
    this.refreshOnDialogClose(
      this.dialog.open(UnitFormDialogComponent, {
        data: null,
        width: 'md',
        parentDestroyRef: this.destroyRef,
      }),
    );
  }

  protected openEdit(row: Unit): void {
    this.refreshOnDialogClose(
      this.dialog.open(UnitFormDialogComponent, {
        data: row,
        width: 'md',
        parentDestroyRef: this.destroyRef,
      }),
    );
  }

  protected onDelete(row: Unit): void {
    if (row.isSystem) return;
    const ref = this.dialog.open(AlertDialogComponent, {
      data: {
        title: 'Удалить единицу?',
        description: `Удалить «${row.label}» (${row.key})? Это действие нельзя отменить.`,
        confirmLabel: 'Удалить',
        variant: 'destructive',
      },
      width: 'sm',
      parentDestroyRef: this.destroyRef,
    });
    onDialogCloseOnce(ref, this.injector, (confirmed: unknown) => {
      if (!confirmed) return;
      this.service.remove(row.key).subscribe((result) => {
        if (result.ok) {
          this.toast.success('Единица удалена.');
          this.entityList?.reload();
        } else this.toast.error(extractErrorMessage(result.error));
      });
    });
  }

  private refreshOnDialogClose<TResult>(ref: DialogRef<TResult>): void {
    onDialogCloseOnce(ref, this.injector, () => {
      this.entityList?.reload();
    });
  }
}
