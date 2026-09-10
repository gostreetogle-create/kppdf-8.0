# TZ-NX-HUB-06-EXPAND-CARDS checklist

> Status: **DONE**
> Marker: `tasks/_active/TZ-NX-HUB-06-EXPAND-CARDS.md`
> Commit/push: по `docs/GIT-POLICY.md`

## Claim slot

- agent_id: claude
- claimed_at: 2026-09-10T18:25:00Z
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (no Team Room CLI in this session)

## Preflight

- [x] `pwd` / `git rev-parse --show-toplevel` → `D:\kppdf-8.0`
- [x] Прочитал `_NOW.md` + `tasks/_active/` — пусто (01 archived/pushed), нет чужого CLAIM
- [x] TZ прочитан
- [x] Claim slot заполнен; Status = CLAIMED / IN PROGRESS
- [x] `tasks/_active/TZ-NX-HUB-06-EXPAND-CARDS.md` на месте

### Preflight Check Output

- **Context read:** TZ; `counterparty-hub-tray.component.ts` (gold section markup, authored earlier this session); current `supply.page.ts` expand block (flat `pi-label` grid, authored in the prior HUB-03 stage this session); current `warehouses.page.ts` expand block (breadcrumb text + flat list, authored in HUB-04); `order-hub-tray.component.ts` (verify-only reference)
- **Key Constraints:** gold markup = `section.hairline.rounded-sm.bg-paper.p-4` + `h3`; no BE invent; no second write-path; preserve compact status CTA on supply row
- **Planned Deliverable:** supply + warehouses expand rewritten as category cards; orders verified; audit doc
- **Validation Path:** `nx test kppdf-web --testPathPattern=supply.page|warehouses.page|order-hub`; `nx build kppdf-web` last

## Acceptance

- [x] `/supply` expand reads as card-family (same as counterparty hub), not flat label sheet — 4 sections, unit-tested for the exact gold class contract
- [x] `/warehouses` expand has ≥2 category cards — О складе / Остатки, unit-tested
- [x] `/orders` verified — already gold markup (byte-identical class string), no change; no regression to business write-paths (untouched file)
- [x] Audit doc exists with route→verdict matrix (`docs/audits/2026-09-10-nx-hub-expand-cards.md`)

## Gates (факт)

- `nx test kppdf-web --testPathPattern=supply.page|warehouses.page|order-hub` → **PASS** (105/105 suites, 726 passed, 7 skipped)
- `nx lint kppdf-web` → touched files add **zero** new issues (same 38-error baseline as end of stage 01; the 2 flagged lines in supply/warehouses are the pre-existing stopPropagation action-cell pattern, untouched by this stage's expand-only edit)
- `nx build kppdf-web` → **PASS**, exit 0, same 2 pre-existing warnings as baseline

## Executor report

- `supply.page.ts`: rewrote the expand `@if` block into the gold wrapper + 4 `section.hairline.rounded-sm.bg-paper.p-4` cards (Позиция / Связь с заказом / Состав / Сроки и заметки). All prior data/logic (honest material/module placeholders, ObjectId-masked line key, order chip, compact per-status row CTA) preserved verbatim — pure markup regroup.
- `warehouses.page.ts`: same treatment, 2 cards (О складе / Остатки). Balances preview/empty/error/chip logic unchanged.
- `order-hub-tray.component.ts`: verified only — already uses the identical `section.min-w-0.hairline.rounded-sm.bg-paper.p-4` + `h3` pattern for all 4 groups; no edit needed.
- `counterparty-hub-tray.component.ts`: not touched (gold reference, per TZ «НЕ ИЗМЕНЯТЬ»).
- Specs: added one structural test per page asserting each card's `data-test`, `SECTION` tag, the 3 gold utility classes, and an `<h3>` — existing text-content-based tests needed no changes since the expand copy/data-test ids for line/order-link were kept.
- Audit: `docs/audits/2026-09-10-nx-hub-expand-cards.md` — route → before/after → verdict matrix, all PASS, nothing left open.
- Docs: `supply.page.md` + `warehouses.page.md` TZ reference rows + NX section updates.
- Not touched: BE, `/production`, DocStudio, fake edit/copy actions, order hub business write-paths.

## Closeout

- [x] archive + удалить `_active`
- [x] Status = DONE
- closed_at: 2026-09-10T18:45:00Z
