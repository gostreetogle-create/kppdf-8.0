# TZ-NX-UX-12-proposals checklist (AUDIT + FIX)

> Status: **DONE**
> Marker: `tasks/_active/` (removed after archive)
> Commit/push: по `docs/GIT-POLICY.md`

## Claim slot (ОБЯЗАТЕЛЬНО до кода)

- agent_id: claude
- claimed_at: 2026-09-09T19:02:00Z
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (no Team Room CLI in this session)

## Preflight

- [x] Get-Location + git rev-parse --show-toplevel → оба `D:\kppdf-8.0`
- [x] Прочитал `_NOW.md` + `tasks/_active/` — нет чужого CLAIM
- [x] `proposals-list.page.ts` + `quotation.types.ts` + BE `quotation.service.ts` (populate check)
      read in full
- [x] Claim slot заполнен; Status = CLAIMED / IN PROGRESS → DONE

### Preflight Check Output
- **Context read:** page source; `quotation.types.ts`; BE `quotation.service.ts` (confirmed
  `.populate('counterpartyId')` on `list()` — zero-BE-change fix); `proposals.page.md`
- **Key Constraints:** only T1 (counterparty) + A1 (3 underline sites, already flagged in `08b`
  as out-of-scope-there); no BE changes; no search/pagination/delete invention despite doc drift
- **Planned Deliverable:** counterparty subtitle + 3× underline→`.pi-outline-btn`
- **Validation Path:** focused `nx test kppdf-web --testPathPattern=proposals-list`; `nx build kppdf-web`

## Acceptance

- [x] Audit file `docs/audits/2026-09-09-nx-ux-proposals-audit.md` — verdict PASS-FIX (1xP1 T1, 1xP2 A1).
- [x] P1 (T1): counterparty name rendered as row subtitle when populated.
- [x] P2 (A1): 3 underline actions converted to `.pi-outline-btn`.
- [x] `nx build kppdf-web` PASS.
- [x] Focused + full test run PASS, 0 regressions.
- [x] WAVE row 12 updated; page.md UX note added.

## Integrity slot (до READY / archive)

- [x] Тип изменения определён: page (frontend-nx UI, same route, additive read-only field + style
      conversion, no new permission/module/MCP)
- [x] FIC §A–E: N/A — no new page/permission/module/MCP, existing route extended in place
- [x] page.md / PAGE-TZ-INDEX: `docs/pages/proposals.page.md` — NX UX sweep note added, doc-vs-code
      drift flagged (search/pagination/delete absent from code) but explicitly not touched
- [x] DOMAIN-MAP: N/A (no route/module contour change)
- [x] SECTION-READINESS: N/A
- [x] Чужой WIP не в коммите; conflict keys соблюдены (`proposals-list.page.ts`,
      `proposals-list.page.spec.ts`, `quotation.types.ts`, audit file, page.md, WAVE row 12)
- [x] Coupling map: N/A (pure UI read + style class swap, no shared status/FK field touched)
- [x] Канон: docs/DOCS-INTEGRITY.md — соблюдён

## Gates (факт)

```
cd frontend-nx && pnpm exec nx test kppdf-web --testPathPattern=proposals-list → PASS 103/103 suites, 693/700 (7 skipped), 0 regressions (+1 new test)
cd frontend-nx && pnpm exec nx build kppdf-web → PASS (exit 0, same 2 pre-existing unrelated warnings)
```

## Executor report

- **T1 (P1) fixed:** added `quotationCounterpartyName()` helper to `quotation.types.ts`. Row now
  shows «Заказчик: {name}» as a subtitle when `counterpartyId` is populated (backend already
  populates it on every `list()` call — zero BE change).
- **A1 (P2) fixed, all 3 sites:** family toggle, per-variant «В студии», «Синхронизировать состав
  с мастером» converted from underline text to `.pi-outline-btn` — same conversion pattern already
  applied on `/supply-requests` this wave. No `data-test` selectors changed.
- **Doc-vs-code drift flagged, not touched:** `proposals.page.md` describes search/sort/pagination/
  soft-delete that don't exist in the current page source, and a `sent` status-label wording
  mismatch — both noted in the audit and page.md for the PO, left untouched per "don't invent
  features" / "one page's TZ, not a doc-correction TZ".
- **Specs added:** 1 test for the counterparty subtitle. All ~35 pre-existing tests across 8
  `describe` blocks unmodified and still pass (none referenced the underline classes by selector).
- No BE, no new features, no `/production`, no other routes touched.
- Files: `proposals-list.page.ts`, `proposals-list.page.spec.ts`,
  `frontend-nx/libs/data-access/src/lib/sales/quotation.types.ts`,
  `docs/audits/2026-09-09-nx-ux-proposals-audit.md` (created), `docs/pages/proposals.page.md`
  (UX note), `docs/agent-checklists/WAVE-NX-UX-PAGE-SWEEP.md` (row 12 DONE), this checklist,
  `tasks/_active/` marker (created → archived).

## Review handoff

- [x] Review не требуется по TZ explicit gate; gates зелёные, diff review выполнен вручную перед archive.

## Closeout (после PASS)

- [x] archive + progress + удалить `_active`
- Status = DONE
- closed_at: 2026-09-09T19:10:00Z
