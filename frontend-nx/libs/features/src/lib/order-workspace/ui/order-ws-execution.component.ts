import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import type { SupplyRequest } from '@kppdf/data-access';
import { PiStatusBannerComponent } from '@kppdf/ui/status-banner';
import { ButtonComponent } from '@kppdf/ui/button';
import type { SupplyCounters } from '../order-workspace.facade';

/**
 * TZ-NX-ORDER-WS-EXECUTION — dumb Исполнение section: Снабжение (counters +
 * honest empty/error + deficit short-list, only rendered when real pending
 * requests exist — no fake "всё ОК" and no invented shortage) and
 * Производство (plannedDate + готовность X/Y). No facade injection; the
 * dialog/reload lives on `OrderWorkspaceFacade.openKitReserveConfirm()`.
 */
@Component({
  selector: 'pi-order-ws-execution',
  standalone: true,
  imports: [RouterLink, PiStatusBannerComponent, ButtonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="grid grid-cols-1 xl:grid-cols-2 gap-5" data-test="execution-groups">
      <section class="min-w-0 hairline rounded-sm bg-paper p-4" data-test="execution-supply">
        <h3 class="text-sm font-medium m-0 mb-3">Снабжение</h3>
        @if (supplyLoading()) {
          <p class="text-xs text-muted-foreground m-0" data-test="execution-supply-loading">Загрузка…</p>
        } @else if (supplyError(); as err) {
          <app-pi-status-banner
            tone="destructive"
            [message]="err"
            actionLabel="Повторить"
            (action)="retrySupply.emit()"
            data-test="execution-supply-error"
          />
        } @else if (supplyCounters().total === 0) {
          <p class="text-xs text-muted-foreground m-0" data-test="execution-supply-empty">Нет задач снабжения</p>
        } @else {
          <p class="text-xs text-muted-foreground m-0" data-test="execution-supply-counters">
            Заказано: {{ supplyCounters().ordered }} · Получено: {{ supplyCounters().received }} · Всего: {{ supplyCounters().total }}
          </p>
        }
        @if (pendingSupplyRequests().length > 0) {
          <div class="mt-3" data-test="execution-deficit">
            <div class="text-xs font-medium text-sunrise-warm mb-1">Дефицит: {{ pendingSupplyRequests().length }} поз.</div>
            <ul class="m-0 pl-4 text-xs text-muted-foreground">
              @for (r of pendingSupplyRequests(); track r._id) {
                <li>{{ r.title || r.article || 'Без названия' }} · {{ r.qty }}{{ r.unit ? ' ' + r.unit : '' }}</li>
              }
            </ul>
          </div>
        }
        <div class="flex items-center gap-3 mt-3">
          <app-pi-button
            variant="secondary"
            type="button"
            data-test="execution-confirm-materials"
            (click)="confirmMaterials.emit()"
          >
            Подтвердить материалы
          </app-pi-button>
          <a class="pi-outline-btn" [routerLink]="['/supply']" [queryParams]="{ orderId: orderId() }" data-test="execution-supply-link">
            Снабжение
          </a>
        </div>
      </section>

      <section class="min-w-0 hairline rounded-sm bg-paper p-4" data-test="execution-production">
        <h3 class="text-sm font-medium m-0 mb-3">Производство</h3>
        <dl class="m-0 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-xs mb-3">
          <dt class="text-muted-foreground">Плановая дата</dt>
          <dd class="m-0" data-test="execution-planned-date">{{ plannedDateLabel() }}</dd>
          <dt class="text-muted-foreground">Готовность</dt>
          <dd class="m-0" data-test="execution-readiness">{{ readyCount() }} из {{ totalCount() }}</dd>
        </dl>
        <a class="pi-outline-btn" [routerLink]="['/production']" [queryParams]="{ orderId: orderId() }" data-test="execution-production-link">
          Производство
        </a>
      </section>
    </div>
  `,
})
export class OrderWsExecutionComponent {
  readonly supplyLoading = input(false);
  readonly supplyError = input<string | null>(null);
  readonly supplyCounters = input<SupplyCounters>({ total: 0, ordered: 0, received: 0 });
  readonly pendingSupplyRequests = input<readonly SupplyRequest[]>([]);
  readonly orderId = input('');
  readonly plannedDateLabel = input('—');
  readonly readyCount = input(0);
  readonly totalCount = input(0);

  readonly confirmMaterials = output<void>();
  readonly retrySupply = output<void>();
}
