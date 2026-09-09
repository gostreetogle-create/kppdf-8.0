# TZ-NX-UX-14-contracts checklist (AUDIT + FIX)

> Status: **DONE**
> Marker: `tasks/_active/` (removed after archive)
> Commit/push: по `docs/GIT-POLICY.md`

## Claim slot (ОБЯЗАТЕЛЬНО до кода)

- agent_id: claude
- claimed_at: 2026-09-09T19:22:00Z
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (no Team Room CLI in this session)

## Preflight

- [x] Get-Location + git rev-parse --show-toplevel → оба `D:\kppdf-8.0`
- [x] Прочитал `_NOW.md` + `tasks/_active/` — нет чужого CLAIM
- [x] `contracts-list.page.ts`, `contract-detail.page.ts`, `contract-status.ts`,
      `contract.types.ts`, `contracts.page.md` read in full
- [x] Claim slot заполнен; Status = CLAIMED / IN PROGRESS → DONE

### Preflight Check Output
- **Context read:** both pages; `contract.types.ts` (found `contractStatus`/`signedAt`/
  `expiresAt`/`notes` all unrendered); `contracts.page.md` (confirmed `contractStatus` is a
  documented, distinct-from-`status` field with an explicit "не путать" warning)
- **Key Constraints:** read-only fix only (no attach/sign UI); only detail card in scope for T1
  (list stays thin, intended master/detail split); no BE changes
- **Planned Deliverable:** detail card info-grid extension (attachment status + dates + notes)
- **Validation Path:** focused `nx test kppdf-web --testPathPattern=contracts`; `nx build kppdf-web`

## Acceptance

- [x] Audit file `docs/audits/2026-09-09-nx-ux-contracts-audit.md` — verdict PASS-FIX (1xP1 T1).
- [x] P1 (T1): attachment status + signedAt + expiresAt + notes shown on detail card.
- [x] `nx build kppdf-web` PASS.
- [x] Focused + full test run PASS, 0 regressions.
- [x] WAVE row 14 updated; page.md UX note added.

## Integrity slot (до READY / archive)

- [x] Тип изменения определён: page (frontend-nx UI, same routes, additive read-only fields, no
      new permission/module/MCP, no write UI added)
- [x] FIC §A–E: N/A — no new page/permission/module/MCP, existing routes extended in place
- [x] page.md / PAGE-TZ-INDEX: `docs/pages/contracts.page.md` — NX UX sweep note added under
      §"NX thin CRUD (D4)"
- [x] DOMAIN-MAP: N/A (no route/module contour change)
- [x] SECTION-READINESS: N/A
- [x] Чужой WIP не в коммите; conflict keys соблюдены (whole `pages/contracts/**` glob: list,
      detail, status helper, both specs, audit file, page.md, WAVE row 14)
- [x] Coupling map: N/A (pure UI read, no shared status/FK field touched, no write path added)
- [x] Канон: docs/DOCS-INTEGRITY.md — соблюдён

## Gates (факт)

```
cd frontend-nx && pnpm exec nx test kppdf-web --testPathPattern=contracts → PASS 103/103 suites, 696/703 (7 skipped), 0 regressions (+2 new tests)
cd frontend-nx && pnpm exec nx build kppdf-web → PASS (exit 0, same 2 pre-existing unrelated warnings)
```

## Executor report

- **T1 (P1) fixed:** added `contractAttachmentStatusLabel()` to `contract-status.ts`. Detail
  card's info grid now shows Статус вложения (`contractStatus`), Подписан (`signedAt`), Действует
  до (`expiresAt`), and — when present — Примечания (`notes`). Absent dates/status render `—`
  (no jump). No write UI added — attach/sign stays explicitly out of D4's read-only scope.
- **Specs added:** 2 tests (all 4 fields render with values; dashes/absent-notes when the source
  fields are absent). All 4 pre-existing tests unmodified and still pass.
- No BE, no new features, no `/production`, no other routes touched. List page (`contracts-list.page.ts`)
  deliberately left unchanged — thin master list is the intended pattern per the page's own docs,
  detail is where full record data belongs.
- Files: `contract-detail.page.ts`, `contract-detail.page.spec.ts`, `contract-status.ts`,
  `docs/audits/2026-09-09-nx-ux-contracts-audit.md` (created), `docs/pages/contracts.page.md`
  (UX note), `docs/agent-checklists/WAVE-NX-UX-PAGE-SWEEP.md` (row 14 DONE), this checklist,
  `tasks/_active/` marker (created → archived).

## Review handoff

- [x] Review не требуется по TZ explicit gate; gates зелёные, diff review выполнен вручную перед archive.

## Closeout (после PASS)

- [x] archive + progress + удалить `_active`
- Status = DONE
- closed_at: 2026-09-09T19:30:00Z
