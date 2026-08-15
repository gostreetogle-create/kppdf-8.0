# TZ-FRONTEND-302-A4 checklist

- [x] Canonical amendment verified.
- [x] A1–A3 pushed before A4.
- [x] Exact A4 keys claimed through Team Room.
- [x] Baseline proposal-create focused spec: 45/45 PASS.
- [x] Characterization spec: stale draft 404 → remove pointer → exactly one create retry, 1/1 PASS.
- [x] Nested subscribe replaced with flat `switchMap`/`of` composition.
- [x] F5/autosave/read-only/loading/error behavior preserved by existing 45-test suite and characterization.
- [x] Frontend tsc PASS: `pnpm exec tsc -p tsconfig.app.json --noEmit`.
- [x] Focused Jest PASS: 46/46 across existing + characterization suites.
- [x] Changed-file ESLint PASS: page and characterization spec, 0 errors/warnings.
- [x] architecture:check PASS: 937 files, baseline 6.
- [x] git diff --check PASS.
- [ ] Browser smoke: authenticated KP studio unavailable in this headless worktree; existing specs cover autosave, preview, read-only, loading/error, and keyboard shell behavior.
- [x] Implementation commit: `a6ee078f`.
- [x] Pushed branch SHA: `a6ee078f8efa85fcd18f0a3751dff2b45ba2b447`.

## Exact keys

1. `frontend/src/app/pages/commercial/proposals/proposal-create.page.ts`
2. `frontend/src/app/pages/commercial/proposals/proposal-create.page.spec.ts`
3. `frontend/src/app/pages/commercial/proposals/proposal-create.autosave.spec.ts`
