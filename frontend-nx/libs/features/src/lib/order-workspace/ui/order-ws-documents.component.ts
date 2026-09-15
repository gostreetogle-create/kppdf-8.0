import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

/**
 * TZ-NX-ORDER-WS-DOCS-CHIPS — dumb Документы section. Deep-link ported
 * verbatim from `order-hub-tray.component.ts`'s existing «Документы»
 * block. No related-documents list: `PiStudioDocumentsService.list()`
 * takes zero params (no order/source filter exists server-side) — an
 * honest empty state beats an unbounded client-side fetch-then-filter
 * for a tiny widget.
 */
@Component({
  selector: 'pi-order-ws-documents',
  standalone: true,
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <p class="text-xs text-muted-foreground m-0 mb-3" data-test="documents-empty">Нет связанных документов</p>
    <a
      routerLink="/doc-constructor/templates"
      [queryParams]="{ source: 'order', sourceId: orderId() }"
      class="pi-outline-btn"
      data-test="documents-templates-link"
    >
      Шаблоны документов
    </a>
  `,
})
export class OrderWsDocumentsComponent {
  readonly orderId = input('');
}
