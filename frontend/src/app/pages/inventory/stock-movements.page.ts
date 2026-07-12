import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { PiPageHeaderComponent } from '../../shared/page/pi-page-header.component';
import { PiSectionComponent } from '../../shared/page/pi-section.component';
import { PiToolbarComponent } from '../../shared/page/pi-toolbar.component';
import { PiEmptyStateComponent } from '../../shared/ui/pi-empty-state/pi-empty-state.component';
import { ButtonComponent } from '../../shared/ui/button/button.component';
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
    PiEmptyStateComponent,
    ButtonComponent,
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
      @if (loading()) {
        <p class="text-sm text-muted-foreground">Загрузка...</p>
      } @else if (items().length === 0) {
        <app-pi-empty-state [colspan]="1" message="Нет движений." eyebrow="00" />
      } @else {
        <div class="hairline rounded-sm overflow-hidden">
          <table class="w-full text-sm">
            <thead class="hairline-b">
              <tr>
                <th class="eyebrow py-3 px-4 text-left">Дата</th>
                <th class="eyebrow py-3 px-4 text-left">Тип</th>
                <th class="eyebrow py-3 px-4 text-left">Продукт</th>
                <th class="eyebrow py-3 px-4 text-left">Склад</th>
                <th class="eyebrow py-3 px-4 text-right">Кол-во</th>
                <th class="eyebrow py-3 px-4 text-left">Документ</th>
              </tr>
            </thead>
            <tbody>
              @for (item of items(); track item._id) {
                <tr class="hairline-b hover:bg-paper-2 transition-colors">
                  <td class="py-3 px-4 font-mono text-xs">{{ formatDate(item.date) }}</td>
                  <td class="py-3 px-4">
                    <span class="eyebrow text-xs" [class]="typeClass(item.type)">{{ typeLabel(item.type) }}</span>
                  </td>
                  <td class="py-3 px-4">{{ item.product?.name ?? '—' }}</td>
                  <td class="py-3 px-4 text-muted-foreground">{{ item.warehouse?.name ?? '—' }}</td>
                  <td class="py-3 px-4 text-right font-mono">{{ item.qty }}</td>
                  <td class="py-3 px-4 text-muted-foreground font-mono text-xs">{{ item.documentRef ?? '—' }}</td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }
    </app-pi-section>
  `,
})
export class StockMovementsPage implements OnInit {
  private readonly movementsService = inject(StockMovementsService);

  protected readonly loading = signal(true);
  protected readonly items = signal<StockMovement[]>([]);
  protected readonly selectedType = signal<string>('');

  protected readonly totalItems = computed(() => this.items().length);

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

  protected typeClass(type: MovementType): string {
    const classes: Record<MovementType, string> = {
      in: 'text-green-700',
      out: 'text-destructive',
      adjust: 'text-muted-foreground',
      transfer: 'text-accent-cool',
    };
    return classes[type] ?? '';
  }

  protected formatDate(date: string): string {
    return new Date(date).toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  }
}
