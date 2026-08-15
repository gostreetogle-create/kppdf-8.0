# TZ-FRONTEND-302-A2 checklist

- [x] Canonical amendment verified at `6cb978a2484af108b891a87793247c76dc60329e`.
- [x] A1 pushed before A2.
- [x] Exact A2 keys claimed through Team Room.
- [x] Baseline recorded: no pre-existing order-form spec; focused characterization spec added.
- [x] Existing Users entity service verified for the existing `/users` lookup; no new shared method or endpoint required.
- [x] Characterization coverage: owner lookup and submit pending guard, 2/2 PASS.
- [x] Raw HttpClient removed without behavior change.
- [x] Frontend tsc PASS: `pnpm exec tsc -p tsconfig.app.json --noEmit`.
- [x] Focused Jest PASS: A2 spec 2/2.
- [x] Changed-file ESLint PASS: 2 exact files, 0 errors/warnings.
- [x] architecture:check PASS: 936 files, baseline 6.
- [x] git diff --check PASS.
- [ ] Browser smoke: authenticated order dialog unavailable in this headless worktree; lookup and pending-submit behavior are characterized in the focused spec.
- [x] Implementation commit: `003da5f0`.
- [ ] Push SHA: pending.

## Implementation evidence

`OrderFormDialogComponent` now uses the existing `Users.inject()` entity service for the same `/users?limit=100` lookup. The endpoint, query semantics, loading/error fallback, order payload, and submit guard remain unchanged. No shared service key was added and no business/RBAC/UI behavior changed.
