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
  Product,
  ProductsService,
} from '../../shared/services/products.service';
import { ProductFormDialogComponent } from './product-form-dialog.component';

/**
 * Inline русские подписи для Product.kind / Product.status. Константы
 * лежат здесь, а не в ProductsService, потому что сервис остаётся чисто
 * data-уровневым (тип/статус — UI presentation concern). Дубликат с
 * любой страницей-потребителем допустим пока их ≤ 2; при третьем
 * использовании — выносим в shared/ui-labels/.
 */
const PRODUCT_KIND_LABELS: Record<Product['kind'], string> = {
  good: 'Товар',
  service: 'Услуга',
  work: 'Работа',
};
const PRODUCT_STATUS_LABELS: Record<string, string> = {
  new: 'Новый',
  active: 'Активный',
  archived: 'Архивный',
  draft: 'Черновик',
};

/**
 * TZ-232 Wave 2 — Products страница переведена на <pi-entity-list>.
 *
 * Backend /api/products УЖЕ поддерживает sortBy (см. product.service.ts:51,65),
 * поэтому sortable=true на колонках с серверной поддержкой.
 * (rowClick) открывает детальную страницу /products/:id.
 */
@Component({
  selector: 'app-products-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PiEntityListComponent, PiRowActionsComponent],
  template: `
    <app-pi-entity-list
      endpoint="products"
      [columns]="cols"
      title="Продукты"
      eyebrow="раздел · номенклатура"
      description="Товары, услуги, работы. Используются в заказах и КП."
      emptyMessage="Нет продуктов. Нажмите «Создать», чтобы добавить первый."
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
export class ProductsPage {
  private readonly router = inject(Router);
  private readonly service = inject(ProductsService);
  private readonly dialog = inject(PiDialogService);
  private readonly toast = inject(PiToastService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly injector = inject(Injector);

  protected readonly cols: ColumnDef<Product>[] = [
    { key: 'name', label: 'Название', sortable: true, sticky: 'left' },
    { key: 'sku', label: 'SKU', sortable: true, cellClass: 'font-mono text-xs whitespace-nowrap', accessor: (r) => r.sku ?? '—' },
    {
      key: 'kind',
      label: 'Тип',
      sortable: true,
      width: '7rem',
      accessor: (r) => PRODUCT_KIND_LABELS[r.kind] ?? r.kind,
    },
    { key: 'unit', label: 'Ед.', sortable: false, width: '5rem' },
    {
      key: 'status',
      label: 'Статус',
      sortable: true,
      width: '8rem',
      accessor: (r) => (r.status ? PRODUCT_STATUS_LABELS[r.status] ?? '—' : '—'),
    },
    {
      key: 'categoryId',
      label: 'Категория',
      sortable: false,
      accessor: (r) => r.categoryId ?? '—',
    },
  ];

  @ViewChild('rowActionsTpl', { static: true })
  protected readonly rowActionsTpl!: TemplateRef<{ $implicit: Product }>;

  protected openDetail(row: Product): void {
    this.router.navigate(['/products', row._id]);
  }

  protected openCreate(): void {
    this.refreshOnDialogClose(
      this.dialog.open(ProductFormDialogComponent, {
        data: null,
        width: 'lg',
        parentDestroyRef: this.destroyRef,
      }),
    );
  }

  protected openEdit(row: Product): void {
    this.refreshOnDialogClose(
      this.dialog.open(ProductFormDialogComponent, {
        data: row,
        width: 'lg',
        parentDestroyRef: this.destroyRef,
      }),
    );
  }

  protected onDelete(row: Product): void {
    const ref = this.dialog.open(AlertDialogComponent, {
      data: {
        title: 'Удалить продукт?',
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
          this.toast.success('Продукт удалён.');
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
