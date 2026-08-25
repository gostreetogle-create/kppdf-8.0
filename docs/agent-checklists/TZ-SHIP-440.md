# TZ-SHIP-440 checklist

> Status: **DONE**
> Marker: `tasks/_archive/2026-08/TZ-SHIP-440.done.md`
> Conflict keys: `frontend/src/app/pages/shipping/shipping.page.ts`; `frontend/src/app/pages/shipping/shipping.page.spec.ts`; `docs/pages/shipping.page.md`
> Commit/push: по `docs/GIT-POLICY.md`

## Claim slot (ОБЯЗАТЕЛЬНО до кода)

- agent_id: freebuff
- claimed_at: 2026-08-25T18:39:06+03:00
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (Team Room CLI не предоставлен)

## Preflight

- [x] `pwd` + `git rev-parse --show-toplevel` → `D:/kppdf-8.0`
- [x] branch → `main`; чужие изменения зафиксированы и не входят в scope
- [x] `_NOW.md` + `tasks/_active/` прочитаны; активный UX-440 имеет другие conflict keys
- [x] TZ / UI rules / UX form canon / domain coupling / deps прочитаны
- [x] Claim slot заполнен; Status = CLAIMED / IN PROGRESS
- [x] `tasks/_active/TZ-SHIP-440-warehouse-select.md` был на месте до архивации

### Preflight Check Output
- **Context read:** `docs/how-to-connect-ai.md`, `GEMINI.md`, `docs/PROJECT-MEMORY.md`, `docs/PO-CANON.md`, `.agents/skills/kppdf-executor-loop/SKILL.md`, `.agents/skills/kppdf-context-preflight/SKILL.md`, `docs/ui-rules.md`, `docs/UX-FORM-CANON.md`, `docs/CONTEXT.md`, `docs/COUPLING-MAP.md`, `docs/GIT-POLICY.md`, `docs/DOCS-INTEGRITY.md`, `tasks/QUEUE-LIVE.md`, `docs/audits/2026-08-25-ux-hygiene-sweep.md`, `tasks/TZ-SHIP-440-warehouse-select.md`, `frontend/src/app/pages/shipping/shipping.page.ts`, `frontend/src/app/pages/shipping/shipping.page.spec.ts`, `frontend/src/app/pages/inventory/warehouses.service.ts`, `frontend/src/app/pages/inventory/storage-put-on-stock-dialog.component.ts`, `docs/pages/shipping.page.md`
- **Key Constraints:** Existing warehouse registry is SoT; use native select; preserve dispatch and backend contracts; avoid UX-FORM layout thrash; no changes to other wave keys.
- **Planned Deliverable:** load active warehouses; replace create/edit free text with selects and RU empty/error states; guard create/save; update tests and page doc; run gates and review.
- **Validation Path:** FIC N/A (existing `/shipping` route); Integrity slot; FE tsc, shipping spec, lint, architecture check, diff check.

## Acceptance

- [x] No visible `ID склада` / `dispatch` warehouse placeholders
- [x] Create and edit render warehouse selects sourced from API; existing inactive entries remain selectable for legacy shipments
- [x] Empty/error registry state is explicit in RU; empty state disables actions
- [x] Create/save cannot send without selected warehouse or an unknown FK
- [x] Dispatch and backend contracts remain unchanged
- [x] Page documentation records registry-backed warehouse selection

## Integrity slot (до READY / archive)

- [x] Тип изменения определён: page — existing `/shipping` UI behavior
- [x] FIC §A–E: N/A — no new route, permission, backend module, MCP, or shared capability
- [x] `shipping.page.md` updated; `PAGE-TZ-INDEX` N/A — existing route, no new route/nav
- [x] `SECTION-READINESS`: N/A — existing shipping section remains routed
- [x] Чужой WIP не в коммите; conflict keys соблюдены
- [x] Coupling map: N/A — uses existing Shipment.warehouseId FK and dispatch semantics
- [x] Канон: `docs/DOCS-INTEGRITY.md` прочитан

## Gates (факт)

- `cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit` — **PASS** (0)
- `cd frontend && pnpm test -- shipping.page.spec --runInBand` — **PASS** (12/12)
- `cd frontend && pnpm lint` — **PASS** (0 errors; 17 pre-existing warnings in unrelated page files)
- focused ESLint (`shipping.page.ts` + spec) — **PASS** (0)
- `pnpm architecture:check` — **FAIL outside scope**: pre-existing/foreign cross-page imports in `materials/material-form-dialog.component.ts` and `supply/supply-quick-order.component.ts`; no SHIP-440 file involved
- `git diff --check` — **PASS for code/docs paths**; `progress.md` keeps the repository's existing CRLF line endings and reports CR-at-EOL warnings, unrelated `tasks/QUEUE-LIVE.md` whitespace remains

## Executor report

- Replaced create/edit free-text warehouse ObjectId inputs with native selects backed by `WarehousesService.list()`; the full registry response remains available so legacy shipments with an inactive warehouse can still be edited.
- Added explicit loading/error/empty RU states and guards preventing `ship()`/`update()` without a valid warehouse selection.
- Preserved dispatch API, Shipment.warehouseId payload, backend DTOs, and unrelated wave conflict keys.
- Added 6 focused warehouse tests covering active create options, legacy inactive edit options, empty/error states, create guard, and edit guard.
- Conflict disclosure: dirty UX-440 files, queue/audit files, `docs/PO-DIARY.md`, and untracked unrelated data were not staged.

## Review handoff

- [x] READY FOR REVIEW — focused gates green; live `/shipping` smoke not run because no dev server was started
- [x] Cursor/PO PASS recorded if required by TZ — no separate live PASS gate in this TZ

## Closeout (после PASS)

- [x] archive + lock + progress + удалить `_active`
- [x] Status = DONE
- closed_at: 2026-08-25T18:51:00+03:00
