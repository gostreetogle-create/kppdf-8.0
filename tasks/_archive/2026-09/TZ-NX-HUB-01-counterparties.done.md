# TZ-NX-HUB-01-counterparties: hub expand + icon actions — `/counterparties`

**РОЛЬ АГЕНТА:** Executor (frontend-nx) — claude
**ЗАВИСИМОСТИ:** нет (первая стадия волны)
**LAYER:** 3 · **SIZE:** L
**PAGES:** `/counterparties`
**PAGE_DOCS:** `counterparties.page.md`

**CONFLICT KEYS:**
`frontend-nx/apps/kppdf-web/src/app/pages/counterparties/**` ;
`frontend-nx/libs/data-access/src/lib/sales/pi-orders.service.ts` ;
`frontend-nx/libs/data-access/src/lib/sales/pi-quotations.service.ts` ;
`docs/pages/counterparties.page.md` ;
`docs/agent-checklists/WAVE-NX-HUB-TABLE-PARITY.md` ;
`docs/agent-checklists/HUB-TABLE-CONTINUOUS-CHECKLIST.md`

IMPLICIT CONFLICT: frontend-nx/apps/kppdf-web — nx build kppdf-web

Source: `tasks/_ready/nx-hub/counterparties/TZ-NX-HUB-01-counterparties.md`.
Full checklist: `docs/agent-checklists/TZ-NX-HUB-01-counterparties.md`.

## ЧТО СДЕЛАНО

1. `PiOrdersService.list(params?: { counterpartyId?: string })`, `PiQuotationsService.list(params?: { counterpartyId?: string })` + unit specs.
2. `counterparties-list.page.ts`: denser rows, ▸/▾ column, single-expand, cursor-pointer, hover, aria-expanded, Enter/Space.
3. `app-pi-row-actions` (edit + delete). stopPropagation on the actions cell. Delete confirm unchanged (AlertDialog).
4. New `counterparty-hub-tray.component.ts`: Реквизиты · Объекты · Заказы · КП · Договоры.
5. Lazy load on first expand — 4 HTTP (sites+orders+quotations+contracts), within ≤5 budget.
6. Specs: expand/collapse, stopPropagation, hub block data/empty/error, data-access query params.
7. `counterparties.page.md` NX note updated; `PAGE-TZ-INDEX.md` READY→DONE; WAVE + continuous checklist updated.

## КРИТЕРИИ ПРИЁМКИ — все выполнены (см. чеклист)

## Gates

- `nx test kppdf-web` → PASS (106/106 suites, 712 passed, 7 skipped)
- `nx lint kppdf-web` → pre-existing baseline debt only (37 errors app-wide before this change; my one new instance matches an already-tolerated sibling pattern in `shipping.page.ts`/`supply.page.ts`/`supply-requests.page.ts`/`storage-items.page.ts` — not in this TZ's gate list, not fixed here, scope stayed inside `/counterparties`)
- `nx build kppdf-web` → PASS, exit 0 (last command)

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-09-10
closed_by: claude
verification:
  - acceptance criteria: PASS
  - typecheck: PASS (via nx build, AOT compile)
  - tests: PASS
  - lint: PRE-EXISTING BASELINE DEBT ONLY (see checklist Gates section)
  - checklist: ADDED
  - progress.md: N/A (redirect file, tracked via _NOW.md per repo convention)
  - status synchronization: PASS
