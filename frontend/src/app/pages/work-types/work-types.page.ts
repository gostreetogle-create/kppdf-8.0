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
  WorkType,
  WorkTypesService,
} from '../../shared/services/pi-work-types.service';
import { WorkTypeFormDialogComponent } from './work-type-form-dialog.component';

/**
 * TZ-232 Wave 2 — WorkTypes страница переведена на <pi-entity-list>.
 * Backend /api/work-types НЕ поддерживает sortBy → все sortable: false.
 */
@Component({
  selector: 'app-work-types-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PiEntityListComponent, PiRowActionsComponent],
  template: `
    <app-pi-entity-list
      endpoint="work-types"
      [columns]="cols"
      title="Типы работ"
      eyebrow="раздел · производство"
      description="Классификация операций: пошив, сборка, упаковка, печать и т.п."
      emptyMessage="Нет типов работ. Нажмите «Создать», чтобы добавить первый."
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
export class WorkTypesPage {
  private readonly service = inject(WorkTypesService);
  private readonly dialog = inject(PiDialogService);
  private readonly toast = inject(PiToastService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly injector = inject(Injector);

  protected readonly cols: ColumnDef<WorkType>[] = [
    { key: 'name', label: 'Название', sortable: false, sticky: 'left' },
    { key: 'section', label: 'Раздел', sortable: false, accessor: (r) => r.section ?? '—' },
    {
      key: 'workCenterId',
      label: 'Рабочий центр',
      sortable: false,
      accessor: (r) => (typeof r.workCenterId === 'string' ? r.workCenterId : r.workCenterId?.name ?? '—'),
    },
    {
      key: 'isActive',
      label: 'Активен',
      sortable: false,
      width: '6rem',
      accessor: (r) => (r.isActive ? '✓' : '—'),
    },
  ];

  @ViewChild('rowActionsTpl', { static: true })
  protected readonly rowActionsTpl!: TemplateRef<{ $implicit: WorkType }>;

  protected openCreate(): void {
    this.refreshOnDialogClose(
      this.dialog.open(WorkTypeFormDialogComponent, {
        data: null,
        width: 'lg',
        parentDestroyRef: this.destroyRef,
      }),
    );
  }

  protected openEdit(row: WorkType): void {
    this.refreshOnDialogClose(
      this.dialog.open(WorkTypeFormDialogComponent, {
        data: row,
        width: 'lg',
        parentDestroyRef: this.destroyRef,
      }),
    );
  }

  protected onDelete(row: WorkType): void {
    const ref = this.dialog.open(AlertDialogComponent, {
      data: {
        title: 'Удалить тип работ?',
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
          this.toast.success('Тип работ удалён.');
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
