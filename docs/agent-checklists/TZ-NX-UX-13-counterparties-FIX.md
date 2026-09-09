# TZ-NX-UX-13-counterparties checklist (AUDIT + FIX)

> Status: **DONE**
> Marker: `tasks/_active/` (removed after archive)
> Commit/push: по `docs/GIT-POLICY.md`

## Claim slot (ОБЯЗАТЕЛЬНО до кода)

- agent_id: claude
- claimed_at: 2026-09-09T19:12:00Z
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (no Team Room CLI in this session)

## Preflight

- [x] Get-Location + git rev-parse --show-toplevel → оба `D:\kppdf-8.0`
- [x] Прочитал `_NOW.md` + `tasks/_active/` — нет чужого CLAIM
- [x] `counterparties-list.page.ts` + form dialog + `counterparty.types.ts` + BE
      `counterparty.service.ts` (isActive/soft-delete check) read in full
- [x] Claim slot заполнен; Status = CLAIMED / IN PROGRESS → DONE

### Preflight Check Output
- **Context read:** page + dialog + types; BE service (confirmed `isActive` always true in
  practice, correctly excluded from findings); `counterparties.page.md` (confirmed no doc-vs-code
  drift, unlike `/proposals`)
- **Key Constraints:** only the T1 finding; preserve documented `shortName` priority; no BE changes
- **Planned Deliverable:** full-name subtitle when it differs from shortName
- **Validation Path:** focused `nx test kppdf-web --testPathPattern=counterparties-list`; `nx build kppdf-web`

## Acceptance

- [x] Audit file `docs/audits/2026-09-09-nx-ux-counterparties-audit.md` — verdict PASS-FIX (1xP1 T1).
- [x] P1 (T1): full legal name shown as subtitle when it differs from shortName.
- [x] `nx build kppdf-web` PASS.
- [x] Focused + full test run PASS, 0 regressions.
- [x] WAVE row 13 updated; page.md UX note added.

## Integrity slot (до READY / archive)

- [x] Тип изменения определён: page (frontend-nx UI, same route, additive read-only subtitle, no
      new permission/module/MCP)
- [x] FIC §A–E: N/A — no new page/permission/module/MCP, existing route extended in place
- [x] page.md / PAGE-TZ-INDEX: `docs/pages/counterparties.page.md` — NX UX sweep note added
- [x] DOMAIN-MAP: N/A (no route/module contour change)
- [x] SECTION-READINESS: N/A
- [x] Чужой WIP не в коммите; conflict keys соблюдены (`counterparties-list.page.ts`,
      `counterparties-list.page.spec.ts`, audit file, page.md, WAVE row 13)
- [x] Coupling map: N/A (pure UI read, no shared status/FK field touched)
- [x] Канон: docs/DOCS-INTEGRITY.md — соблюдён

## Gates (факт)

```
cd frontend-nx && pnpm exec nx test kppdf-web --testPathPattern=counterparties-list → PASS 103/103 suites, 694/701 (7 skipped), 0 regressions (+1 new test)
cd frontend-nx && pnpm exec nx build kppdf-web → PASS (exit 0, same 2 pre-existing unrelated warnings)
```

## Executor report

- **T1 (P1) fixed:** row label now shows a `text-xs text-muted-foreground` subtitle
  (`data-test="counterparty-full-name"`) with the full `name` whenever `shortName` is set and
  differs — previously invisible everywhere, including the edit dialog (which edits `name` but
  never displays it distinctly from the short form in the list). `shortName`'s documented primary-
  label priority is unchanged.
- **Considered and rejected:** an `isActive` badge (mirroring `/warehouses`) — checked the backend
  and found every counterparty this page can ever list has `isActive === true` (soft-delete uses a
  separate `deletedAt` field, filtered out of `list()` entirely); would be constant noise, not
  information. Documented in the audit's "already ok" section rather than silently skipped.
- **Specs added:** 1 test covering both the absent-subtitle case (no `shortName`) and the
  present-subtitle case (`shortName` differs from `name`, using the existing `cp-2` fixture). All
  7 pre-existing tests unmodified and still pass.
- No BE, no new features, no `/production`, no other routes touched. No doc-vs-code drift found on
  this page (unlike `/proposals`) — `counterparties.page.md` already matched the code exactly.
- Files: `counterparties-list.page.ts`, `counterparties-list.page.spec.ts`,
  `docs/audits/2026-09-09-nx-ux-counterparties-audit.md` (created), `docs/pages/counterparties.page.md`
  (UX note), `docs/agent-checklists/WAVE-NX-UX-PAGE-SWEEP.md` (row 13 DONE), this checklist,
  `tasks/_active/` marker (created → archived).

## Review handoff

- [x] Review не требуется по TZ explicit gate; gates зелёные, diff review выполнен вручную перед archive.

## Closeout (после PASS)

- [x] archive + progress + удалить `_active`
- Status = DONE
- closed_at: 2026-09-09T19:20:00Z
