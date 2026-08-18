═══════════════════════════════════════════════════════════════
TZ-DESK-406: стол — chrome parity (одна строка, ширина, без «Рабочий стол»)
═══════════════════════════════════════════════════════════════

PAGES: /desk
PAGE_DOCS: manager-desk.page.md

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-18
closed_by: Buffy/codebuff-freebuff

result:
- Replaced `app-pi-page-chrome` + custom `<nav class="manager-desk__workflow">` double chrome with one sticky `app-pi-group-workspace` chip row.
- Added `desk-workflow-chips.ts` (GroupChip daily workflow: Стол · КП · Комбайн · Гант · Снабжение · Отгрузка; Гант — stub route/query `?view=gantt` до 407; pageKey ACL).
- Expanded order number renders as a `data-test="desk-order-crumb"` suffix in the workspace tools slot (no «Рабочий стол» label, no second crumb row).
- Removed visible «Очередь заказов» H1 (sr-only retained) and the custom max-width/padding so the queue matches the `/orders` frame width.
- Kept 405 behavior: expand-in-row tray, L/R flyout, query orderId/panel restore, chrome rail tools, fixture-only (no `/api/orders`).

verification:
  - acceptance criteria: PASS
  - typecheck: PASS (`pnpm exec tsc -p tsconfig.app.json --noEmit`, exit 0)
  - tests: PASS (jest manager-desk.page, 1 suite / 5 tests)
  - lint: PASS (eslint manager-desk.page.ts + desk-workflow-chips.ts, exit 0)
  - diff-check: PASS
  - checklist: DONE
  - foreign WIP: not staged
  - deploy/wipe: not run (VPN off; PO «кати» when back)

known_limitation:
- Гант chip is a stub route/query (`?view=gantt`) until DESK-407; live API, write actions, notes remain successor work.

commit: pending
