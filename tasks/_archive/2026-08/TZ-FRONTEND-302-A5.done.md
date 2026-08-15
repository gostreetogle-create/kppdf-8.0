# TZ-FRONTEND-302-A5 DONE

- Lane: A
- Parent: TZ-FRONTEND-302
- Canonical: `483ebd0ba6ac82615645cd4077d7e7b69fe17772`
- Exact keys: recipient component and focused recipient component spec.

## Evidence

- No pre-existing focused recipient spec; added characterization coverage.
- Site lookup reacts to the counterparty input through a teardown-safe stream.
- `stateChange` output contract preserved.
- Focused Jest: 2/2 PASS.
- Frontend tsc: PASS.
- Changed-file ESLint: PASS.
- Architecture check: PASS, 937 files, baseline 6.
- `git diff --check`: PASS.
- Browser: authenticated recipient route unavailable in headless worktree; lookup/output contract covered by focused tests.

Implementation: subscribe inside effect replaced with `toObservable`/`switchMap`/`takeUntilDestroyed`; no page state lift or UI contract change. Deploy: НЕ.
