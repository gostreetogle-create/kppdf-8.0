import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  Injector,
  TemplateRef,
  ViewChild,
  computed,
  inject,
  signal,
} from '@angular/core';
import { httpResource } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { PiGroupWorkspaceComponent } from '../../shared/page/pi-group-workspace.component';
import { WAREHOUSE_TOC_CHIPS } from './warehouse-group-chips';
import { ButtonComponent } from '../../shared/ui/button/button.component';
import { PiRowActionsComponent } from '../../shared/ui/pi-row-actions/pi-row-actions.component';
import { PiToastService } from '../../shared/ui/toast';
import { PiDialogService } from '../../shared/ui/dialog/pi-dialog.service';
import { AlertDialogComponent } from '../../shared/ui/dialog/pi-alert-dialog.component';
import { ColumnDef, TableComponent } from '../../shared/ui/pi-table.component';
import { onDialogCloseOnce } from '../../shared/util/on-dialog-close-once';
import { extractErrorMessage } from '../../core/silent-http';
import { API_BASE_URL } from '../../core/api.tokens';
import { Warehouse, WarehousesService } from './warehouses.service';
import { WarehouseFormDialogComponent } from './warehouse-form-dialog.component';

const TYPE_LABELS: Record<string, string> = {
  production: 'Производство',
  main: 'Основной',
  branch: 'Филиал',
  transit: 'Транзит',
  other: 'Другой',
};

/**
 * Warehouses registry — CRUD for workshop warehouses (W1 READY gate).
 */
@Component({
  selector: 'app-warehouses-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormsModule,
    PiGroupWorkspaceComponent,
    ButtonComponent,
    PiRowActionsComponent,
    TableComponent,
  ],
  template: `
    <app-pi-group-workspace [toc]="toc" tocActiveId="warehouses" [chips]="[]" activeId="">
      <div tools class="flex items-center gap-form-field flex-wrap w-full">
        <input
          type="search"
          class="pi-input w-56"
          placeholder="Поиск по названию…"
          [ngModel]="searchQuery()"
          (ngModelChange)="searchQuery.set($event)"
          aria-label="Поиск складов"
          data-test="warehouse-search"
        />
        <span class="text-sm text-muted-foreground">{{ filtered().length }} складов</span>
        <span class="flex-1"></span>
        <app-pi-button variant="default" (click)="openCreate()" data-test="create-warehouse">
          + Склад
        </app-pi-button>
      </div>

      @if (error()) {
        <div
          role="alert"
          class="mb-6 border hairline border-destructive rounded-sm px-4 py-3 text-sm text-destructive"
        >
          {{ error() }}
        </div>
      }

      <div class="pi-table-surface overflow-x-auto">
        <app-pi-table
          [data]="filtered()"
          [columns]="columns"
          [cellTemplates]="tpls()"
          [rowActions]="rowActionsTpl"
          [loading]="loading()"
          [emptyMessage]="'Нет складов. Создайте первый — «+ Склад».'"
          [initialSortKey]="'name'"
          [initialSortDir]="'asc'"
          ariaLabel="Реестр складов"
          data-test="warehouses-table"
        />
      </div>

      <ng-template #activeTpl let-row>
        <span class="text-sm" [class.text-muted-foreground]="!row.isActive">
          {{ row.isActive ? 'Да' : 'Нет' }}
        </span>
      </ng-template>

      <ng-template #rowActionsTpl let-row>
        <app-pi-row-actions
          [row]="row"
          editLabel="Редактировать"
          deleteLabel="Удалить"
          [dataTestEdit]="'edit-warehouse-' + row._id"
          [dataTestDelete]="'delete-warehouse-' + row._id"
          (edit)="openEdit($event)"
          (delete)="onDelete($event)"
        />
      </ng-template>
    </app-pi-group-workspace>
  `,
})
export class WarehousesPage {
  private readonly baseUrl = inject(API_BASE_URL);
  private readonly svc = inject(WarehousesService);
  private readonly toast = inject(PiToastService);
  private readonly dialog = inject(PiDialogService);
  private readonly injector = inject(Injector);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly toc = WAREHOUSE_TOC_CHIPS;
  protected readonly searchQuery = signal('');

  protected readonly listRes = httpResource<Warehouse[]>(() => ({
    url: `${this.baseUrl}/warehouses`,
  }));

  protected readonly items = computed(() => this.listRes.value() ?? []);
  protected readonly loading = computed(() => this.listRes.isLoading());
  protected readonly error = computed<string | null>(() => {
    const err = this.listRes.error() as
      import('@angular/common/http').HttpErrorResponse | undefined;
    return err ? extractErrorMessage(err) : null;
  });

  protected readonly filtered = computed(() => {
    const q = this.searchQuery().trim().toLowerCase();
    const list = this.items();
    if (!q) return list;
    return list.filter((w) => w.name.toLowerCase().includes(q));
  });

  @ViewChild('rowActionsTpl', { static: true })
  protected readonly rowActionsTpl!: TemplateRef<{ $implicit: Warehouse }>;

  @ViewChild('activeTpl', { static: true })
  protected readonly activeTpl!: TemplateRef<{ $implicit: Warehouse }>;

  protected readonly tpls = computed(() => ({
    isActive: this.activeTpl,
  }));

  protected readonly columns: ColumnDef<Warehouse>[] = [
    { key: 'name', label: 'Название', sortable: true },
    {
      key: 'type',
      label: 'Тип',
      width: '9rem',
      accessor: (row) => TYPE_LABELS[row.type] ?? row.type,
    },
    {
      key: 'zoneNames',
      label: 'Зоны',
      accessor: (row) => (row.zoneNames?.length ? row.zoneNames.join(', ') : '—'),
    },
    { key: 'isActive', label: 'Активен', width: '6rem' },
  ];

  protected openCreate(): void {
    const ref = this.dialog.open(WarehouseFormDialogComponent, { data: null, width: 'md' });
    onDialogCloseOnce(ref, this.injector, () => this.listRes.reload());
  }

  protected openEdit(row: Warehouse): void {
    const ref = this.dialog.open(WarehouseFormDialogComponent, { data: row, width: 'md' });
    onDialogCloseOnce(ref, this.injector, () => this.listRes.reload());
  }

  protected onDelete(row: Warehouse): void {
    const ref = this.dialog.open(AlertDialogComponent, {
      data: {
        title: 'Удалить склад?',
        message: `«${row.name}» будет удалён. Позиции остатков на нём могут стать недоступны.`,
        confirmLabel: 'Удалить',
        variant: 'destructive',
      },
      parentDestroyRef: this.destroyRef,
    });
    onDialogCloseOnce(ref, this.injector, (confirmed: unknown) => {
      if (!confirmed) return;
      this.svc.remove(row._id).subscribe((res) => {
        if (res.ok) {
          this.toast.success('Склад удалён');
          this.listRes.reload();
        } else {
          this.toast.error(extractErrorMessage(res.error));
        }
      });
    });
  }
}
