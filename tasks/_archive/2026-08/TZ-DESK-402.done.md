═══════════════════════════════════════════════════════════════
TZ-DESK-402: заказ во flyout — тот же write-path
═══════════════════════════════════════════════════════════════

PAGES: /desk
PAGE_DOCS: manager-desk.page.md

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-18
closed_by: Buffy/codebuff-freebuff

result:
- Extracted `OrderFormPanelComponent` (`order-form-panel.component.ts`) from the dialog; `OrderFormDialogComponent` is now a thin shell over the same panel + `OrdersService.create/update` (one write-path, no copied validation).
- Desk queue is live `GET /orders` (httpResource) with a counterparty lookup; the 405 fixture is removed.
- Invalid `?orderId=` shows a RU «Заказ не найден» toast and clears the query without crashing; reload-deferred validation avoids a false not-found on a fresh create.
- `create`/`edit` flyouts host the shared panel; after saved the desk closes the flyout, expands the new/updated order and scrolls it into view.
- `desk-order-tray` renders live `Order` (draft…cancelled statuses + items); replaced by the shared hub tray in 412.

verification:
  - acceptance criteria: PASS
  - typecheck: PASS (`pnpm exec tsc -p tsconfig.app.json --noEmit`, exit 0)
  - tests: PASS (manager-desk 7/7, order-form-panel 10/10, order-form-dialog 2/2, orders.page regression — 36 total)
  - lint: PASS (eslint changed files, exit 0)
  - diff-check: PASS
  - checklist: DONE
  - foreign WIP: not staged
  - deploy/wipe: not run (VPN off)

known_limitation:
- Состав tree/combine = 403; Гант = 404; search/filter = 410; PATCH status / POST ship — successor TZ (не этот).

commit: pending
