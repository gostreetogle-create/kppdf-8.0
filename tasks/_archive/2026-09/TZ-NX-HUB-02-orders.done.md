# TZ-NX-HUB-02-orders: expand affordance + dense list + icon card — `/orders`

**РОЛЬ АГЕНТА:** Executor (frontend-nx) — claude
**ЗАВИСИМОСТИ:** `TZ-NX-HUB-01-counterparties` DONE
**LAYER:** 3 · **SIZE:** L
**PAGES:** `/orders`
**PAGE_DOCS:** `orders.page.md`

Source: `tasks/_ready/nx-hub/orders/TZ-NX-HUB-02-orders.md`.
Full checklist: `docs/agent-checklists/TZ-NX-HUB-02-orders.md`.

## ЧТО СДЕЛАНО

1. `orders-list.page.ts`: ▸/▾ chevron column, `bg-paper-2` + `border-l-gold-deep` expanded-row accent, denser rows.
2. «Карточка» text link → `pi-icon-btn-doc` icon anchor, `aria-label="Открыть карточку заказа"`, routerLink+stopPropagation preserved.
3. `order-hub-tray.component.ts` untouched (business logic/write-paths intact).
4. Specs: icon-link assertions, chevron/aria-expanded toggle.
5. `orders.page.md` + `PAGE-TZ-INDEX.md` synced.

## Gates

- `nx test kppdf-web` → PASS (106/106, 714 passed, 7 skipped)
- `nx lint kppdf-web` → zero new issues in touched file (pre-existing baseline unrelated)
- `nx build kppdf-web` → PASS, exit 0 (last command)

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-09-10
closed_by: claude
verification:
  - acceptance criteria: PASS
  - typecheck: PASS (via nx build)
  - tests: PASS
  - lint: PASS (touched file clean; pre-existing baseline unrelated)
  - checklist: ADDED
  - progress.md: N/A (redirect file)
  - status synchronization: PASS
