import { ChangeDetectionStrategy, Component, OnInit, TemplateRef, ViewChild, computed, inject, signal } from '@angular/core';
import { PiPageHeaderComponent } from '../../shared/page/pi-page-header.component';
import { PiSectionComponent } from '../../shared/page/pi-section.component';
import { PiToolbarComponent } from '../../shared/page/pi-toolbar.component';
import { ButtonComponent } from '../../shared/ui/button/button.component';
import { TableComponent, ColumnDef } from '../../shared/ui/pi-table.component';
import { StockMovementsService, StockMovement, MovementType } from './stock-movements.service';

/**
 * StockMovementsPage — log of all stock movements (in/out/adjust/transfer).
 */
@Component({
  selector: 'app-stock-movements-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    PiPageHeaderComponent,
    PiSectionComponent,
    PiToolbarComponent,
    ButtonComponent,
    TableComponent,
  ],
  template: `
    <app-pi-page-header
      eyebrow="07 · склад"
      title="Движения на складе"
      description="Журнал приходов, расходов и перемещений."
    />

    <app-pi-section title="Фильтры" eyebrow="I">
      <app-pi-toolbar>
        <select class="pi-input" [value]="selectedType()" (change)="onTypeChange($event)">
          <option value="">Все типы</option>
          <option value="in">Приход</option>
          <option value="out">Расход</option>
          <option value="adjust">Корректировка</option>
          <option value="transfer">Перемещение</option>
        </select>
        <app-pi-button variant="ghost" size="sm" (click)="clearFilters()">Сбросить</app-pi-button>
      </app-pi-toolbar>
    </app-pi-section>

    <app-pi-section title="Движения" [hint]="totalItems() + ' записей'" eyebrow="II">
      <app-pi-table
        [data]="items()"
        [columns]="columns"
        [loading]="loading()"
        [total]="items().length"
        [pageSize]="50"
        [emptyMessage]="'Нет движений.'"
        [initialSortKey]="'date'"
        [initialSortDir]="'desc'"
        ariaLabel="Движения на складе"
        data-test="stock-movements-table"
      />
    </app-pi-section>
  `,
})
export class StockMovementsPage implements OnInit {
  private readonly movementsService = inject(StockMovementsService);

  protected readonly loading = signal(true);
  protected readonly items = signal<StockMovement[]>([]);
  protected readonly selectedType = signal<string>('');

  protected readonly totalItems = computed(() => this.items().length);

  protected readonly columns: ColumnDef<StockMovement>[] = [
    { key: 'date', label: 'Дата', sortable: true, width: '10rem', numeric: true, accessor: (row) => this.formatDate(row.date) },
    { key: 'type', label: 'Тип', sortable: true, width: '7rem', accessor: (row) => this.typeLabel(row.type) },
    { key: 'product', label: 'Продукт', accessor: (row) => row.product?.name ?? '—' },
    { key: 'warehouse', label: 'Склад', accessor: (row) => row.warehouse?.name ?? '—' },
    { key: 'qty', label: 'Кол-во', align: 'right', numeric: true, width: '6rem' },
    { key: 'documentRef', label: 'Документ', width: '8rem', accessor: (row) => row.documentRef ?? '—' },
  ];

  ngOnInit(): void {
    this.loadItems();
  }

  onTypeChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.selectedType.set(value);
    this.loadItems();
  }

  clearFilters(): void {
    this.selectedType.set('');
    this.loadItems();
  }

  private loadItems(): void {
    this.loading.set(true);
    const params: { type?: string } = {};
    if (this.selectedType()) {
      params.type = this.selectedType();
    }
    this.movementsService.list(params).subscribe((res) => {
      if (res.ok) {
        this.items.set(res.data.items);
      }
      this.loading.set(false);
    });
  }

  protected typeLabel(type: MovementType): string {
    const labels: Record<MovementType, string> = {
      in: 'Приход',
      out: 'Расход',
      adjust: 'Корр.',
      transfer: 'Перемещ.',
    };
    return labels[type] ?? type;
  }

  protected formatDate(date: string): string {
    return new Date(date).toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  }
}
