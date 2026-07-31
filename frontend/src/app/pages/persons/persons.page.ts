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
import { Person, PersonService } from '../../shared/services/pi-person.service';
import { PersonFormDialogComponent } from './person-form-dialog.component';

@Component({
  selector: 'app-persons-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PiEntityListComponent, PiRowActionsComponent],
  template: `
    <app-pi-entity-list
      endpoint="persons"
      [columns]="cols"
      title="Физические лица"
      eyebrow="раздел · сделки"
      description="Контактные лица, подписанты и сотрудники, связанные с операционными документами."
      emptyMessage="Нет физических лиц. Нажмите «Создать», чтобы добавить первого."
      [rowActions]="rowActionsTpl"
      (create)="openCreate()"
    >
      <ng-template #rowActionsTpl let-row>
        <app-pi-row-actions
          [row]="row"
          [editLabel]="'Редактировать ' + fullName(row)"
          [deleteLabel]="'Удалить ' + fullName(row)"
          [dataTestEdit]="'edit-button-' + row._id"
          [dataTestDelete]="'delete-button-' + row._id"
          (edit)="openEdit($event)"
          (delete)="onDelete($event)"
        />
      </ng-template>
    </app-pi-entity-list>
  `,
})
export class PersonsPage {
  private readonly service = inject(PersonService);
  private readonly dialog = inject(PiDialogService);
  private readonly toast = inject(PiToastService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly injector = inject(Injector);

  protected readonly cols: ColumnDef<Person>[] = [
    { key: 'lastName', label: 'Фамилия', sortable: false, sticky: 'left' },
    { key: 'firstName', label: 'Имя', sortable: false },
    {
      key: 'patronymic',
      label: 'Отчество',
      sortable: false,
      accessor: (row) => row.patronymic ?? '—',
    },
    { key: 'phone', label: 'Телефон', sortable: false, accessor: (row) => row.phone ?? '—' },
    { key: 'email', label: 'E-mail', sortable: false, accessor: (row) => row.email ?? '—' },
    {
      key: 'position',
      label: 'Должность',
      sortable: false,
      accessor: (row) => row.position ?? '—',
    },
  ];

  @ViewChild('rowActionsTpl', { static: true })
  protected readonly rowActionsTpl!: TemplateRef<{ $implicit: Person }>;

  @ViewChild(PiEntityListComponent)
  private readonly entityList?: PiEntityListComponent<Person>;

  protected fullName(row: Person): string {
    return [row.lastName, row.firstName, row.patronymic].filter(Boolean).join(' ');
  }

  protected openCreate(): void {
    this.refreshOnDialogClose(
      this.dialog.open(PersonFormDialogComponent, {
        data: null,
        width: 'md',
        parentDestroyRef: this.destroyRef,
      }),
    );
  }

  protected openEdit(row: Person): void {
    this.refreshOnDialogClose(
      this.dialog.open(PersonFormDialogComponent, {
        data: row,
        width: 'md',
        parentDestroyRef: this.destroyRef,
      }),
    );
  }

  protected onDelete(row: Person): void {
    const ref = this.dialog.open(AlertDialogComponent, {
      data: {
        title: 'Удалить физическое лицо?',
        description: `Удалить «${this.fullName(row)}»? Это действие нельзя отменить.`,
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
          this.toast.success('Физическое лицо удалено.');
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
