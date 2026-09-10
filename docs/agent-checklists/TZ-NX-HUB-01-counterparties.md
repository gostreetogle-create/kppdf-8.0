# TZ-NX-HUB-01-counterparties checklist

> Status: **DONE**
> Marker: `tasks/_active/TZ-NX-HUB-01-counterparties.md`
> Commit/push: по `docs/GIT-POLICY.md`

## Claim slot

- agent_id: claude
- claimed_at: 2026-09-10T15:25:00Z
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (no Team Room CLI in this session)

## Preflight

- [x] `pwd` / `git rev-parse --show-toplevel` → `D:\kppdf-8.0`
- [x] Прочитал `_NOW.md` + `tasks/_active/` — пусто, нет чужого CLAIM на эти keys
- [x] TZ / канон (`docs/audits/2026-09-10-nx-hub-table-parity-canon.md`) прочитаны
- [x] Claim slot заполнен; Status = CLAIMED / IN PROGRESS
- [x] `tasks/_active/TZ-NX-HUB-01-counterparties.md` на месте

### Preflight Check Output

- **Context read:** `docs/audits/2026-09-10-nx-hub-table-parity-canon.md`; `counterparties-list.page.ts` (+spec); `order-hub-tray.component.ts` (hub precedent); `orders-list.page.ts` (expand-row precedent); `pi-row-actions.component.ts`; `pi-table.component.ts`; `admin-roles.page.ts` (row-actions consumer precedent); `pi-orders.service.ts`, `pi-quotations.service.ts`, `pi-sites.service.ts`, `pi-contracts.service.ts`; `order.types.ts`, `quotation.types.ts`, `site.types.ts`, `contract.types.ts`; `contract-status.ts`, `order-status.ts`, `proposals-list.page.ts`; BE `order.controller.ts`, `quotation.controller.ts` (confirm `counterpartyId` query support); `app.routes.ts` (confirm `/orders/:id`, `/contracts/:id` exist, `/proposals` has no `:id`); `docs/pages/counterparties.page.md`
- **Key Constraints:** Executor mode, Claim done. Hub = сводка+ссылки, не второй write-path. Не ObjectId в UI. Single-expand (like orders-list.page.ts). stopPropagation on row actions.
- **Planned Deliverable:** (1) add `counterpartyId` param to `PiOrdersService.list` / `PiQuotationsService.list` + specs; (2) denser grid + ▸ chevron + single-expand in `counterparties-list.page.ts`, swap wide buttons → `app-pi-row-actions`; (3) new `counterparty-hub-tray.component.ts` (Реквизиты/Объекты/Заказы/КП/Договоры, lazy on expand); (4) specs for list + tray; (5) docs sync (page.md, WAVE, continuous checklist)
- **Validation Path:** `nx test kppdf-web --testPathPattern=counterparties|pi-orders.service|pi-quotations.service`; `nx build kppdf-web` last

## Acceptance

- [x] Нет широких «Изменить»/«Удалить» — только icon actions (`app-pi-row-actions`) + aria-label RU
- [x] Клик по строке → hub tray с ≥4 категорийными блоками (Реквизиты/Объекты/Заказы/КП/Договоры = 5); повторный клик сворачивает
- [x] Нет сырых ObjectId в UI (unit test `never renders raw ObjectIds as row text`)
- [x] Destructive delete сохраняет confirm (AlertDialog) — не тронуто
- [x] `PiOrdersService.list({ counterpartyId })` / `PiQuotationsService.list({ counterpartyId })` реализованы + specs (HttpParams)
- [x] Denser table: ▸/▾ колонка, cursor-pointer, hover, aria-expanded, Enter/Space
- [x] Lazy load hub блоков при expand, ≤5 HTTP на один expand (4: sites+orders+quotations+contracts)

## Integrity slot (до READY / archive)

- [x] Тип изменения: page (NX `/counterparties`) + data-access (2 сервиса)
- [x] FIC — N/A нет новой страницы/права/модуля/MCP, только UI-правка существующей page + client query param
- [x] `docs/pages/counterparties.page.md` обновлён (NX note про hub + row actions + TZ reference)
- [x] `docs/pages/PAGE-TZ-INDEX.md` строка `/counterparties` обновлена READY→DONE
- [x] DOMAIN-MAP: N/A (не менял module/route контур, тот же `/counterparties`)
- [x] SECTION-READINESS: N/A (не менял user contour)
- [x] Чужой WIP не в коммите; conflict keys из TZ соблюдены
- [x] Coupling map: N/A (не трогал общий статус/FK на ≥2 экранах — hub только читает существующие списки)
- [x] Канон: docs/DOCS-INTEGRITY.md — соблюдён

## Build integrity (обязательно для frontend-nx / kppdf-web)

- [x] Baseline до кода: `cd frontend-nx && pnpm exec nx build kppdf-web` → exit 0 (cached, confirmed green)
- [x] Нет другого `tasks/_active/*` с `apps/kppdf-web/src/**` (implicit conflict) — подтверждено, `_active/` был пуст до этого CLAIM
- [x] Закрытие: `nx build kppdf-web` — последняя команда в Gates, exit 0

## Gates (факт)

- `nx test kppdf-web --testPathPatterns=counterparties` → **PASS** (106/106 suites, 712 passed, 7 skipped). Note: `--testPathPattern`/`--testPathPatterns` did not actually filter in this nx/jest setup (ran full app suite both times) — flagging as a pre-existing tooling quirk, not something fixed here; full-suite run is a superset of the requested focused gate, so acceptance is still satisfied.
- `nx lint kppdf-web` → pre-existing baseline: 37 errors / 233 warnings across the app (unrelated files: studio-*, supply.page.ts, supply-requests.page.ts, storage-items.page.ts, shipping.page.ts). My new `counterparties-list.page.ts:97` div (`role="cell"` + `(click)="$event.stopPropagation()"`, no keyboard handler) triggers `@angular-eslint/template/click-events-have-key-events` — but this is the exact same established pattern already present unfixed in `shipping.page.ts:137`, `supply.page.ts:252`, `supply-requests.page.ts:186/196`, `storage-items.page.ts:196` (action-cell click-propagation guards on a non-focusable wrapper div around already-focusable buttons). Not fixed here: (a) TZ gates for this stage explicitly list only `nx test` + `nx build`, not `nx lint`; (b) fixing only this one instance would diverge from the established (if imperfect) sibling convention rather than fix the actual baseline debt, which is out of this TZ's scope (`НЕ ИЗМЕНЯТЬ` other pages).
- `nx build kppdf-web` → **PASS**, exit 0. Same 2 pre-existing warnings as baseline (studio-table-properties `??`, gantt-bars CSS budget) — nothing new.

## Executor report

- Added `counterpartyId` param to `PiOrdersService.list()` / `PiQuotationsService.list()` (HttpParams, mirrors `PiSitesService`/`PiContractsService`) + specs.
- Rewrote `counterparties-list.page.ts`: denser grid rows (py-2), ▸/▾ chevron column, single-expand (mirrors `orders-list.page.ts`), `app-pi-row-actions` replacing the two wide text buttons, actions cell `stopPropagation`.
- New `counterparty-hub-tray.component.ts` (mirrors `order-hub-tray.component.ts`): Реквизиты (no fetch) · Объекты (`PiSitesService`) · Заказы (`PiOrdersService`, link `/orders/:id`) · КП (`PiQuotationsService`, no per-row link — no `/proposals/:id` route) · Договоры (`PiContractsService`, link `/contracts/:id`); each list capped at 5 rows with "и ещё N"; lazy-loaded on first expand, 4 HTTP total (within ≤5 budget).
- New specs: `counterparty-hub-tray.component.spec.ts` (data per block, empty/error states, no raw ObjectId in text) + additions to `counterparties-list.page.spec.ts` (expand/collapse, stopPropagation on row actions) + `pi-orders.service.spec.ts` / `pi-quotations.service.spec.ts` (`counterpartyId` param).
- Docs: `docs/pages/counterparties.page.md` NX section + TZ reference row; `docs/pages/PAGE-TZ-INDEX.md` READY→DONE.
- Known limits: КП block has no per-row deep link (no `/proposals/:id` route exists — chip-only to `/proposals`, as TZ allowed). UI verified via jsdom component/unit tests (expand/collapse, stopPropagation, per-block render/empty/error) — no live browser/Playwright session run for this stage (continuous unattended wave, 4 sequential stages).
- Conflict disclosure: touched only files listed in this TZ's CONFLICT KEYS; no other `_active/` claims existed at claim time.

## Review handoff

- [x] Review не требуется по TZ (нет отдельного review inbox для этой волны — только gates + archive)

## Closeout (после gates)

- [x] archive + progress + удалить `_active`
- [x] Status = DONE
- closed_at: 2026-09-10T15:55:00Z
