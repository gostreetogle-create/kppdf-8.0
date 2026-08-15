# TZ-CATALOG-340 — checklist

Status: **DONE**

## Claim slot
- agent_id: Buffy
- claimed_at: 2026-08-16T00:05:10+03:00
- workspace: `D:\kppdf-8.0`
- team_room_claim: unavailable
- active conflict check: clear; `tasks/_active/` was empty before claim

## Conflict keys
- `frontend/src/app/shared/ui/composition/product-composition-picker-dialog.component.ts`
- `frontend/src/app/shared/ui/composition/product-composition-picker-dialog.component.spec.ts`
- `docs/agent-checklists/TZ-CATALOG-340.md`
- `docs/agent-checklists/WAVE-COMPOSE-CREATE-PHOTO.md`
- `progress.md`
- `docs/pages/PAGE-TZ-INDEX.md`

## Acceptance checklist
- [x] CLAIM
- [x] RU «Создать» visible beside «Что добавить»
- [x] Create opens QuickCreate/material create flow for active tab kind
- [x] Successful create refreshes matching options and selects new id
- [x] Product, module, and material/detail paths covered by specs
- [x] No BOM write API change
- [x] frontend tsc + targeted Jest + lint/format gates
- [x] Integrity slot, executor report, archive, lock, MASTER [x]; commit/push `af61dda0`

## Gates (fact)
- `cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit` — PASS (exit 0)
- `cd frontend && pnpm exec jest src/app/shared/ui/composition/product-composition-picker-dialog.component.spec.ts src/app/shared/ui/composition/product-bom-panel.component.spec.ts src/app/shared/ui/quick-create/quick-create-dialog.component.spec.ts --runInBand` — PASS, 3 suites / 38 tests
- `cd frontend && pnpm lint` — PASS, 18 pre-existing architecture warnings, 0 errors
- `cd frontend && pnpm exec prettier --check src/app/shared/ui/composition/product-composition-picker-dialog.component.ts src/app/shared/ui/composition/product-composition-picker-dialog.component.spec.ts` — PASS
- `git diff --check` — PASS for owned changes

## Integrity slot (до READY / archive)
- [x] Тип изменения определён: `other` — shared composition picker UI; no new route/API
- [x] FIC §A–E: N/A — no route, permission, backend module, or MCP change
- [x] page.md / PAGE-TZ-INDEX: PAGE-TZ-INDEX updated with picker coverage; no page SoT change
- [x] SECTION-READINESS: N/A — existing catalog sections only
- [x] Чужой WIP не в коммите; conflict keys соблюдены; `data/*` excluded
- [x] Канон: `docs/DOCS-INTEGRITY.md`

## Plan
1. Inspect existing picker, QuickCreate result contract, and dialog close helper.
2. Implement focused picker orchestration without changing composition writes.
3. Verify with targeted component specs and frontend gates.
4. Archive, lock, clean `_active`, commit/push, and move to TZ-342.

## Executor report
- Added RU `Создать` beside `Что добавить` in the composition picker.
- Product/module tabs open dynamic QuickCreate; material/detail opens the existing material create form without introducing a second BOM write path.
- Successful close updates the matching signal-backed options, selects the new `_id`, and preserves the current quantity.
- Dynamic imports avoid the existing QuickCreate ↔ ProductBomPanel ↔ picker cycle.
- Conflict disclosure: only TZ-340 conflict keys plus wave/status/index closeout files are owned; `data/paspots`, `data/products`, `docs/PO-DIARY.md`, and unrelated untracked WIP remain unstaged.
- Known limit: material uses the catalog material form because the current QuickCreate contract supports product/module only.
