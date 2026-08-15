# TZ-FRONTEND-302-A6 checklist

- [x] Canonical amendment/auth marker verified: `eef949fa7bfb68dfaef521830f0bb9fc53fd2231`.
- [x] A5 pushed before A6.
- [x] Exact A6 keys claimed through Team Room.
- [x] Baseline recorded: legacy characterization reproduced the overwrite (`1 failed / 1 passed`).
- [x] Characterization: local `draft-edit` survives parent `server-2`; clean field accepts parent update, `2/2 PASS`.
- [x] Input synchronization changed to dirty-aware parent rebind handling with `untracked` local-state reads.
- [x] Read-only/field/keyboard behavior and public input/output contract preserved; no page/API/RBAC change.
- [x] Frontend tsc PASS.
- [x] Focused Jest PASS: 2/2.
- [x] Changed-file ESLint PASS: 2 exact files, 0 errors/warnings.
- [x] architecture:check PASS: 937 files, baseline 6.
- [x] git diff --check PASS.
- [ ] Browser smoke: authenticated KP inspector route unavailable in this headless worktree; field/rebind contract is covered by focused specs.
- [x] Implementation commit: `774adcbbd4ae14bb0a3b1b0a1f94c0565890dec0`.
- [x] Pushed branch SHA: `774adcbbd4ae14bb0a3b1b0a1f94c0565890dec0`.
