# TZ-NX-UX-15-studio-list checklist (AUDIT + FIX)

> Status: **DONE**
> Marker: `tasks/_active/` (removed after archive)
> Commit/push: по `docs/GIT-POLICY.md`

## Claim slot (ОБЯЗАТЕЛЬНО до кода)

- agent_id: claude
- claimed_at: 2026-09-09T19:32:00Z
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (no Team Room CLI in this session)

## Preflight

- [x] Get-Location + git rev-parse --show-toplevel → оба `D:\kppdf-8.0`
- [x] Прочитал `_NOW.md` + `tasks/_active/` — нет чужого CLAIM
- [x] `studio-list.page.ts`, `studio-templates-list.page.ts`, `StudioDocument`/`DocumentTemplate`
      types, `global.css` (`.pi-icon-btn` real definition) read; A4 editor **not** opened
- [x] Claim slot заполнен; Status = CLAIMED / IN PROGRESS → DONE

### Preflight Check Output
- **Context read:** both in-scope pages; `08b`'s audit (confirmed `pi-icon-button` as the flagged
  second dead-class family); `registry-action-icons.ts` (gold `.pi-icon-btn` usage pattern)
- **Key Constraints:** conflict-key glob is `studio-*.page.ts` only — A4 editor and
  `.component.ts` dialogs explicitly out; no BE changes; no new dependencies (kept literal `×`
  glyph instead of adopting lucide-angular icons)
- **Planned Deliverable:** RU status label on `/studio` rows; `pi-icon-button` → `.pi-icon-btn
  .pi-icon-btn-danger` on both in-scope files
- **Validation Path:** focused `nx test kppdf-web --testPathPattern=studio-list`; `nx build kppdf-web`

## Acceptance

- [x] Audit file `docs/audits/2026-09-09-nx-ux-studio-list-audit.md` — verdict PASS-FIX (1xP1 C1, 1xP2 A1).
- [x] P1 (C1): raw English status replaced with RU label.
- [x] P2 (A1): `pi-icon-button` → `.pi-icon-btn .pi-icon-btn-danger` on both in-scope files.
- [x] `nx build kppdf-web` PASS.
- [x] Focused + full test run PASS, 0 regressions.
- [x] WAVE row 15 updated; page.md UX note added (scoped, editor not touched).

## Integrity slot (до READY / archive)

- [x] Тип изменения определён: page (frontend-nx UI, same routes, label-map + class-swap only, no
      new permission/module/MCP, A4 editor untouched)
- [x] FIC §A–E: N/A — no new page/permission/module/MCP, existing routes fixed in place
- [x] page.md / PAGE-TZ-INDEX: `docs/pages/document-studio.page.md` — NX UX sweep note added,
      scoped explicitly to list/templates, editor noted as untouched
- [x] DOMAIN-MAP: N/A (no route/module contour change)
- [x] SECTION-READINESS: N/A
- [x] Чужой WIP не в коммите; conflict keys соблюдены strictly (`studio-*.page.ts` glob only —
      `studio-template-picker-dialog.component.ts`'s own `pi-icon-button` explicitly NOT touched,
      flagged instead)
- [x] Coupling map: N/A (pure UI label/class fix, no shared status/FK field touched)
- [x] Канон: docs/DOCS-INTEGRITY.md — соблюдён

## Gates (факт)

```
cd frontend-nx && pnpm exec nx test kppdf-web --testPathPattern=studio-list --testPathPattern=studio-templates-list → PASS 2/2 suites, 14/14
cd frontend-nx && pnpm exec nx test kppdf-web (full) → PASS 103/103 suites, 697/704 (7 skipped), 0 regressions (+1 new test)
cd frontend-nx && pnpm exec nx build kppdf-web → PASS (exit 0, same 2 pre-existing unrelated warnings)
```

## Executor report

- **P1 (C1) fixed:** added `STUDIO_DOCUMENT_STATUS_LABELS` + `documentStatusLabel()` to
  `studio-list.page.ts` — row subtitle now shows «Черновик»/«Заморожен»/«В архиве» instead of the
  raw `draft`/`frozen`/`final` values that were leaking straight into the UI.
- **P2 (A1) fixed, both in-scope sites:** `studio-list.page.ts` and `studio-templates-list.page.ts`
  delete buttons converted from the dead `pi-icon-button` class to the real `.pi-icon-btn
  .pi-icon-btn-danger .pi-focus-ring`. Kept the literal `×` glyph (no new lucide-angular
  dependency) — `.pi-icon-btn` supports plain text content, not SVG-only.
- **Out-of-scope finding flagged, not touched:** a third `pi-icon-button` site in
  `studio-template-picker-dialog.component.ts` doesn't match this TZ's `studio-*.page.ts` glob —
  documented in the audit for a future wave/PO decision, same disposition `08b` used.
- **Specs added:** 1 test confirming the RU label renders and the raw English value does not.
- No BE, no new features, no `/production`, no other routes touched, **A4 editor
  (`studio-editor.page.ts` and everything under it) was never opened**.
- Files: `studio-list.page.ts`, `studio-list.page.spec.ts`, `studio-templates-list.page.ts`,
  `docs/audits/2026-09-09-nx-ux-studio-list-audit.md` (created),
  `docs/pages/document-studio.page.md` (UX note), `docs/agent-checklists/WAVE-NX-UX-PAGE-SWEEP.md`
  (row 15 DONE), this checklist, `tasks/_active/` marker (created → archived).

## Review handoff

- [x] Review не требуется по TZ explicit gate; gates зелёные, diff review выполнен вручную перед archive.

## Closeout (после PASS)

- [x] archive + progress + удалить `_active`
- Status = DONE
- closed_at: 2026-09-09T19:42:00Z
