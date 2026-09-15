# TZ-NX-SUPPLY-PAGES-RESIDUAL-THIN — DONE

- **Status:** DONE
- **Agent:** claude
- **Closed:** 2026-09-15

## Delivered

- `supply.page.ts`: 434 → 367 LOC. Extracted the inline create-form (explode-from-order + manual create) into new `SupplyCreateFormComponent` (`libs/features/src/lib/supply/ui/`), exported via `ui/index.ts`. Value-flow through `SupplyFacade`'s plain (non-signal) create/explode fields preserved via explicit change events instead of `[(ngModel)]`.
- `supply-requests.page.ts`: investigated, left unchanged — create/edit/receive already delegate to existing feature-lib dialog components; remaining markup is genuine table/expand-row UI, not misplaced logic.
- No status/transition rule changes.

## Scope guard

- No `supply.facade.ts` / `supply-requests.facade.ts` logic changes.
- Conflict keys respected: `supply.page.ts`, `supply-requests.page.ts` (untouched), `libs/features/src/lib/supply/**`.

## Gates

- `nx test kppdf-web`: PASS for `supply.page.spec.ts` + `supply-requests.page.spec.ts`. Same 2 unrelated pre-existing `app-shell.component.spec.ts` failures as the prior TZ this session (nav chip count drift, unrelated).
- `nx lint kppdf-web` + `nx lint features`: baseline FAIL (pre-existing); zero new issues from this TZ's files.
- Final `nx build kppdf-web`: PASS.

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-09-15
closed_by: claude
verification:
  - acceptance criteria: PASS
  - typecheck: PASS
  - tests: PASS
  - lint: BASELINE FAIL (pre-existing)
  - checklist: ADDED
  - progress.md: N/A (refactor-only)
  - status synchronization: PASS
