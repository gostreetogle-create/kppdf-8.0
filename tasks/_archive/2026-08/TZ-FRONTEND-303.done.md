# TZ-FRONTEND-303 DONE

ARCHIVE_MARKER
task_id: TZ-FRONTEND-303
outcome: DONE
closed_at: 2026-08-15T00:00:00Z
closed_by: Gemini
implementation_sha: 8b60d1f0998b70caa28a1bbe9760c3eec8a8a878
deploy: НЕ

## Outcome

- Repaired four legacy frontend Jest specs without changing product/service implementation.
- Materials TestBeds now provide the canonical fallback labels locally, preventing unrelated dictionary-label HTTP requests and making the tests deterministic.
- FormProfilesService expectations now match current `LockedRequired`: product `kind/unit/sku`; module `name/article`.
- Baseline debt closed: 13 previously failing tests are green.

## Verification

- acceptance criteria: PASS
- focused Jest: PASS — 4 suites / 17 tests
- full frontend Jest: PASS — 154 suites / 1444 tests
- frontend typecheck: PASS
- changed-file ESLint: PASS
- architecture:check: PASS — 937 files; baseline 6
- git diff --check: PASS
- checklist: ADDED
- progress.md: UPDATED
- status synchronization: PASS
- deploy: НЕ

Known non-failing Angular/JSDOM console diagnostics remain in unrelated legacy suites; no new failing tests were introduced.
