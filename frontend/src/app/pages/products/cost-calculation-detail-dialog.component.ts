import {
  ChangeDetectionStrategy,
  Component,
  inject,
} from '@angular/core';
import { PI_DIALOG_DATA } from '../../shared/ui/dialog/dialog.tokens';
import { CostCalculation } from '../../shared/services/pi-cost-calculations.service';

interface DialogData {
  costCalculation: CostCalculation;
}

/**
 * TZ-85 Phase D — Breakdown dialog for a single CostCalculation snapshot.
 *
 * Shows 4 sub-sections:
 *   1. Материалы (aggregated by materialId across modules)
 *   2. Трудоёмкость (aggregated by workTypeId)
 *   3. Накладные (overheadPercent × totalMaterialCost)
 *   4. Итого (totalCost)
 */
@Component({
  selector: 'app-cost-calculation-detail-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="min-w-[480px] max-w-[700px]">
      <h2 class="font-display text-lg font-semibold mb-4">
        Себестоимость — снимок
      </h2>
      <p class="text-sm text-muted-foreground mb-6">
        {{ formatDate(cc.calculatedAt || cc.createdAt) }}
        @if (cc.isActive) {
          <span class="ml-2 inline-flex items-center gap-1 text-xs font-medium text-sunrise-warm">● Активен</span>
        }
      </p>

      <!-- 1. Материалы -->
      @if (cc.materials.length > 0) {
        <section class="mb-6">
          <h3 class="eyebrow mb-2">Материалы</h3>
          <div class="hairline rounded-sm overflow-x-auto">
            <table class="w-full text-sm">
              <thead class="hairline-b">
                <tr>
                  <th class="pi-cell eyebrow text-left">Наименование</th>
                  <th class="pi-cell-numeric eyebrow w-20">Кол-во</th>
                  <th class="pi-cell eyebrow w-16">Ед.</th>
                  <th class="pi-cell-numeric eyebrow w-28">Цена/ед.</th>
                  <th class="pi-cell-numeric eyebrow w-28">Сумма</th>
                </tr>
              </thead>
              <tbody>
                @for (m of cc.materials; track m.materialId) {
                  <tr class="pi-table-row pi-table-row-odd last:border-0">
                    <td class="pi-cell align-top">{{ m.materialName ?? '—' }}</td>
                    <td class="pi-cell-numeric align-top font-mono">{{ m.quantity }}</td>
                    <td class="pi-cell align-top text-muted-foreground">{{ m.unit ?? '—' }}</td>
                    <td class="pi-cell-numeric align-top font-mono">{{ formatRuble(m.pricePerUnit) }}</td>
                    <td class="pi-cell-numeric align-top font-mono font-medium">{{ formatRuble(m.total) }}</td>
                  </tr>
                }
              </tbody>
              <tfoot class="hairline-t">
                <tr>
                  <td colspan="4" class="pi-cell eyebrow text-right">Итого материалы</td>
                  <td class="pi-cell-numeric font-mono font-medium">{{ formatRuble(cc.totalMaterialCost) }}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </section>
      }

      <!-- 2. Трудоёмкость -->
      @if (cc.labor.length > 0) {
        <section class="mb-6">
          <h3 class="eyebrow mb-2">Трудоёмкость</h3>
          <div class="hairline rounded-sm overflow-x-auto">
            <table class="w-full text-sm">
              <thead class="hairline-b">
                <tr>
                  <th class="pi-cell eyebrow text-left">Вид работ</th>
                  <th class="pi-cell-numeric eyebrow w-24">Часы</th>
                  <th class="pi-cell-numeric eyebrow w-28">Ставка/час</th>
                  <th class="pi-cell-numeric eyebrow w-28">Сумма</th>
                </tr>
              </thead>
              <tbody>
                @for (l of cc.labor; track l.workTypeId) {
                  <tr class="pi-table-row pi-table-row-odd last:border-0">
                    <td class="pi-cell align-top">{{ l.workTypeName ?? '—' }}</td>
                    <td class="pi-cell-numeric align-top font-mono">{{ l.hours }}</td>
                    <td class="pi-cell-numeric align-top font-mono">{{ formatRuble(l.hourlyRate) }}</td>
                    <td class="pi-cell-numeric align-top font-mono font-medium">{{ formatRuble(l.total) }}</td>
                  </tr>
                }
              </tbody>
              <tfoot class="hairline-t">
                <tr>
                  <td colspan="3" class="pi-cell eyebrow text-right">Итого работы</td>
                  <td class="pi-cell-numeric font-mono font-medium">{{ formatRuble(cc.totalLaborCost) }}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </section>
      }

      <!-- 3. Накладные + 4. Итого -->
      <section class="border hairline rounded-sm p-4 bg-paper-2/50">
        <dl class="grid grid-cols-[1fr_auto] gap-y-2 text-sm">
          <dt class="eyebrow">Материалы</dt>
          <dd class="font-mono text-right">{{ formatRuble(cc.totalMaterialCost) }}</dd>
          <dt class="eyebrow">Работы</dt>
          <dd class="font-mono text-right">{{ formatRuble(cc.totalLaborCost) }}</dd>
          <dt class="eyebrow">Накладные ({{ cc.overheadPercent }}%)</dt>
          <dd class="font-mono text-right text-muted-foreground">{{ formatRuble(cc.overheadCost) }}</dd>
          <dt class="eyebrow font-semibold border-t hairline pt-2 mt-1">Итого себестоимость</dt>
          <dd class="font-mono text-right font-semibold text-lg border-t hairline pt-2 mt-1">{{ formatRuble(cc.totalCost) }}</dd>
        </dl>
        @if (cc.notes) {
          <p class="mt-3 text-xs text-muted-foreground italic">{{ cc.notes }}</p>
        }
      </section>
    </div>
  `,
})
export class CostCalculationDetailDialogComponent {
  protected readonly cc: CostCalculation = inject<DialogData>(PI_DIALOG_DATA).costCalculation;

  protected formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  protected formatRuble(amount: number): string {
    return amount.toLocaleString('ru-RU', { style: 'currency', currency: 'RUB' });
  }
}
