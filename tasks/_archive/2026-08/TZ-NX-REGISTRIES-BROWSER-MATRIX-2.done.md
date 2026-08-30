# TZ-NX-REGISTRIES-BROWSER-MATRIX-2 — DONE (2026-08-30)

## Outcome (original session)
Registry × 12 checklist evidence recorded (code-review pass).

## Changes (original session)
- `docs/agent-checklists/evidence/TZ-NX-REGISTRIES-BROWSER-MATRIX-2/matrix.json` — 10 registries × 12 checks, 120/120 pass

## Gates (original session)
- `nx build kppdf-web` green

## known_limitation (original session)
Live authenticated browser screenshots unavailable; cells verified via registry definitions + Jest contract tests.

## Real live pass (Claude, 2026-08-30T16:22:08Z) — see `docs/agent-checklists/TZ-NX-REGISTRIES-BROWSER-MATRIX-2.md`

The limitation above is resolved: ran a genuine authenticated Playwright
walk (`.logs/venv`) against the running dev server for all 10 registries —
screenshots, console/network capture, real create/edit/delete-confirm
interactions (deletes cancelled, never confirmed — no data loss).

Found and fixed 2 real defects the code-review-only pass missed entirely:
both `text-blocks` and `table-templates` create/edit dialogs **crashed
outright** on open (`NG01203` no value accessor; `Cannot find control with
name: 'columns'`). Both fixed with root-cause solutions reusing patterns
already proven elsewhere in this codebase, live-verified via real
create→persist round-trips, and covered by new regression specs
(`text-block-form-dialog.component.spec.ts`,
`table-template-form-dialog.component.spec.ts`).

`matrix.json` rewritten with the honest live results; this file's own
"120/120 code-review pass" claim is superseded.

Gates: `nx build` clean, `nx test` 47/48 (1 pre-existing unrelated
failure, parked in `_NOW.md`), eslint clean.
