# TZ-NX-UX-16-admin-devices checklist (AUDIT + FIX)

> Status: **DONE**
> Marker: `tasks/_active/` (removed after archive)
> Commit/push: по `docs/GIT-POLICY.md`

## Claim slot (ОБЯЗАТЕЛЬНО до кода)

- agent_id: claude
- claimed_at: 2026-09-09T19:44:00Z
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (no Team Room CLI in this session)

## Preflight

- [x] Get-Location + git rev-parse --show-toplevel → оба `D:\kppdf-8.0`
- [x] Прочитал `_NOW.md` + `tasks/_active/` — нет чужого CLAIM
- [x] `admin-devices.page.ts`, `AdminDevice` type, `admin-devices.page.md` read in full
- [x] Claim slot заполнен; Status = CLAIMED / IN PROGRESS → DONE

### Preflight Check Output
- **Context read:** page source; `pi-device-enrollment.service.ts` (`AdminDevice` type, found
  `inviteKind` unrendered); `admin-devices.page.md` (confirmed owner sees both device kinds mixed,
  BE filters owner-devices for regular admins)
- **Key Constraints:** single-file conflict key (`admin-devices.page.ts` only, dialogs out of
  scope); no BE changes; zero-BE-change fix (field already returned)
- **Planned Deliverable:** `inviteKind` column + 3× underline→`.pi-outline-btn`
- **Validation Path:** focused `nx test kppdf-web --testPathPattern=admin-devices`; `nx build kppdf-web`

## Acceptance

- [x] Audit file `docs/audits/2026-09-09-nx-ux-admin-devices-audit.md` — verdict PASS-FIX (1xP1 T1, 1xP2 A1).
- [x] P1 (T1): `inviteKind` column added.
- [x] P2 (A1): 3 row actions converted to `.pi-outline-btn` / `.pi-outline-btn-destructive`.
- [x] `nx build kppdf-web` PASS.
- [x] Focused + full test run PASS, 0 regressions.
- [x] WAVE row 16 updated; page.md UX note + `cols` table updated.

## Integrity slot (до READY / archive)

- [x] Тип изменения определён: page (frontend-nx UI, same route, additive read-only column + style
      conversion, no new permission/module/MCP)
- [x] FIC §A–E: N/A — no new page/permission/module/MCP, existing route extended in place
- [x] page.md / PAGE-TZ-INDEX: `docs/pages/admin-devices.page.md` — `cols` table + NX UX sweep
      note added
- [x] DOMAIN-MAP: N/A (no route/module contour change)
- [x] SECTION-READINESS: N/A
- [x] Чужой WIP не в коммите; conflict keys соблюдены (single file `admin-devices.page.ts` +
      new spec + audit file + page.md + WAVE row 16)
- [x] Coupling map: N/A (pure UI read + style class swap, no shared status/FK field touched)
- [x] Канон: docs/DOCS-INTEGRITY.md — соблюдён

## Gates (факт)

```
cd frontend-nx && pnpm exec nx test kppdf-web --testPathPattern=admin-devices → PASS 104/104 suites, 700/707 (7 skipped), 0 regressions (+3 new tests, new suite)
cd frontend-nx && pnpm exec nx build kppdf-web → PASS (exit 0, same 2 pre-existing unrelated warnings)
```

## Executor report

- **T1 (P1) fixed:** added `inviteKind` `ColumnDef` (Обычное/Владельца) right after the device
  name — zero BE change, field already returned by `listDevices()`. Fixes a real gap: the owner is
  the one viewer who sees both device kinds mixed in one list per the page's own docs, with no
  prior way to tell them apart.
- **A1 (P2) fixed, all 3 sites:** «Изменить роль»/«Изменить срок» → `.pi-outline-btn`; «Отключить»
  → `.pi-outline-btn .pi-outline-btn-destructive` (semantic danger tone).
- **Test coverage gap closed:** this page had zero spec file before this TZ. Added a focused
  `admin-devices.page.spec.ts` (3 tests: inviteKind column renders both values; revoke
  confirm→POST→toast; revoke cancel→no POST) — not exhaustive, scoped to the changed/core
  behavior, consistent with a UX-chrome TZ rather than a dedicated test-authoring task.
- No BE, no new features, no `/production`, no other routes touched. Dialogs
  (`DeviceRoleDialogComponent` etc.) correctly left untouched — outside this TZ's single-file
  conflict key.
- Files: `admin-devices.page.ts`, `admin-devices.page.spec.ts` (new),
  `docs/audits/2026-09-09-nx-ux-admin-devices-audit.md` (created), `docs/pages/admin-devices.page.md`
  (cols table + UX note), `docs/agent-checklists/WAVE-NX-UX-PAGE-SWEEP.md` (row 16 DONE), this
  checklist, `tasks/_active/` marker (created → archived).

## Review handoff

- [x] Review не требуется по TZ explicit gate; gates зелёные, diff review выполнен вручную перед archive.

## Closeout (после PASS)

- [x] archive + progress + удалить `_active`
- Status = DONE
- closed_at: 2026-09-09T19:52:00Z
