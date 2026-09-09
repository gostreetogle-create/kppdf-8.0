# TZ-NX-UX-10-stock-movements checklist (AUDIT + FIX)

> Status: **DONE**
> Marker: `tasks/_active/` (removed after archive)
> Commit/push: по `docs/GIT-POLICY.md`

## Claim slot (ОБЯЗАТЕЛЬНО до кода)

- agent_id: claude
- claimed_at: 2026-09-09T18:52:00Z
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (no Team Room CLI in this session)

## Preflight

- [x] Get-Location + git rev-parse --show-toplevel → оба `D:\kppdf-8.0`
- [x] Прочитал `_NOW.md` + `tasks/_active/` — нет чужого CLAIM
- [x] `stock-movements.page.ts` + dialog + `stock-movement.types.ts` read in full
- [x] Gold reference re-read: `registries-page.ts` (`[expandedRow]` on `TableComponent`),
      `forms.page.ts` §IV (`[expandedRow]="stockDetailTpl"` direct-reference pattern, no ViewChild)
- [x] Claim slot заполнен; Status = CLAIMED / IN PROGRESS → DONE

### Preflight Check Output
- **Context read:** page + dialog + types; `TableComponent` (`pi-table.component.ts`) — confirmed
  `[expandedRow]`/`[expandedRowWhen]`/`(rowClick)` are already first-class inputs, unused on this
  page before the fix
- **Key Constraints:** only the T1 finding; reuse `TableComponent`'s own expand mechanism (no
  hand-rolled click/keyboard wiring, unlike sibling pages this wave); no BE changes
- **Planned Deliverable:** audit doc (T1-C1) + expand-in-row wiring
- **Validation Path:** focused `nx test kppdf-web --testPathPattern=stock-movements`; `nx build kppdf-web`

## Acceptance

- [x] Audit file `docs/audits/2026-09-09-nx-ux-stock-movements-audit.md` — verdict PASS-FIX (1xP1: T1).
- [x] P1 (T1): expand-in-row wired via `TableComponent`'s own inputs, shows Зона/Единица/Артикул/
      ID заказа always, Склад+Зона назначения for transfer rows.
- [x] `nx build kppdf-web` PASS.
- [x] Focused + full test run PASS, 0 regressions.
- [x] WAVE row 10 updated; page.md UX note added.

## Integrity slot (до READY / archive)

- [x] Тип изменения определён: page (frontend-nx UI, same route, additive read-only expand, no new
      permission/module/MCP)
- [x] FIC §A–E: N/A — no new page/permission/module/MCP, existing route extended in place
- [x] page.md / PAGE-TZ-INDEX: `docs/pages/stock-movements.page.md` — NX UX sweep note added
- [x] DOMAIN-MAP: N/A (no route/module contour change)
- [x] SECTION-READINESS: N/A
- [x] Чужой WIP не в коммите; conflict keys соблюдены (`stock-movements.page.ts`,
      `stock-movements.page.spec.ts`, `stock-movement.types.ts`, audit file, page.md, WAVE row 10)
- [x] Coupling map: N/A (pure UI read, no shared status/FK field touched)
- [x] Канон: docs/DOCS-INTEGRITY.md — соблюдён

## Gates (факт)

```
cd frontend-nx && pnpm exec nx test kppdf-web --testPathPattern=stock-movements → PASS 103/103 suites, 692/699 (7 skipped), 0 regressions (+2 new tests)
cd frontend-nx && pnpm exec nx build kppdf-web → PASS (exit 0, same 2 pre-existing unrelated warnings)
```

## Executor report

- **T1 (P1) fixed:** added `stockMovementUnit`/`stockMovementSku`/`stockMovementToWarehouseName`
  helpers to `stock-movement.types.ts`. Wired `<app-pi-table>`'s existing `[expandedRow]`/
  `[expandedRowWhen]`/`(rowClick)` inputs (local `expandedId` signal, `ng-template #detailTpl`
  referenced directly — same pattern as `forms.page.ts`'s §IV example, no `ViewChild` needed).
  Expand panel shows Зона/Единица/Артикул/ID заказа always; Склад назначения/Зона назначения only
  when `toWarehouseId` is present (transfer rows).
- **Specs added:** expand shows unit/sku/order and collapses on second click; transfer row's
  expand shows destination warehouse/zone. 3 pre-existing tests unmodified, still pass.
- No BE, no new features, no `/production`, no other routes touched. No hand-rolled
  click/keyboard expand machinery needed — this page was already built on the same `TableComponent`
  primitive `/registries` uses, so the fix is purely wiring existing inputs.
- Files: `stock-movements.page.ts`, `stock-movements.page.spec.ts`, `stock-movement.types.ts`,
  `docs/audits/2026-09-09-nx-ux-stock-movements-audit.md` (created), `docs/pages/stock-movements.page.md`
  (UX note), `docs/agent-checklists/WAVE-NX-UX-PAGE-SWEEP.md` (row 10 DONE), this checklist,
  `tasks/_active/` marker (created → archived).

## Review handoff

- [x] Review не требуется по TZ explicit gate; gates зелёные, diff review выполнен вручную перед archive.

## Closeout (после PASS)

- [x] archive + progress + удалить `_active`
- Status = DONE
- closed_at: 2026-09-09T19:00:00Z
