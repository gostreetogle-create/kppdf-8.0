# TZ-NX-HAIRLINE-EDGE-UTILS — DONE

- **Status:** DONE
- **Agent:** freebuff
- **Closed:** 2026-09-15

## Delivered

- Added real `hairline-top` and `hairline-bottom` Paper & Ink utilities.
- Both use 1px solid longhands with `var(--color-rule)`; existing short utilities and full `hairline` semantics remain unchanged.
- Existing consumers now receive the intended bottom edge without consumer churn; grep found 30 `hairline-bottom` matches including the definition.

## Gates

- Frontend app typecheck: PASS.
- `nx lint paper-and-ink`: PASS, 0 errors / 41 existing warnings.
- Final `pnpm exec nx build kppdf-web`: PASS, exit 0; last code gate.

## Scope disclosure

Only `global.css`, checklist, archive, and lock belong to this TZ. Dark Theme Pro, WAVE-GANTT-DARK, Gantt, order-workspace, and foreign WIP paths were excluded.

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-09-15
closed_by: freebuff
verification:
  - acceptance criteria: PASS
  - typecheck: PASS
  - tests: N/A (CSS utility smoke via grep/build)
  - lint: PASS (warnings only)
  - build: PASS
  - checklist: ADDED and completed
  - progress.md: N/A (live state in _NOW)
  - status synchronization: PASS
