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
  Material,
  MaterialsService,
} from '../../shared/services/materials.service';
import { MaterialFormDialogComponent } from './material-form-dialog.component';

/**
 * TZ-232 Wave 2 — Materials страница переведена на <pi-entity-list>.
 * DSL берёт на себя пагинацию / поиск / состояние загрузки и ошибки.
 * Страница владеет: row-actions, lifecycle диалогов, маппинг колонок.
 *
 * Backend /api/materials НЕ поддерживает sortBy → все sortable: false.
 */
@Component({
  selector: 'app-materials-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PiEntityListComponent, PiRowActionsComponent],
  template: `
    <app-pi-entity-list
      endpoint="materials"
      [columns]="cols"
      title="Материалы"
      eyebrow="раздел · справочники"
      description="Сырьё и полуфабрикаты: пластик, дерево, текстиль, металл, компоненты."
      emptyMessage="Нет материалов. Нажмите «Создать», чтобы добавить первый."
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
export class MaterialsPage {
  private readonly service = inject(MaterialsService);
  private readonly dialog = inject(PiDialogService);
  private readonly toast = inject(PiToastService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly injector = inject(Injector);

  protected readonly cols: ColumnDef<Material>[] = [
    { key: 'name', label: 'Название', sortable: false, sticky: 'left' },
    { key: 'article', label: 'Артикул', sortable: false, cellClass: 'font-mono text-xs whitespace-nowrap' },
    { key: 'sku', label: 'SKU', sortable: false, cellClass: 'font-mono text-xs whitespace-nowrap', accessor: (r) => r.sku ?? '—' },
    { key: 'unit', label: 'Ед.', sortable: false, width: '5rem' },
    { key: 'categoryId', label: 'Категория', sortable: false, accessor: (r) => r.categoryId ?? '—' },
    { key: 'description', label: 'Описание', sortable: false, accessor: (r) => r.description ?? '—' },
  ];

  @ViewChild('rowActionsTpl', { static: true })
  protected readonly rowActionsTpl!: TemplateRef<{ $implicit: Material }>;

  protected openCreate(): void {
    this.refreshOnDialogClose(
      this.dialog.open(MaterialFormDialogComponent, {
        data: null,
        width: 'lg',
        parentDestroyRef: this.destroyRef,
      }),
    );
  }

  protected openEdit(row: Material): void {
    this.refreshOnDialogClose(
      this.dialog.open(MaterialFormDialogComponent, {
        data: row,
        width: 'lg',
        parentDestroyRef: this.destroyRef,
      }),
    );
  }

  protected onDelete(row: Material): void {
    const ref = this.dialog.open(AlertDialogComponent, {
      data: {
        title: 'Удалить материал?',
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
          this.toast.success('Материал удалён.');
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
