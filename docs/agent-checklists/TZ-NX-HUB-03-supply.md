# TZ-NX-HUB-03-supply checklist

> Status: **DONE**
> Marker: `tasks/_active/TZ-NX-HUB-03-supply.md`
> Commit/push: по `docs/GIT-POLICY.md`

## Claim slot

- agent_id: claude
- claimed_at: 2026-09-10T16:15:00Z
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (no Team Room CLI in this session)

## Preflight

- [x] `pwd` / `git rev-parse --show-toplevel` → `D:\kppdf-8.0`
- [x] Прочитал `_NOW.md` + `tasks/_active/` — пусто (01/02 archived/pushed), нет чужого CLAIM
- [x] TZ прочитан (`tasks/_ready/nx-hub/supply/TZ-NX-HUB-03-supply.md`)
- [x] Claim slot заполнен; Status = CLAIMED / IN PROGRESS
- [x] `tasks/_active/TZ-NX-HUB-03-supply.md` на месте

### Preflight Check Output

- **Context read:** TZ; will read `supply.page.ts` + `SupplyTask` type + `supply.page.md` next, before editing
- **Key Constraints:** no fake copy/edit write-path; compact one-CTA-per-status actions; no raw ObjectId (`confirmedBy`, materialId/moduleId) in UI; `/supply-requests` out of scope
- **Planned Deliverable:** chevron + denser table + compact actions + richer expand on `supply.page.ts` only
- **Validation Path:** `nx test kppdf-web --testPathPattern=supply.page`; `nx build kppdf-web` last

## Acceptance

- [x] H1–H4 закрыты для `/supply` (chevron, richer expand vs категорий, icon/compact actions, hairline+hover denser table)
- [x] Статус-переходы работают; busy/disabled сохранены (unit tests: confirm/ordered/received still call the same service methods)
- [x] Нет `confirmedBy` / materialId / moduleId сырого ObjectId в UI (honest placeholders; unit-tested)

## Integrity slot (до READY / archive)

- [x] Тип изменения: page (NX `/supply`, UI chrome + expand richness)
- [x] FIC — N/A
- [x] `docs/pages/supply.page.md` NX note обновлена + TZ reference row
- [x] `docs/pages/PAGE-TZ-INDEX.md` строка `/supply` READY→DONE (TZ-NX-HUB-03)
- [x] DOMAIN-MAP / SECTION-READINESS / COUPLING-MAP: N/A
- [x] Канон: docs/DOCS-INTEGRITY.md — соблюдён

## Build integrity

- [x] Baseline: green at end of stage 02 (`d26cce66`), same `kppdf-web`
- [x] Нет другого `tasks/_active/*` с `apps/kppdf-web/src/**`
- [x] Закрытие: `nx build kppdf-web` — последняя команда, exit 0

## Gates (факт)

- `nx test kppdf-web --testPathPattern=supply.page` → **PASS** (106/106 suites, 720 passed, 7 skipped; full-suite run, same tooling quirk as prior stages)
- `nx lint kppdf-web` → touched file adds **zero new** violations vs its own pre-change baseline (the one flagged line — the actions-cell stopPropagation div — existed in the original file already, same established sibling pattern as stages 01/02); total app-wide count unchanged at 37 errors/233 warnings
- `nx build kppdf-web` → **PASS**, exit 0, same 2 pre-existing warnings as baseline

## Executor report

- `supply.page.ts`: ▸/▾ chevron column, denser rows (`py-2`), `bg-paper-2`+`border-l-gold-deep` expanded accent (mirrors HUB-02); new «Создано» (`createdAt`) column; main «Позиция» column no longer shows raw `orderLineId` subtitle (moved to expand only).
- Row actions: replaced 3 possible `app-pi-button` variants with a single compact native `<button class="pi-outline-btn">` per status (one CTA rendered at a time, same as before — only the widget changed), same click handlers/disabled/data-test names preserved.
- Expand enriched: Линия заказа via new `orderLineLabel()` helper (masks values matching `^[a-f0-9]{24}$` as `—`, passes through free-text business keys as-is — H5); Материал/Модуль show honest "задан"/`—` placeholders (BE never populates a name field on list/find, confirmed in `SupplyTask` type docblock — no invented lookup); Обновлено (`updatedAt`); chip-link to `/orders/:orderId` added inside the expand panel (in addition to the existing row-level text link). `confirmedBy` continues to never render anywhere (unchanged, now unit-tested explicitly).
- Specs: chevron toggle, «Создано» column render, material/module honest-placeholder + no-raw-ObjectId assertions, confirmedBy-never-shown assertion, orderLineId mask-vs-passthrough assertion, expand order-chip href assertion.
- Docs: `docs/pages/supply.page.md` UI section rewritten for the new column set/actions/expand fields + TZ reference row; `docs/pages/PAGE-TZ-INDEX.md` READY→DONE.
- Not touched (per TZ «НЕ ИЗМЕНЯТЬ»): BE supply schema, `/supply-requests` page, no fake copy/edit action added.
- Known limits: jsdom component tests only, no live browser/Playwright session this stage.

## Closeout (после gates)

- [x] archive + удалить `_active`
- [x] Status = DONE
- closed_at: 2026-09-10T16:35:00Z
