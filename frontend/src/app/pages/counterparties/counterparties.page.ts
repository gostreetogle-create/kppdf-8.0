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
import { Counterparty, CounterpartyService } from '../../shared/services/pi-counterparty.service';
import { CounterpartyFormDialogComponent } from './counterparty-form-dialog.component';

@Component({
  selector: 'app-counterparties-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PiEntityListComponent, PiRowActionsComponent],
  template: `
    <app-pi-entity-list
      endpoint="counterparties"
      [columns]="cols"
      title="Контрагенты"
      eyebrow="раздел · сделки"
      description="Покупатели, поставщики и другие внешние участники договоров и заказов."
      emptyMessage="Нет контрагентов. Нажмите «Создать», чтобы добавить первого."
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
export class CounterpartiesPage {
  private readonly service = inject(CounterpartyService);
  private readonly dialog = inject(PiDialogService);
  private readonly toast = inject(PiToastService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly injector = inject(Injector);

  protected readonly cols: ColumnDef<Counterparty>[] = [
    { key: 'name', label: 'Название', sortable: false, sticky: 'left' },
    {
      key: 'shortName',
      label: 'Краткое',
      sortable: false,
      accessor: (row) => row.shortName ?? '—',
    },
    { key: 'inn', label: 'ИНН', sortable: false, cellClass: 'font-mono text-xs whitespace-nowrap' },
    { key: 'legalType', label: 'Тип', sortable: false, accessor: (row) => row.legalType ?? '—' },
    {
      key: 'isActive',
      label: 'Активен',
      sortable: false,
      accessor: (row) => (row.isActive === false ? 'Нет' : 'Да'),
    },
  ];

  @ViewChild('rowActionsTpl', { static: true })
  protected readonly rowActionsTpl!: TemplateRef<{ $implicit: Counterparty }>;

  @ViewChild(PiEntityListComponent)
  private readonly entityList?: PiEntityListComponent<Counterparty>;

  protected openCreate(): void {
    this.refreshOnDialogClose(
      this.dialog.open(CounterpartyFormDialogComponent, {
        data: null,
        width: 'lg',
        parentDestroyRef: this.destroyRef,
      }),
    );
  }

  protected openEdit(row: Counterparty): void {
    this.refreshOnDialogClose(
      this.dialog.open(CounterpartyFormDialogComponent, {
        data: row,
        width: 'lg',
        parentDestroyRef: this.destroyRef,
      }),
    );
  }

  protected onDelete(row: Counterparty): void {
    const ref = this.dialog.open(AlertDialogComponent, {
      data: {
        title: 'Удалить контрагента?',
        description: `Удалить «${row.name}»? Это действие нельзя отменить.`,
        confirmLabel: 'Удалить',
        variant: 'destructive',
      },
      width: 'sm',
      parentDestroyRef: this.destroyRef,
    });
    onDialogCloseOnce(ref, this.injector, (confirmed: unknown) => {
      if (!confirmed) return;
      this.service.remove(row._id).subscribe((result) => {
        if (result.ok) {
          this.toast.success('Контрагент удалён.');
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
