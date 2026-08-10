# TZ-DICT-318 — DONE

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-10
closed_by: Buffy / continuous executor
workspace: `D:\kppdf-8.0` (executed in the host-managed Freebuff worktree)

## Scope

The color-reference dialog now has a digit-only RAL code field with a visual `RAL` prefix, optional title, and automatic name composition. Existing RAL names parse back into code/title during edit; non-RAL names retain the legacy name field. The unused plural dialog twin was removed after confirming there were no imports.

## Acceptance evidence

- `9003` + `Сигнальный белый` submits `name: "RAL 9003 — Сигнальный белый"`; without title it submits `RAL 9003`.
- Existing `RAL 9010 — Белый` initializes code `9010` and title `Белый`.
- Non-RAL `name` stays in the legacy control and does not get rewritten.
- RU hint explicitly says the RAL prefix is automatic; code input sanitizes non-digits.
- `color-references-form-dialog.component.ts` had zero imports and was deleted; active page import remains singular.

## Gates

- acceptance criteria: PASS by focused dialog/page tests and build
- frontend typecheck: PASS
- focused Jest: PASS (2 suites, 21/21)
- frontend development build: PASS
- ESLint: PASS
- `git diff --check`: PASS
- dead-twin import grep: PASS
- Prettier: documented repository CRLF baseline difference; commit hook formats staged TS
- live browser smoke: NOT RUN; backend/data were unavailable in the isolated session
- deploy: NO (`deploy.ps1` not run)

## Files

- `frontend/src/app/pages/dictionaries/color-reference-form-dialog.component.ts`
- `frontend/src/app/pages/dictionaries/color-reference-form-dialog.component.spec.ts`
- `frontend/src/app/pages/dictionaries/color-references.page.ts`
- `docs/pages/color-references.page.md`
- `docs/agent-checklists/TZ-DICT-318.md`
- `docs/agent-checklists/_active-map.md`
- `.mimocode/locks/TZ-DICT-318-ral-auto-prefix.lock`
