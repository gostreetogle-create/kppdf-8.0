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
import { Currency, CurrencyService } from '../../shared/services/pi-currency.service';
import { CurrencyFormDialogComponent } from './currency-form-dialog.component';

@Component({
  selector: 'app-currencies-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PiEntityListComponent, PiRowActionsComponent],
  template: `
    <app-pi-entity-list
      endpoint="currencies"
      [columns]="cols"
      title="Валюты"
      eyebrow="раздел · справочники"
      description="Системный каталог валют с курсом, локалью и точностью отображения."
      emptyMessage="Нет валют. Нажмите «Создать», чтобы добавить первую."
      [rowActions]="rowActionsTpl"
      (create)="openCreate()"
    >
      <ng-template #rowActionsTpl let-row>
        <app-pi-row-actions
          [row]="row"
          [editLabel]="'Редактировать ' + row.label"
          [deleteLabel]="'Удалить ' + row.label"
          [deleteTitle]="row.isSystem ? 'Системную валюту нельзя удалить' : 'Удалить'"
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
export class CurrenciesPage {
  private readonly service = inject(CurrencyService);
  private readonly dialog = inject(PiDialogService);
  private readonly toast = inject(PiToastService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly injector = inject(Injector);

  protected readonly cols: ColumnDef<Currency>[] = [
    { key: 'key', label: 'Ключ', sortable: false, sticky: 'left', cellClass: 'font-mono text-xs' },
    { key: 'label', label: 'Название', sortable: false },
    { key: 'code', label: 'Код', sortable: false, cellClass: 'font-mono text-xs' },
    { key: 'symbol', label: 'Символ', sortable: false },
    { key: 'rate', label: 'Курс', sortable: false, numeric: true },
    {
      key: 'isBase',
      label: 'Базовая',
      sortable: false,
      accessor: (row) => (row.isBase ? 'Да' : 'Нет'),
    },
    {
      key: 'isActive',
      label: 'Активна',
      sortable: false,
      accessor: (row) => (row.isActive ? 'Да' : 'Нет'),
    },
  ];

  @ViewChild('rowActionsTpl', { static: true })
  protected readonly rowActionsTpl!: TemplateRef<{ $implicit: Currency }>;

  @ViewChild(PiEntityListComponent)
  private readonly entityList?: PiEntityListComponent<Currency>;

  protected openCreate(): void {
    this.refreshOnDialogClose(
      this.dialog.open(CurrencyFormDialogComponent, {
        data: null,
        width: 'lg',
        parentDestroyRef: this.destroyRef,
      }),
    );
  }

  protected openEdit(row: Currency): void {
    this.refreshOnDialogClose(
      this.dialog.open(CurrencyFormDialogComponent, {
        data: row,
        width: 'lg',
        parentDestroyRef: this.destroyRef,
      }),
    );
  }

  protected onDelete(row: Currency): void {
    if (row.isSystem) return;
    const ref = this.dialog.open(AlertDialogComponent, {
      data: {
        title: 'Удалить валюту?',
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
          this.toast.success('Валюта удалена.');
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
