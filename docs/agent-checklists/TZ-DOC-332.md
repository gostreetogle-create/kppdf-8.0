# TZ-DOC-332 — Builder Inspector IA + visual canon

## Pre-edit checklist

- **Status:** DONE
- **Task/spec:** `tasks/_archive/2026-08/TZ-DOC-332-builder-inspector-ia-visual-canon.done.md`
- **Created before first code edit:** yes (2026-08-02)
- **Out of scope respected:** canvas / block-renderer / tool-pane structure / backend / DOC-336

## Conflict-key audit

No peer `_active` overlap on inspector keys.

## Gates

- [x] `pnpm exec tsc -p tsconfig.app.json --noEmit` — PASS
- [x] jest `builder-inspector` --no-coverage — PASS (11)
- [x] `git diff --check` — PASS (CRLF warnings only)

## Manual AC

- [ ] canvas click → document context + snap (PO browser)
- [ ] block click → geometry first (PO browser)
- [ ] multi 2 → group/layer/danger (PO browser)
- [ ] template props → style + background (PO browser)

## Executor report (auto)

- status: DONE
- outcome: inspector one chrome + modes A–D; pi-switch snap/pageNumbering; geometry first; Edit≠Delete
- commit: `6c620d337116bded4a58df669946eff2ebf6a824`
- evidence: archive + this checklist; jest 11 green; tsc green
- residual: full browser smoke for PO; shared pane CSS extract = successor; ng build not in this closeout
