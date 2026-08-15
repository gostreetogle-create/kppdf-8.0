# TZ-FRONTEND-302-A4 DONE

- Lane: A
- Parent: TZ-FRONTEND-302
- Canonical: `483ebd0ba6ac82615645cd4077d7e7b69fe17772`
- Exact keys: proposal-create page, existing page spec, and focused autosave characterization spec.

## Evidence

- Baseline existing proposal-create spec: 45/45 PASS.
- Characterization: stale draft 404 removes local pointer and performs exactly one create retry, 1/1 PASS.
- Combined focused Jest: 46/46 PASS.
- Frontend tsc: PASS.
- Changed-file ESLint: PASS.
- Architecture check: PASS, 937 files, baseline 6.
- `git diff --check`: PASS.
- Browser: authenticated KP studio unavailable in headless worktree; focused suites cover autosave, preview, read-only, loading/error and shell behavior.

Implementation: `persist(draftId)` now uses flat `switchMap`/`of`; no endpoint, payload, storage key, autosave flag, or UI behavior changed. Deploy: НЕ.
