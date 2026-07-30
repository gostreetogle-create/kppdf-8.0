import {
  ChangeDetectionStrategy,
  Component,
  computed,
  signal,
} from '@angular/core';
import { PiEntityListComponent } from '../../shared/dsl/entity-list/entity-list.component';
import { type ColumnDef } from '../../shared/ui/pi-table.component';
import {
  StockMovement,
  MovementType,
} from './stock-movements.service';

/**
 * Полная документация страницы: docs/pages/stock-movements.page.md
 *
 * Мигрирована на <pi-entity-list> в Wave D (TZ-232.F).
 * Фильтр по типу движения — через [filters] slot + extraParams.
 */
@Component({
  selector: 'app-stock-movements-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PiEntityListComponent],
  template: `
    <app-pi-entity-list
      endpoint="stock-movements"
      [columns]="columns"
      title="Движения на складе"
      description="Журнал приходов, расходов и перемещений."
      [extraParams]="listParams()"
      [hideCreate]="true"
      [hideSearch]="true"
      [pageSize]="50"
      emptyMessage="Нет движений."
      ariaLabel="Движения на складе"
    >
      <select
        filters
        class="pi-input"
        [value]="selectedType()"
        (change)="onTypeChange($event)"
      >
        <option value="">Все типы</option>
        <option value="in">Приход</option>
        <option value="out">Расход</option>
        <option value="adjust">Корректировка</option>
        <option value="transfer">Перемещение</option>
      </select>
    </app-pi-entity-list>
  `,
})
export class StockMovementsPage {
  protected readonly selectedType = signal<string>('');

  protected readonly listParams = computed((): Record<string, string> => {
    const type = this.selectedType();
    return type ? { type } : {};
  });

  protected readonly columns: ColumnDef<StockMovement>[] = [
    {
      key: 'date',
      label: 'Дата',
      sortable: true,
      width: '10rem',
      accessor: (row: StockMovement) => row.date,
      format: (row: StockMovement) => this.formatDate(row.date),
    },
    {
      key: 'type',
      label: 'Тип',
      sortable: true,
      width: '7rem',
      accessor: (row: StockMovement) => this.typeLabel(row.type),
    },
    {
      key: 'product',
      label: 'Продукт',
      accessor: (row: StockMovement) => row.product?.name ?? '—',
    },
    {
      key: 'warehouse',
      label: 'Склад',
      accessor: (row: StockMovement) => row.warehouse?.name ?? '—',
    },
    { key: 'qty', label: 'Кол-во', align: 'right', numeric: true, width: '6rem' },
    {
      key: 'documentRef',
      label: 'Документ',
      width: '8rem',
      accessor: (row: StockMovement) => row.documentRef ?? '—',
    },
  ];

  protected onTypeChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.selectedType.set(value);
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
