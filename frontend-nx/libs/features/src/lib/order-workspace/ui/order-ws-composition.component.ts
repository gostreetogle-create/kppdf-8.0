import { ChangeDetectionStrategy, Component, ElementRef, input, output, viewChildren } from '@angular/core';
import { RouterLink } from '@angular/router';
import type { CompositionTreeNode, OrderItem, Product } from '@kppdf/data-access';
import { CompositionTreeComponent } from '../../composition/ui/composition-tree.component';
import { PiStatusBannerComponent } from '@kppdf/ui/status-banner';
import { ButtonComponent } from '@kppdf/ui/button';

/**
 * TZ-NX-ORDER-WS-COMPOSITION — dumb composition editor: line list (qty/
 * ready/delete inline), lazy per-line composition tree (same
 * `pi-composition-tree` as the order-hub tray, loaded on first expand),
 * dual CTA (focus the inline row controls vs deep-link to the catalog),
 * and the add-line form. No facade injection — every write is an output;
 * `OrderWorkspaceFacade` owns the actual PATCH/POST + item-payload
 * reconstruction (see the facade's `toItemPayload` doc comment for why a
 * naive partial payload would silently wipe other item fields).
 */
@Component({
  selector: 'pi-order-ws-composition',
  standalone: true,
  imports: [RouterLink, CompositionTreeComponent, PiStatusBannerComponent, ButtonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (!editable()) {
      <app-pi-status-banner tone="warning" message="Состав заморожен для текущего статуса заказа" data-test="composition-freeze-banner" />
    }

    @if (items().length === 0) {
      <div class="pi-dashed-panel p-8 text-center text-sm text-muted-foreground" data-test="composition-empty">
        В заказе нет изделий
      </div>
    } @else {
      <div class="pi-table-surface hairline rounded-sm overflow-hidden bg-paper-raised" data-test="composition-list">
        @for (item of items(); track item.lineId ?? $index; let i = $index) {
          <div
            class="grid grid-cols-[1.5rem_minmax(0,1.5fr)_minmax(5rem,0.5fr)_minmax(3.5rem,0.35fr)_auto_auto] gap-3 items-center px-4 py-3 hairline-bottom last:border-b-0 text-sm"
            data-test="composition-line"
          >
            <button
              type="button"
              class="text-muted-foreground"
              data-test="composition-line-expand"
              [attr.aria-expanded]="expandedLineIndex() === i"
              (click)="toggleTree.emit(i)"
            >
              {{ expandedLineIndex() === i ? '▾' : '▸' }}
            </button>
            <div class="min-w-0">
              <div class="font-medium truncate">{{ item.productName ?? item.productId }}</div>
              @if (item.productSku) {
                <div class="text-xs text-muted-foreground">{{ item.productSku }}</div>
              }
            </div>
            <input
              #qtyInput
              type="number"
              min="1"
              class="pi-input w-full"
              data-test="composition-qty"
              [value]="item.quantity"
              [disabled]="!editable() || savingLineIndex() === i"
              (change)="onQtyChange(i, $event)"
              aria-label="Количество"
            />
            <span class="text-muted-foreground">{{ item.unit }}</span>
            <label class="flex items-center gap-2 whitespace-nowrap">
              <input
                type="checkbox"
                class="pi-checkbox"
                data-test="composition-ready"
                [checked]="item.readyForWork === true"
                [disabled]="!editable() || savingLineIndex() === i"
                (change)="onReadyChange(i, $event)"
              />
              <span class="text-xs">Готово</span>
            </label>
            <app-pi-button
              variant="ghost"
              type="button"
              data-test="composition-remove"
              [disabled]="!editable() || removingLineIndex() === i"
              (click)="removeLine.emit(i)"
            >
              Удалить
            </app-pi-button>
          </div>
          @if (expandedLineIndex() === i) {
            <div class="px-4 py-4 hairline-bottom last:border-b-0 bg-paper-2" data-test="composition-tree-panel">
              @if (lineTreeLoading() === i) {
                <p class="text-xs text-muted-foreground m-0" data-test="composition-tree-loading">Загрузка состава…</p>
              } @else if (lineTrees()[i]; as tree) {
                <pi-composition-tree [root]="tree" [selectedId]="null" ariaLabel="Состав изделия в заказе" />
              } @else {
                <p class="text-xs text-muted-foreground m-0" data-test="composition-tree-empty">Состав недоступен</p>
              }
              <div class="flex items-center gap-3 mt-3">
                <button
                  type="button"
                  class="pi-outline-btn"
                  data-test="composition-focus-line"
                  (click)="focusLine(i)"
                >
                  Править строки заказа
                </button>
                <a class="pi-outline-btn" routerLink="/registries/products" data-test="composition-open-catalog">
                  Открыть в каталоге
                </a>
              </div>
            </div>
          }
        }
      </div>
    }

    @if (editable()) {
      <div class="flex flex-wrap items-end gap-3 mt-4" data-test="composition-add-form">
        <label class="flex flex-col gap-1 text-xs min-w-[12rem] flex-1">
          <span class="text-muted-foreground">Изделие</span>
          <select
            class="pi-input"
            data-test="composition-add-product"
            [value]="newLineProductId()"
            (change)="onNewLineProductChange($event)"
          >
            <option value="">Выберите изделие…</option>
            @for (product of products(); track product._id) {
              <option [value]="product._id">{{ product.name }}</option>
            }
          </select>
        </label>
        <label class="flex flex-col gap-1 text-xs w-24">
          <span class="text-muted-foreground">Кол-во</span>
          <input
            type="number"
            min="1"
            class="pi-input"
            data-test="composition-add-qty"
            [value]="newLineQty()"
            (input)="onNewLineQtyChange($event)"
          />
        </label>
        <app-pi-button
          type="button"
          variant="secondary"
          data-test="composition-add-submit"
          [disabled]="!newLineProductId() || addingLine()"
          (click)="addLine.emit()"
        >
          {{ addingLine() ? 'Добавление…' : '+ Добавить позицию' }}
        </app-pi-button>
      </div>
    }
  `,
})
export class OrderWsCompositionComponent {
  readonly items = input<readonly OrderItem[]>([]);
  readonly editable = input(false);
  readonly products = input<readonly Product[]>([]);
  readonly expandedLineIndex = input<number | null>(null);
  readonly lineTrees = input<Record<number, CompositionTreeNode | null>>({});
  readonly lineTreeLoading = input<number | null>(null);
  readonly savingLineIndex = input<number | null>(null);
  readonly removingLineIndex = input<number | null>(null);
  readonly addingLine = input(false);
  readonly newLineProductId = input('');
  readonly newLineQty = input(1);

  readonly toggleTree = output<number>();
  readonly qtyChange = output<{ index: number; quantity: number }>();
  readonly readyChange = output<{ index: number; ready: boolean }>();
  readonly removeLine = output<number>();
  readonly newLineProductIdChange = output<string>();
  readonly newLineQtyChange = output<number>();
  readonly addLine = output<void>();

  private readonly qtyInputs = viewChildren<ElementRef<HTMLInputElement>>('qtyInput');

  protected onQtyChange(index: number, event: Event): void {
    const value = Number((event.target as HTMLInputElement).value);
    if (value > 0) this.qtyChange.emit({ index, quantity: value });
  }

  protected onReadyChange(index: number, event: Event): void {
    this.readyChange.emit({ index, ready: (event.target as HTMLInputElement).checked });
  }

  protected onNewLineProductChange(event: Event): void {
    this.newLineProductIdChange.emit((event.target as HTMLSelectElement).value);
  }

  protected onNewLineQtyChange(event: Event): void {
    this.newLineQtyChange.emit(Number((event.target as HTMLInputElement).value));
  }

  /** «Править строки заказа» — focuses + scrolls to this line's qty input (dual CTA vs the catalog deep-link). */
  protected focusLine(index: number): void {
    const el = this.qtyInputs()[index]?.nativeElement;
    el?.focus();
    el?.scrollIntoView({ block: 'center' });
  }
}
