═══════════════════════════════════════════════════════════════
TZ-DESK-416: tray «Открыть производство» с from=desk
═══════════════════════════════════════════════════════════════

PAGES: /desk ; /orders
PAGE_DOCS: manager-desk.page.md ; orders.page.md

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-19
closed_by: composer-executor-desk-416

result:
- Shared `order-hub-tray`: «Открыть производство» uses `productionQueryParams()`.
  `mode="desk"` → `{ orderId, from: 'desk' }` so `/production` shows «На стол».
  `mode="hub"` unchanged `{ orderId }` only. `data-test="order-production-link"` kept (HUB-303).
- Did not touch `manager-desk.page.ts` (414).

verification:
  - acceptance criteria: PASS
  - typecheck: PASS (`pnpm exec tsc -p tsconfig.app.json --noEmit`, exit 0)
  - tests: PASS (order-hub-tray 2/2 + orders.page 17/17 = 19/19)
  - lint: PASS (eslint tray ts+spec, 0 errors)
  - checklist: DONE
  - deploy/wipe: not run

commit: pending
