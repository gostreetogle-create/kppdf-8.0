import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  Injector,
  TemplateRef,
  ViewChild,
  inject,
} from '@angular/core';
import { Router } from '@angular/router';
import { PiEntityListComponent } from '../../shared/dsl/entity-list/entity-list.component';
import { PiRowActionsComponent } from '../../shared/ui/pi-row-actions/pi-row-actions.component';
import { ColumnDef } from '../../shared/ui/pi-table.component';
import { PiDialogService, type DialogRef } from '../../shared/ui/dialog/pi-dialog.service';
import { AlertDialogComponent } from '../../shared/ui/dialog/pi-alert-dialog.component';
import { PiToastService } from '../../shared/ui/toast';
import { onDialogCloseOnce } from '../../shared/util/on-dialog-close-once';
import { extractErrorMessage } from '../../core/silent-http';
import {
  ProductModule,
  ProductModulesService,
} from '../../shared/services/pi-product-modules.service';
import { ModuleFormDialogComponent } from './module-form-dialog.component';

/**
 * TZ-232 Wave 2 — Modules страница переведена на <pi-entity-list>.
 * Backend /api/product-modules НЕ поддерживает sortBy → все sortable: false.
 * (rowClick) открывает детальную страницу /modules/:id.
 */
@Component({
  selector: 'app-modules-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PiEntityListComponent, PiRowActionsComponent],
  template: `
    <app-pi-entity-list
      endpoint="product-modules"
      [columns]="cols"
      title="Модули продуктов"
      eyebrow="раздел · производство"
      description="Составные части продуктов: панели, рамки, двери, ящики и т.п."
      emptyMessage="Нет модулей. Нажмите «Создать», чтобы добавить первый."
      [rowActions]="rowActionsTpl"
      (rowClick)="openDetail($event)"
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
export class ModulesPage {
  private readonly router = inject(Router);
  private readonly service = inject(ProductModulesService);
  private readonly dialog = inject(PiDialogService);
  private readonly toast = inject(PiToastService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly injector = inject(Injector);

  protected readonly cols: ColumnDef<ProductModule>[] = [
    { key: 'name', label: 'Название', sortable: false, sticky: 'left' },
    { key: 'article', label: 'Артикул', sortable: false, cellClass: 'font-mono text-xs whitespace-nowrap', accessor: (r) => r.article ?? '—' },
    {
      key: 'weight',
      label: 'Вес, кг',
      sortable: false,
      width: '6rem',
      align: 'right',
      numeric: true,
      accessor: (r) => (r.weight != null ? String(r.weight) : '—'),
    },
    {
      key: 'materials',
      label: 'Материалов',
      sortable: false,
      width: '6rem',
      align: 'right',
      accessor: (r) => String(r.materials?.length ?? 0),
    },
    {
      key: 'workTypes',
      label: 'Операций',
      sortable: false,
      width: '6rem',
      align: 'right',
      accessor: (r) => String(r.workTypes?.length ?? 0),
    },
    {
      key: 'dimensions',
      label: 'Габариты',
      sortable: false,
      width: '13rem',
      accessor: (r) => {
        const d = r.dimensions;
        if (!d) return '—';
        if (d.width == null && d.height == null && d.depth == null) return '—';
        const parts: string[] = [];
        if (d.width != null) parts.push(String(d.width));
        if (d.height != null) parts.push(String(d.height));
        if (d.depth != null) parts.push(String(d.depth));
        return `${parts.join(' × ')} ${d.unit ?? ''}`.trim();
      },
    },
  ];

  @ViewChild('rowActionsTpl', { static: true })
  protected readonly rowActionsTpl!: TemplateRef<{ $implicit: ProductModule }>;

  protected openDetail(row: ProductModule): void {
    this.router.navigate(['/modules', row._id]);
  }

  protected openCreate(): void {
    this.refreshOnDialogClose(
      this.dialog.open(ModuleFormDialogComponent, {
        data: null,
        width: 'lg',
        parentDestroyRef: this.destroyRef,
      }),
    );
  }

  protected openEdit(row: ProductModule): void {
    this.refreshOnDialogClose(
      this.dialog.open(ModuleFormDialogComponent, {
        data: row,
        width: 'lg',
        parentDestroyRef: this.destroyRef,
      }),
    );
  }

  protected onDelete(row: ProductModule): void {
    const ref = this.dialog.open(AlertDialogComponent, {
      data: {
        title: 'Удалить модуль?',
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
          this.toast.success('Модуль удалён.');
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
