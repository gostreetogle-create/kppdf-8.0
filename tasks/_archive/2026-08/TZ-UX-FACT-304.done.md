# TZ-UX-FACT-304 — Material-detail passport FactStack

**Outcome:** DONE
**Wave:** SHOP-NORTH-B #6
**Executor:** Buffy / agent-119d7cbf7

## Delivered

- Replaced the material-detail dense `dl` passport with shared `PiFactStack`/`PiFactCard` facts for identity, category, unit, material kind, profile, standard, grade, weight, and dimensions.
- Added the material price FactCard with the required short procurement/accounting caption.
- Preserved the existing dimensions table, stock link, and read-only where-used API section.
- Updated the adoption audit: `material-detail` is **ADOPTED**; A+ chrome remains the follow-up TZ-CATALOG-337.
- No dimensions-normalize utility existed in the materials zone, so it was intentionally not bundled.
- No desktop, orders, supply, products.page, BOM, or composition code was touched.

## Verification

- Frontend typecheck: PASS (exit 0).
- Material-detail Jest: PASS (6/6, exit 0).
- Targeted ESLint: PASS (exit 0).
- `git diff --check`: PASS.
- Prettier check reports the repository's pre-existing CRLF versus configured LF line-ending mismatch; no ESLint style errors.

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-08T14:56:30Z
closed_by: Buffy
verification:
  - acceptance criteria: PASS
  - typecheck: PASS
  - tests: PASS
  - lint: PASS
  - checklist: UPDATED
  - adoption audit: UPDATED
  - progress.md: UPDATED
  - scope review: PASS
  - status synchronization: DEFERRED (user-specified commit scope excludes STATUS.md; OrchestratorKit verify-status has 72 pre-existing historical forward-link failures)
lock: .mimocode/locks/TZ-UX-FACT-304-material-detail-factstack.lock
next: TZ-CATALOG-337 after this archive is committed.
