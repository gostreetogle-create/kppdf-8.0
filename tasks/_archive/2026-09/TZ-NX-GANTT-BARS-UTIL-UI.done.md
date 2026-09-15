# TZ-NX-GANTT-BARS-UTIL-UI: util + first dumb slices (in-place / features prep)

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-09-15
closed_by: claude
verification:
  - acceptance criteria: PASS (3/3, verification-only, no code change)
  - typecheck: PASS
  - tests: PASS (kppdf-web full run 117/117 suites, 840/847, 7 skipped, 0 failed)
  - nx build kppdf-web: PASS (last gate, exit 0, cache-hit)
  - checklist: docs/agent-checklists/TZ-NX-GANTT-BARS-UTIL-UI.md
  - commit: (docs-only, this archive commit)
  - status synchronization: PASS (tracker + _NOW.md updated)

## Root cause

Successor to A1 (`TZ-NX-GANTT-BARS-FACADE`), meant to fold any pure helpers
still duplicated between `gantt-bar.model.ts` and the newly-split
`gantt-bars.facade.ts`/`gantt-bars.constants.ts`, and optionally extract small
dumb presentational pieces — without forcing a deep bar-layer split.

## Fix

Verification, not code: compared `gantt-bar.model.ts` against
`gantt-bars.constants.ts` — no duplicated exports (complementary concerns:
estimate/tree model vs. px/layout/drag-snap constants + Commit DTOs).
`production-scale-controls.component.ts` already exists as the "already
separate" dumb toolbar the TZ names. The remaining candidate — the
unassigned-work banner fragment — was deliberately PARKed: single-use,
tightly coupled to facade state, no reuse site, and extracting it does not
reduce meaningful complexity. Deep bar-layer (row/timeline) split stays out
of scope per the TZ's own hard rule.

No product files changed in this TZ.

## Files changed

- `docs/agent-checklists/TZ-NX-GANTT-BARS-UTIL-UI.md` (new, verification record)

## Successor

`TZ-NX-PRODUCTION-COCKPIT-FACADE` (A3).
