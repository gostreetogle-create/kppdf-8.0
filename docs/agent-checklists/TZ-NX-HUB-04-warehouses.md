# TZ-NX-HUB-04-warehouses checklist

> Status: **DONE**
> Marker: `tasks/_active/TZ-NX-HUB-04-warehouses.md`
> Commit/push: по `docs/GIT-POLICY.md`

## Claim slot

- agent_id: claude
- claimed_at: 2026-09-10T16:40:00Z
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (no Team Room CLI in this session)

## Preflight

- [x] `pwd` / `git rev-parse --show-toplevel` → `D:\kppdf-8.0`
- [x] Прочитал `_NOW.md` + `tasks/_active/` — пусто (01–03 archived/pushed), нет чужого CLAIM
- [x] TZ прочитан (`tasks/_ready/nx-hub/warehouses/TZ-NX-HUB-04-warehouses.md`)
- [x] Claim slot заполнен; Status = CLAIMED / IN PROGRESS
- [x] `tasks/_active/TZ-NX-HUB-04-warehouses.md` на месте

### Preflight Check Output

- **Context read:** TZ; will read `warehouses.page.ts` + `Warehouse` type + `PiStorageItemsService` + `storage-items.page.md` next, before editing
- **Key Constraints:** остатки read-only preview only (no edit here); icon actions; default-star only when `!isDefault`; deep-link chip to `/storage-items?warehouseId=`; no BE warehouse type/zones invent
- **Planned Deliverable:** ▸ expand + inventory preview (≤8 rows) + `app-pi-row-actions` + default-star icon on `warehouses.page.ts` only — final stage of the wave
- **Validation Path:** `nx test kppdf-web --testPathPattern=warehouses.page`; `nx build kppdf-web` last; then WAVE/continuous checklist → COMPLETE, `_NOW` → Claude IDLE

## Acceptance

- [x] Icon actions; нет широких «Изменить»/«Удалить»/«Сделать по умолчанию» (unit-tested — table text no longer contains those strings)
- [x] Expand показывает preview остатков или честный empty
- [x] Chip ведёт на `/storage-items?warehouseId=<id>`

## Integrity slot (до READY / archive)

- [x] Тип изменения: page (NX `/warehouses`, UI chrome + expand)
- [x] FIC — N/A
- [x] `docs/pages/warehouses.page.md` NX note обновлена + TZ reference row
- [x] `docs/pages/PAGE-TZ-INDEX.md` строка `/warehouses` READY→DONE (TZ-NX-HUB-04)
- [x] DOMAIN-MAP / SECTION-READINESS / COUPLING-MAP: N/A
- [x] Канон: docs/DOCS-INTEGRITY.md — соблюдён

## Build integrity

- [x] Baseline: green at end of stage 03 (`beccfcaf`), same `kppdf-web`
- [x] Нет другого `tasks/_active/*` с `apps/kppdf-web/src/**`
- [x] Закрытие: `nx build kppdf-web` — последняя команда, exit 0

## Gates (факт)

- `nx test kppdf-web --testPathPattern=warehouses.page` → **PASS** (106/106 suites, 725 passed, 7 skipped; full-suite run, same tooling quirk as prior stages). Existing spec needed a new `PiStorageItemsService` mock provider (the page now injects it directly, not lazily) — added, all pre-existing tests still green.
- `nx lint kppdf-web` → touched file adds **one** new instance (38 errors app-wide, was 37) of the pre-existing `click-events-have-key-events` pattern on a stopPropagation-only actions-cell `<div>` — same established (if lint-imperfect) sibling convention already unfixed in `shipping.page.ts`, `supply.page.ts`, `supply-requests.page.ts`, `storage-items.page.ts`, and stage 01's `counterparties-list.page.ts`. Not fixed here: TZ gates list only `nx test`+`nx build`; fixing only this file would diverge from the established codebase-wide pattern rather than resolve the actual baseline debt (out of scope, other pages `НЕ ИЗМЕНЯТЬ`).
- `nx build kppdf-web` → **PASS**, exit 0, same 2 pre-existing warnings as baseline

## Executor report

- `warehouses.page.ts`: ▸/▾ chevron column, denser rows (`py-2`), `bg-paper-2`+`border-l-gold-deep` expanded accent (mirrors stages 01–03).
- Row actions: replaced the 3 wide `app-pi-button` (Сделать по умолчанию / Изменить / Удалить) with `app-pi-row-actions` (edit+delete icons) plus a standalone `★` `pi-icon-btn` shown only when `!row.isDefault`, `aria-label="Сделать складом по умолчанию"`. stopPropagation preserved on the actions cell.
- New inline expand (no separate component needed — modest scope): breadcrumb text «Склад / {name} / Остатки», `PiStorageItemsService.list({ warehouseId })` capped at 8 rows via `storageItemName()` (never a raw id), honest loading/error/empty, stale-guard against a fast row-switch, chip `.pi-outline-btn` deep-linking to `/storage-items?warehouseId=<id>` (existing W2 canon param).
- Specs: chevron + expand/collapse + item preview render, empty state, chip href, stopPropagation-does-not-toggle, no-wide-text-buttons assertion; added `PiStorageItemsService` mock to the shared `beforeEach` (now a hard DI dependency of the page, not lazy).
- Docs: `docs/pages/warehouses.page.md` NX section + TZ reference row; `docs/pages/PAGE-TZ-INDEX.md` READY→DONE.
- Not touched (per TZ «НЕ ИЗМЕНЯТЬ»): BE warehouse type/zones, `/storage-items` page layout (consumed only via existing deep-link), `/production`, no wipe.
- Known limits: jsdom component tests only, no live browser/Playwright session this stage.
- **Финал волны WAVE-NX-HUB-TABLE-PARITY** — all 4 stages DONE; see Executor report (auto) in this session's final summary for the full #01–#04 → SHA table.

## Closeout (после gates)

- [x] archive + удалить `_active`
- [x] Status = DONE
- closed_at: 2026-09-10T16:55:00Z
