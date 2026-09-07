# TZ-NX-DEALS-ORDERS-HUB-TRAY-INSET checklist

> Status: **DONE**
> Marker: removed (`tasks/_active/TZ-NX-DEALS-ORDERS-HUB-TRAY-INSET.md` deleted at closeout)

## Claim slot

- agent_id: claude
- claimed_at: 2026-09-08T03:00:00+03:00
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (no Team Room CLI in this executor)

## Preflight

- [x] `order-hub-tray.component.ts`/spec read in full — found the exact `-mx-2` on the composition toggle and the `border-t hairline pt-3 mt-3` stacking pattern the audit flagged
- [x] `docs/paper-and-ink.md` § Panel & expand inset + `docs/UX-FORM-CANON.md` § Panel inset read — canon minimum `p-3`/preferred `p-4`, gap `gap-4`–`gap-5`, DESK-428 = `p-4`/`gap-5`
- [x] `docs/pages/orders.page.md` § Визуальная иерархия expand read — 4-group visual lock, PO lock 2026-08-15
- [x] `tasks/_active/` checked — no competing claim

## Acceptance

- [x] Раскрытый заказ: текст/кнопки не вплотную к hairline (p-3/p-4 on groups and sub-tiles)
- [x] Четыре группы и подблоки Исполнение/Логистика читаются как отдельные плитки
- [x] Нет `-mx-*` на toggles tray
- [x] Поведение expand/composition/supply/reservations/links — без регресса
- [x] Gates PASS

## Integrity slot (before READY / archive)

- [x] Type: other (visual-only fix on an existing route; no new permission/module/MCP)
- [x] FIC §A–E: N/A — no route/permission/module/MCP change, styling only
- [x] page.md: `docs/pages/orders.page.md` — one-line note under § Визуальная иерархия expand
- [x] DOMAIN-MAP: N/A — no module/route contour changed
- [x] Coupling map: N/A — no FK/status coupling touched, deep-links and write-path unchanged
- [x] No unrelated dirty WIP staged (desk/supply/photos/desktop untouched, per instruction)

## Build integrity

- [x] Baseline `cd frontend-nx && pnpm exec nx build kppdf-web` — green before edits (unchanged baseline from prior wave)
- [x] `cd frontend-nx && pnpm exec nx build kppdf-web` — last gate, green

## Gates (fact)

- PASS: `cd frontend-nx && pnpm exec nx test kppdf-web --testPathPattern=order-hub-tray` — 97 suites / 641 passed / 7 skipped / 0 failed (3 new asserts)
- PASS: `cd frontend-nx && pnpm exec nx lint kppdf-web` — 0 new issues (same pre-existing 30-error baseline elsewhere, none in this file)
- PASS: `cd frontend-nx && pnpm exec nx build kppdf-web` (last)

## Executor report

- **ШАГ 1:** outer `order-lifecycle-groups` grid `gap-4` → `gap-5` (DESK-428 air). The 4 group sections already had `p-4`/`hairline rounded-sm bg-paper` — no change needed there.
- **ШАГ 2:** removed `-mx-2` from the composition-toggle button (`order-composition-toggle`) — kept `px-2` for the hover highlight, per TZ ("px-2 ок, но без -mx-*"). Grepped the whole file afterward — zero remaining `-mx-*`.
- **ШАГ 3:** the 5 sub-blocks (Снабжение/Производство/Готовность in Исполнение; Склад/Отгрузка in Логистика) went from `border-t hairline pt-3 mt-3` stacking to independent tiles — `rounded-sm bg-paper-2 p-3`, wrapped in a `flex flex-col gap-3` container per group. No hairline added to the tiles (avoids the "double thick border" the TZ warned against) — `bg-paper-2` against the parent's `bg-paper` already reads as a distinct plate. Internal row layout (label → counters → CTA) and all deep-links/write-paths (kit-reserve confirm, supply/production/storage-items/shipping/documents links) untouched.
- **ШАГ 4:** 3 new spec assertions (no `-mx-` on the toggle; outer grid has `gap-5` not `gap-4`; all 5 sub-blocks carry `bg-paper-2`+`p-3` and no `border-t`) + the one-line `orders.page.md` note.
- conflict disclosure: touched only the TZ's listed conflict keys; desk/supply/photos/desktop untouched, per instruction.
- known limitation: live browser PASS is PO's call (no Playwright in repo, per TZ's own known_limitation) — visual verification here is structural (class assertions), not a screenshot.

## Closeout

- [x] archive + DONE lock + remove `_active` marker
- closed_at: 2026-09-08T03:30:00+03:00
