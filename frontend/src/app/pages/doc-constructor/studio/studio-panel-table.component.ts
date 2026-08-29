import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { ButtonComponent } from '../../../shared/ui/button/button.component';
import { InputComponent } from '../../../shared/ui/input/input.component';
import type { StudioDocument } from '../../../shared/services/pi-studio-documents.service';
import type { TemplateBlock } from '../../../shared/template-block/template-block.types';
import {
  studioTableColumns,
  studioTableDataSetKey,
  studioTableDataSetSource,
} from './studio-table.helpers';

@Component({
  selector: 'app-studio-panel-table',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ButtonComponent, InputComponent],
  template: `
    <p class="mt-3 font-medium text-ink">Привязка данных таблицы</p>
    @if (block(); as block) {
      <p class="mt-2 text-xs text-muted-foreground">
        Ключ набора данных:
        <span class="text-ink font-mono">{{ dataSetKey(block) }}</span>
      </p>
      @if (dataSetSource(block); as sourceType) {
        @if (sourceType !== 'manual') {
          <p class="mt-2 text-xs text-primary" data-test="studio-table-live-indicator">
            Live ERP ({{ sourceType }}) — строки читаются из
            {{ sourceType === 'quotation-items' ? 'КП' : 'заказа' }} при просмотре
          </p>
        }
      }
      <p class="mt-2 text-xs text-muted-foreground">
        Ревизия документа:
        <span class="tabular-nums text-ink">{{ doc()?.revision ?? '—' }}</span>
      </p>
      <div class="mt-3 overflow-x-auto">
        <table class="w-full text-xs border-collapse" data-test="studio-table-rows-editor">
          <thead>
            <tr>
              @for (col of columns(block); track col.key) {
                <th
                  class="border border-border px-1 py-0.5 text-left font-medium text-muted-foreground"
                >
                  {{ col.label }}
                </th>
              }
              <th class="border border-border px-1 py-0.5 w-8"></th>
            </tr>
          </thead>
          <tbody>
            @for (row of draftRows(); track $index; let rowIdx = $index) {
              <tr>
                @for (col of columns(block); track col.key; let colIdx = $index) {
                  <td class="border border-border p-0">
                    <app-pi-input
                      size="sm"
                      class="border-0 rounded-none min-w-[4rem]"
                      [value]="row[colIdx] ?? ''"
                      (valueChange)="cellChange.emit({ rowIdx, colIdx, value: $event })"
                      [disabled]="dataSetSource(block) !== 'manual'"
                    />
                  </td>
                }
                <td class="border border-border p-0 text-center">
                  <app-pi-button
                    variant="ghost"
                    size="icon"
                    class="text-destructive"
                    ariaLabel="Удалить строку"
                    (click)="removeRow.emit(rowIdx)"
                  >
                    ×
                  </app-pi-button>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
      <app-pi-button
        variant="secondary"
        size="sm"
        class="w-full mt-2"
        (click)="linkQuotation.emit()"
        [disabled]="!quotationId() || contextSaving()"
        data-test="studio-table-link-quotation"
      >
        Привязать к КП (live)
      </app-pi-button>
      <app-pi-button
        variant="secondary"
        size="sm"
        class="w-full mt-2"
        (click)="linkOrder.emit()"
        [disabled]="!orderId() || contextSaving()"
        data-test="studio-table-link-order"
      >
        Привязать к заказу (live)
      </app-pi-button>
      <app-pi-button
        variant="secondary"
        size="sm"
        class="w-full mt-2"
        (click)="addRow.emit()"
        [disabled]="dataSetSource(block) !== 'manual'"
      >
        + Строка
      </app-pi-button>
      <app-pi-button
        variant="default"
        size="sm"
        class="w-full mt-2"
        [disabled]="dataSetSaving() || dataSetSource(block) !== 'manual'"
        data-test="studio-table-rows-save"
        (click)="saveRows.emit()"
      >
        @if (dataSetSaving()) {
          Сохранение…
        } @else {
          Сохранить строки
        }
      </app-pi-button>
      @if (dataSetSaveError()) {
        <p class="mt-2 text-xs text-destructive">{{ dataSetSaveError() }}</p>
      }
    } @else {
      <p class="mt-2 text-xs text-muted-foreground">Выберите табличный блок на листе</p>
    }
  `,
})
export class StudioPanelTableComponent {
  readonly doc = input<StudioDocument | null>(null);
  readonly block = input<TemplateBlock | null>(null);
  readonly draftRows = input<string[][]>([]);
  readonly quotationId = input('');
  readonly orderId = input('');
  readonly contextSaving = input(false);
  readonly dataSetSaving = input(false);
  readonly dataSetSaveError = input<string | null>(null);

  readonly cellChange = output<{ rowIdx: number; colIdx: number; value: string }>();
  readonly removeRow = output<number>();
  readonly addRow = output<void>();
  readonly linkQuotation = output<void>();
  readonly linkOrder = output<void>();
  readonly saveRows = output<void>();

  protected readonly columns = studioTableColumns;
  protected readonly dataSetKey = studioTableDataSetKey;

  dataSetSource(block: TemplateBlock): 'manual' | 'quotation-items' | 'order-items' {
    return studioTableDataSetSource(this.doc(), block);
  }
}
