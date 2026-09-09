# TZ-NX-UX-09-storage-items-FIX checklist

> Status: **DONE**
> Marker: `tasks/_active/TZ-NX-UX-09-storage-items-FIX.md` (removed after archive)
> Commit/push: по `docs/GIT-POLICY.md`

## Claim slot (ОБЯЗАТЕЛЬНО до кода)

- agent_id: claude
- claimed_at: 2026-09-09T18:35:30Z
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (no Team Room CLI in this session)

## Preflight

- [x] Get-Location + git rev-parse --show-toplevel → оба `D:\kppdf-8.0`
- [x] Прочитал `_NOW.md` + `tasks/_active/` — нет чужого CLAIM
- [x] AUDIT `docs/audits/2026-09-09-nx-ux-storage-items-audit.md` — verdict PASS-FIX (2xP1: T1, F2)
- [x] Gold reference re-read: `/shipping` (`clearOrderFilter` chip pattern), `/supply-requests`
      (expand-in-row `toggleExpand`/`onRowSpace` pattern)
- [x] Claim slot заполнен; Status = CLAIMED / IN PROGRESS → DONE

### Preflight Check Output
- **Context read:** `storage-items.page.ts`, both dialogs, `storage-item.types.ts`,
  `shipping.page.ts` (chip pattern), `supply-requests.page.ts` (expand pattern)
- **Key Constraints:** only the 2xP1 from audit; reuse existing patterns verbatim; no BE changes
- **Planned Deliverable:** expand-in-row (unit/sku/status) + material-filter reset chip
- **Validation Path:** focused `nx test kppdf-web --testPathPattern=storage-items`; `nx build kppdf-web`

## Acceptance

- [x] P1 (T1): expand-in-row added, shows Единица/Артикул/Статус.
- [x] P1 (F2): material filter chip has a working reset button.
- [x] `nx build kppdf-web` PASS.
- [x] Focused + full test run PASS, 0 regressions.
- [x] Audit closeout appended; WAVE row 09 updated; page.md UX note added.

## Integrity slot (до READY / archive)

- [x] Тип изменения определён: page (frontend-nx UI, same route, additive read-only expand + filter
      reset, no new permission/module/MCP)
- [x] FIC §A–E: N/A — no new page/permission/module/MCP, existing route extended in place
- [x] page.md / PAGE-TZ-INDEX: `docs/pages/storage-items.page.md` — NX UX sweep note added
- [x] DOMAIN-MAP: N/A (no route/module contour change)
- [x] SECTION-READINESS: N/A
- [x] Чужой WIP не в коммите; conflict keys соблюдены (`storage-items.page.ts`,
      `storage-items.page.spec.ts`, `storage-item.types.ts`, audit file, page.md, WAVE row 09)
- [x] Coupling map: N/A (pure UI read + query-param reset, no shared status/FK field touched)
- [x] Канон: docs/DOCS-INTEGRITY.md — соблюдён

## Gates (факт)

```
cd frontend-nx && pnpm exec nx test kppdf-web --testPathPattern=storage-items → PASS 103/103 suites, 690/697 (7 skipped), 0 regressions (+3 new tests)
cd frontend-nx && pnpm exec nx build kppdf-web → PASS (exit 0, same 2 pre-existing unrelated warnings: studio-table-properties NG8102, gantt-bars budget)
```

## Executor report

- **T1 (P1) fixed:** added `storageItemUnit`/`storageItemSku` helpers to `storage-item.types.ts`
  (same product-then-material fallback shape as existing `storageItemName`). Rows now expand-in-row
  on click/Enter/Space, showing Единица/Артикул/Статус (Активна/Неактивна) read-only.
- **F2 (P1) fixed:** material filter chip (`material-filter-chip`) now has a `.pi-outline-btn`
  «Сбросить» (`material-filter-clear`) that clears `materialId` via `Router.navigate` — identical
  mechanism to `/shipping`'s `clearOrderFilter`; the existing `queryParamMap` subscription picks up
  the change automatically.
- **Specs added:** expand shows unit/sku/status and collapses on second click; row action click
  doesn't toggle expand; chip reset navigates with `materialId: null`. Updated 1 pre-existing test's
  selector (`material-filter-label` → `material-filter-chip`, since the label span became a chip).
- No BE, no new features, no `/production`, no other routes touched.
- Files: `storage-items.page.ts`, `storage-items.page.spec.ts`, `storage-item.types.ts`,
  `docs/audits/2026-09-09-nx-ux-storage-items-audit.md` (closeout appended),
  `docs/pages/storage-items.page.md` (UX note), `docs/agent-checklists/WAVE-NX-UX-PAGE-SWEEP.md`
  (row 09 DONE), this checklist, `tasks/_active/TZ-NX-UX-09-storage-items-FIX.md` (created → archived).

## Review handoff

- [x] Review не требуется по TZ explicit gate; gates зелёные, diff review выполнен вручную перед archive.

## Closeout (после PASS)

- [x] archive + progress + удалить `_active`
- Status = DONE
- closed_at: 2026-09-09T18:50:00Z
