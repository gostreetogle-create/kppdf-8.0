# TZ-DOC-TABLES-307 checklist

> Status: **DONE**
> Marker: `tasks/_archive/2026-08/TZ-DOC-TABLES-307.done.md`
> Closeout: KP category + seed/apply preset published with archive and lock

## Claim slot

- agent_id: `agent-6c3d05b80e`
- claimed_at: `2026-08-09T14:39:04Z`
- workspace: `D:\kppdf-8.0`
- team_room_claim: unavailable — Team Room registry reports unknown task

## Preflight

- [x] Get-Location + git rev-parse → `D:\kppdf-8.0`; canonical `main` at `2eab9063`.
- [x] `_active-map` + `tasks/_active/` scanned; no foreign claim on table-template keys.
- [x] Canon `docs/audits/2026-08-09-kp-table-config-canon.md` and TZ read.
- [x] 305, 306, and 308 archived DONE; 307 keys were free.
- [x] Claim slot and `_active` marker created before code.
- [x] Team Room claim attempted; registry reports unknown task.

## Acceptance

- [x] Category `kp` and UI label «КП».
- [x] Idempotent active seed «КП — позиции» with six canonical keys.
- [x] Apply-preset inserts/replaces canonical columns with confirmation when non-empty.
- [x] Backend tsc, table-template e2e, frontend tsc, and focused frontend tests PASS.
- [x] `tables.page.md` and PAGE-TZ-INDEX updated.

## Integrity slot

- [x] Тип: page (tables) + module (table-template).
- [x] FIC §A–E: N/A except page/module behavior; no new permission surface.
- [x] `tables.page.md` and PAGE-TZ-INDEX updated.
- [x] Foreign WIP excluded; conflict keys respected.
- [x] Canon: `docs/DOCS-INTEGRITY.md`.

## Gates (факт)

- Backend tsc: PASS — `pnpm exec tsc -p tsconfig.build.json --noEmit`.
- Backend table-template e2e: PASS — **9/9** (`pnpm test:e2e test/e2e/table-templates.e2e-spec.ts`).
- Frontend tsc: PASS — `pnpm exec tsc -p tsconfig.app.json --noEmit`.
- Frontend focused tables/dialog Jest: PASS — **52/52**.
- `git diff --check`: PASS.

## Executor report (auto)

- Added `kp` to backend and frontend `TableTemplateCategory` values with UI label «КП».
- Added canonical `index`, `productName`, `quantity`, `unit`, `unitPrice`, `sum` columns and the idempotent active «КП — позиции» seed.
- Seed runs through `TableTemplateService.onModuleInit()` and does not duplicate an existing same-name/category preset.
- Added «Пресет КП» to the table dialog; empty dialogs apply immediately, non-empty columns require explicit replacement confirmation.
- Existing categories and Create КП instance behavior remain unchanged; Create does not PATCH shared TableTemplate.
- Scope guard: DOC-343 dirty WIP, 306 chips, 308 layout, 330/331, discount column, deploy, and Catalog routes untouched.

## Review handoff

- [x] Gates complete; preset category/seed/apply acceptance verified by focused tests and e2e.

## Closeout

- [x] archive + lock + DONE
- closed_at: `2026-08-09T14:42:11Z`
