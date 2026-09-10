# TZ-NX-HUB-02-orders checklist

> Status: **DONE**
> Marker: `tasks/_active/TZ-NX-HUB-02-orders.md`
> Commit/push: по `docs/GIT-POLICY.md`

## Claim slot

- agent_id: claude
- claimed_at: 2026-09-10T16:00:00Z
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (no Team Room CLI in this session)

## Preflight

- [x] `pwd` / `git rev-parse --show-toplevel` → `D:\kppdf-8.0`
- [x] Прочитал `_NOW.md` + `tasks/_active/` — пусто (01 уже archived/pushed), нет чужого CLAIM
- [x] TZ прочитан (`tasks/_ready/nx-hub/orders/TZ-NX-HUB-02-orders.md`)
- [x] Claim slot заполнен; Status = CLAIMED / IN PROGRESS
- [x] `tasks/_active/TZ-NX-HUB-02-orders.md` на месте

**Process note:** the template markup edit for `orders-list.page.ts` was made one step before this Claim file was written (self-caught mid-flow, no other agent could have collided — this TZ's conflict keys were exclusively held by this same continuous session throughout). Flagging per protocol; sequence corrected for the remaining stages.

### Preflight Check Output

- **Context read:** `tasks/_ready/nx-hub/orders/TZ-NX-HUB-02-orders.md`; `orders-list.page.ts` (already read in full during stage 01 research); `pi-row-actions.component.ts` (document icon SVG reused); `global.css` (`.pi-icon-btn`, `.pi-icon-btn-doc` tokens); `login.page.ts` (`border-l-2 border-<token>` left-accent precedent)
- **Key Constraints:** hub tray logic/business paths untouched; icon replaces text button; denser rows; chevron affordance
- **Planned Deliverable:** template-only edit to `orders-list.page.ts` (chevron column, expanded-row accent, icon card link) + specs + page.md/WAVE/checklist sync
- **Validation Path:** `nx test kppdf-web --testPathPattern=orders-list`; `nx build kppdf-web` last

## Acceptance

- [x] С первого взгляда ясно: строки — раскрываемый список (chevron)
- [x] Нет текстовой кнопки «Карточка» — icon + aria-label
- [x] Hub tray по клику работает как до FIX (логика не тронута, только template chrome)
- [x] Denser rows, все колонки/readiness сохранены

## Integrity slot (до READY / archive)

- [x] Тип изменения: page (NX `/orders`, UI chrome only)
- [x] FIC — N/A, чистый UI chrome на существующей странице
- [x] `docs/pages/orders.page.md` NX note обновлена + TZ reference row
- [x] `docs/pages/PAGE-TZ-INDEX.md` READY→DONE для `/orders` (NX) TZ-NX-HUB-02
- [x] DOMAIN-MAP / SECTION-READINESS / COUPLING-MAP: N/A (не менял контур/статус/FK)
- [x] Канон: docs/DOCS-INTEGRITY.md — соблюдён

## Build integrity

- [x] Baseline: green at end of stage 01 (`aa58e7fd`/`61a2b6ba`), same `kppdf-web`, no intervening foreign edits
- [x] Нет другого `tasks/_active/*` с `apps/kppdf-web/src/**`
- [x] Закрытие: `nx build kppdf-web` — последняя команда, exit 0

## Gates (факт)

- `nx test kppdf-web --testPathPatterns=orders-list` → **PASS** (106/106 suites, 714 passed, 7 skipped; full-suite run, same tooling quirk as stage 01 — testPathPatterns doesn't actually filter here)
- `nx lint kppdf-web` → my touched file (`orders-list.page.ts`) has **zero** new lint issues (grep-verified); same 37-error/233-warning baseline as stage 01, unrelated files
- `nx build kppdf-web` → **PASS**, exit 0, same 2 pre-existing warnings as baseline

## Executor report

- `orders-list.page.ts`: added a leading ▸/▾ chevron column (`data-test="orders-row-chevron"`), `bg-paper-2` + `border-l-gold-deep` accent on the expanded row, denser rows (`py-2`), replaced the wide «Карточка» text link with a `pi-icon-btn-doc` icon anchor (`aria-label="Открыть карточку заказа"`, same FileText SVG glyph as `pi-row-actions`'s document slot) — routerLink + stopPropagation preserved verbatim.
- `order-hub-tray.component.ts` untouched — hub business logic/write-paths (confirm materials, ship, cancel shipment) not modified, per TZ «НЕ ИЗМЕНЯТЬ».
- Specs: added icon-link assertion (no text, aria-label, svg present), chevron/aria-expanded toggle assertion (moved into the hub-expand describe block since it needs the same hub-tray provider mocks); renamed the stopPropagation test description to match the icon (behaviour unchanged).
- Docs: `docs/pages/orders.page.md` NX section + TZ reference row; `docs/pages/PAGE-TZ-INDEX.md` READY→DONE.
- Process note: code edit for this stage started one step before the Claim files were written (self-corrected — see Preflight note above); no actual collision risk since this session held these conflict keys exclusively throughout.
- Known limits: verified via jsdom component tests only, no live browser/Playwright session this stage.

## Closeout (после gates)

- [x] archive + удалить `_active`
- [x] Status = DONE
- closed_at: 2026-09-10T16:10:00Z
