import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

/**
 * TZ-NX-ORDER-WS-DOCS-CHIPS — dumb workflow-chips nav, same visual
 * pattern/copy as `home.page.ts`'s `WORKFLOW_CHIPS` (Главная · КП · Гант ·
 * Снабжение · Отгрузка), with «Заказ» as the current (non-link) item
 * instead of «Главная».
 */
const CHIPS = [
  { id: 'home', label: 'Главная', route: '/home', needsOrderId: false },
  { id: 'quotation', label: 'КП', route: '/studio', needsOrderId: false },
  { id: 'production', label: 'Гант', route: '/production', needsOrderId: true },
  { id: 'supply', label: 'Снабжение', route: '/supply', needsOrderId: true },
  { id: 'shipping', label: 'Отгрузка', route: '/shipping', needsOrderId: true },
  { id: 'order', label: 'Заказ', route: null, needsOrderId: false },
] as const;

@Component({
  selector: 'pi-order-ws-workflow-chips',
  standalone: true,
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <nav class="flex items-center gap-1.5 mb-4 overflow-x-auto" aria-label="Рабочие маршруты" data-test="order-workflow-chips">
      @for (chip of chips; track chip.id) {
        @if (chip.route) {
          <a
            [routerLink]="chip.route"
            [queryParams]="chip.needsOrderId ? { orderId: orderId() } : null"
            class="px-2.5 py-1.5 rounded-sm text-xs font-medium no-underline pi-focus-ring transition-colors bg-ink text-paper hover:bg-ink-soft"
            [attr.data-test]="'order-workflow-chip-' + chip.id"
          >
            {{ chip.label }}
          </a>
        } @else {
          <span
            class="px-2.5 py-1.5 rounded-sm text-xs font-medium bg-sunrise-warm text-on-gold"
            aria-current="page"
            [attr.data-test]="'order-workflow-chip-' + chip.id"
          >
            {{ chip.label }}
          </span>
        }
      }
    </nav>
  `,
})
export class OrderWsWorkflowChipsComponent {
  readonly orderId = input('');
  protected readonly chips = CHIPS;
}
