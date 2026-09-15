# TZ-NX-COMPOSITION-TREE-TOGGLE-HIT — DONE

- **Status:** DONE
- **Agent:** freebuff
- **Closed:** 2026-09-15

## Delivered

- Composition tree expansion now toggles open/closed from the current state, including when `selectedId=null`.
- Tree rows retain a 44px-class hit target and use a `w-9 h-9` chevron zone; name/kind clicks share the row toggle.
- Order workspace product line chevron and title are one expansion hit target; quantity and ready controls remain separate.
- No BOM/API or catalog write behavior changed.

## Gates

- Focused composition tree and order workspace specs: **7/7 PASS**.
- Frontend app typecheck: PASS.
- Final `pnpm exec nx build kppdf-web`: PASS, exit 0; last code gate.
- Features lint: baseline FAIL from existing boundary errors/warnings.

## Scope disclosure

Only composition tree, order workspace composition UI/spec, checklist, archive, and lock belong to this TZ. Module, dark-theme, Gantt, and foreign WIP paths were excluded.

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-09-15
closed_by: freebuff
verification:
  - acceptance criteria: PASS
  - typecheck: PASS
  - tests: PASS
  - lint: BASELINE_FAIL
  - build: PASS
  - checklist: ADDED and completed
  - progress.md: N/A (live state in _NOW)
  - status synchronization: PASS
