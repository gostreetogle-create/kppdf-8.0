import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import {
  PiOrdersService,
  type KitAvailability,
  type KitReserveResult,
  type Order,
} from '@kppdf/data-access';
import { extractErrorMessage } from '@kppdf/util-http';
import { ButtonComponent } from '@kppdf/ui/button';
import { PiDialogComponent, PI_DIALOG_DATA, PI_DIALOG_REF, type DialogRef } from '@kppdf/ui/dialog';
import { PiStatusBannerComponent } from '@kppdf/ui/status-banner';
import { PiToastService } from '@kppdf/ui/toast';

export interface KitReserveConfirmDialogData {
  readonly order: Order;
  readonly initialItemIndex?: number;
}

/**
 * TZ-NX-SUPPLY-S2 — order hub «Подтвердить материалы»: preview S0
 * kit-availability for one order line, confirm reserves ok-lines and files a
 * SupplyRequest for short lines (soft shortage — never blocks the shop
 * floor). No OUT stock movement here (successor TZ, per S0/S2 scope).
 */
@Component({
  selector: 'pi-kit-reserve-confirm-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, ButtonComponent, PiDialogComponent, PiStatusBannerComponent],
  template: `
    <app-pi-dialog
      title="Подтверждение материалов"
      variant="content"
      width="md"
      [showClose]="true"
      (userClose)="close()"
    >
      <div body class="space-y-4" data-test="kit-reserve-dialog">
        <p class="text-sm text-muted-foreground m-0">
          Заказ {{ data.order.number }}
        </p>

        @if (items.length > 1 && !result()) {
          <label class="flex flex-col gap-1 text-xs">
            <span class="text-muted-foreground">Позиция</span>
            <select
              class="pi-input"
              [value]="selectedIndex()"
              (change)="onItemChange($event)"
              data-test="kit-reserve-item-select"
            >
              @for (item of items; track $index) {
                <option [value]="$index">{{ itemLabel(item) }}</option>
              }
            </select>
          </label>
        }

        @if (loading()) {
          <p class="text-sm text-muted-foreground m-0" data-test="kit-reserve-loading">Загрузка…</p>
        }
        @if (error()) {
          <app-pi-status-banner
            tone="destructive"
            [message]="error()"
            actionLabel="Повторить"
            (action)="loadAvailability()"
            data-test="kit-reserve-error"
          />
        }

        @if (!loading() && !error() && !result() && availability(); as av) {
          <div class="space-y-2" data-test="kit-reserve-lines">
            @for (line of av.lines; track line.materialId) {
              <div
                class="flex items-center justify-between gap-3 text-sm hairline-bottom pb-2"
                [attr.data-test]="'kit-reserve-line-' + line.materialId"
              >
                <span class="truncate">{{ line.materialName }}</span>
                <span class="text-xs text-muted-foreground whitespace-nowrap">
                  нужно {{ line.needQty }} · есть {{ line.availableQty }}
                </span>
                <span
                  class="text-xs px-2 py-0.5 rounded-sm whitespace-nowrap"
                  [class.text-destructive]="line.status === 'short'"
                  [attr.data-test]="'kit-reserve-status-' + line.materialId"
                >
                  {{ line.status === 'ok' ? 'хватает' : 'нехватка' }}
                </span>
              </div>
            }
            <p class="text-sm m-0" data-test="kit-reserve-summary">
              @if (av.summary.canReserveAll) {
                Материалов хватает — можно резервировать всё.
              } @else {
                По части материалов нехватка — на неё будет создана заявка снабжения (склад не блокируется).
              }
            </p>
          </div>
        }

        @if (result(); as r) {
          <div class="space-y-2" data-test="kit-reserve-result">
            <div data-test="kit-reserve-success-banner">
              <app-pi-status-banner tone="info" [message]="resultMessage(r)" />
            </div>
            <p class="text-sm m-0" data-test="kit-reserve-result-summary">
              Зарезервировано материалов: {{ r.reserved.length }}
              @if (r.supplyRequestIds.length > 0) {
                · создано заявок снабжения: {{ r.supplyRequestIds.length }}
              }
            </p>
            @if (r.supplyRequestIds.length > 0) {
              <div data-test="kit-reserve-supply-requests">
                <p class="text-xs text-muted-foreground m-0">Созданные заявки снабжения:</p>
                <ul class="m-0 pl-4 text-xs space-y-0.5">
                  @for (requestId of r.supplyRequestIds; track requestId) {
                    <li>{{ requestId }}</li>
                  }
                </ul>
              </div>
            }
            @if (r.warnings.length > 0) {
              <ul class="m-0 pl-4 text-xs text-muted-foreground space-y-0.5">
                @for (w of r.warnings; track $index) {
                  <li>{{ w }}</li>
                }
              </ul>
            }
            @if (r.supplyRequestIds.length > 0) {
              <a
                [routerLink]="['/supply']"
                [queryParams]="{ orderId: data.order._id }"
                class="text-sm underline underline-offset-2 hover:text-sunrise-warm"
                data-test="kit-reserve-open-supply"
                (click)="close()"
                >Открыть снабжение</a
              >
            }
          </div>
        }
      </div>

      <div footer class="flex justify-end gap-3">
        @if (!result()) {
          <app-pi-button type="button" variant="outline" (click)="close()">Отмена</app-pi-button>
          <app-pi-button
            type="button"
            variant="default"
            [disabled]="loading() || confirming() || !availability()"
            (click)="confirm()"
            data-test="kit-reserve-confirm-submit"
          >
            {{ confirming() ? 'Подтверждение…' : 'Подтвердить' }}
          </app-pi-button>
        } @else {
          <app-pi-button type="button" variant="default" (click)="close()" data-test="kit-reserve-done">
            Готово
          </app-pi-button>
        }
      </div>
    </app-pi-dialog>
  `,
})
export class KitReserveConfirmDialogComponent {
  readonly data = inject<KitReserveConfirmDialogData>(PI_DIALOG_DATA);
  readonly ref = inject<DialogRef<KitReserveResult | undefined>>(PI_DIALOG_REF);
  private readonly ordersApi = inject(PiOrdersService);
  private readonly toast = inject(PiToastService);

  readonly items = this.data.order.items ?? [];

  readonly selectedIndex = signal(this.data.initialItemIndex ?? 0);
  readonly loading = signal(false);
  readonly error = signal('');
  readonly availability = signal<KitAvailability | null>(null);
  readonly confirming = signal(false);
  readonly result = signal<KitReserveResult | null>(null);

  constructor() {
    void this.loadAvailability();
  }

  itemLabel(item: { productName?: string; productId: string }): string {
    return item.productName || `Изделие ${item.productId.slice(0, 8)}…`;
  }

  onItemChange(event: Event): void {
    const index = Number((event.target as HTMLSelectElement).value);
    this.selectedIndex.set(Number.isFinite(index) ? index : 0);
    this.availability.set(null);
    void this.loadAvailability();
  }

  async loadAvailability(): Promise<void> {
    this.loading.set(true);
    this.error.set('');
    const res = await firstValueFrom(
      this.ordersApi.getKitAvailability(this.data.order._id, this.selectedIndex()),
    );
    this.loading.set(false);
    if (!res.ok) {
      this.error.set(extractErrorMessage(res.error) || 'Не удалось проверить комплектацию');
      return;
    }
    this.availability.set(res.data);
  }

  async confirm(): Promise<void> {
    if (this.confirming()) return;
    this.confirming.set(true);
    this.error.set('');
    const res = await firstValueFrom(
      this.ordersApi.confirmKitReserve(this.data.order._id, this.selectedIndex()),
    );
    this.confirming.set(false);
    if (!res.ok) {
      this.error.set(extractErrorMessage(res.error) || 'Не удалось подтвердить материалы');
      return;
    }
    this.result.set(res.data);
    this.toast.success(
      res.data.supplyRequestIds.length > 0
        ? `Материалы подтверждены · создано заявок снабжения: ${res.data.supplyRequestIds.length}`
        : `Материалы подтверждены · резервов: ${res.data.reserved.length}`,
    );
  }

  resultMessage(result: KitReserveResult): string {
    if (result.supplyRequestIds.length > 0) {
      return `Материалы подтверждены. Зарезервировано: ${result.reserved.length}; создано заявок снабжения: ${result.supplyRequestIds.length}. Нехватка не блокирует цех — снабжение получит задачу.`;
    }
    return `Материалы подтверждены. Зарезервировано материалов: ${result.reserved.length}.`;
  }

  close(): void {
    this.ref.close(this.result() ?? undefined);
  }
}
