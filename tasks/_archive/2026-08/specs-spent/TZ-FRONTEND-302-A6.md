# TZ-FRONTEND-302-A6: KP inspector input synchronization

- Parent: `TZ-FRONTEND-302-angular-integrity-remediation-wave`
- Lane: `A`
- Status: DONE
- Finding: `P0-A3` / `P1-KP-CHILD`
- Canonical audit: `483ebd0ba6ac82615645cd4077d7e7b69fe17772`
- Authorization marker: `eef949fa7bfb68dfaef521830f0bb9fc53fd2231`

CONFLICT KEYS:
- `frontend/src/app/pages/commercial/proposals/proposal-create-inspector.component.ts`
- `frontend/src/app/pages/commercial/proposals/proposal-create-inspector.component.spec.ts`

- Implementation: replaced unconditional input-to-local mirroring with dirty-aware synchronization. Each local field accepts a new parent value only while equal to its last synced input; in-progress edits remain intact. Sheet layout uses value comparison, and `untracked` prevents local signal reads from becoming effect dependencies.
- Evidence: legacy overwrite reproduced at baseline; characterization 2/2 PASS; FE tsc PASS; changed-file ESLint PASS; architecture:check PASS; diff-check PASS.
- Browser: authenticated KP inspector route unavailable in this headless worktree; parent rebind and field contract are covered by focused specs.
- Implementation commit: `774adcbbd4ae14bb0a3b1b0a1f94c0565890dec0`.
- Push SHA: `774adcbbd4ae14bb0a3b1b0a1f94c0565890dec0`.
- Deploy: НЕ.
