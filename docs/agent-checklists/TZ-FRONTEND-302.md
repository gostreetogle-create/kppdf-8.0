# TZ-FRONTEND-302 checklist

> Status: STAGE 2 child batches DONE; final closeout pending Cursor/PO review
> Product edits: child batch with exact conflict keys only

## Preflight

- [x] 301 archive + approved audit exist.
- [x] P0/P1 batch order copied from audit.
- [x] No wildcard `frontend/src/**` claim.

## Batch discipline

- [x] Each batch has child marker/checklist and ≤8 related files/one page boundary.
- [x] Baseline/characterization tests PASS before refactor.
- [x] No business/API/RBAC behavior added.
- [x] Container/presentational boundary has explicit state owner and contract coverage.
- [x] Focused tsc/Jest/ESLint/architecture/diff gates PASS for A1–A6 and B ready batches.
- [ ] Browser smoke: authenticated routes unavailable in the headless worktrees; focused loading/error/empty/success, keyboard/pending, autosave, read-only, and rebind contracts are recorded in child evidence.
- [x] Separate commit/push/evidence per child batch.

## Final

- [x] P0/P1 FIXED or explicit BACKLOG successor: A1–A6 and B-TOOLING/B-ENTITY-SPEC/B-PHOTO are DONE; cross-domain successors remain documented.
- [x] Approved P2 resolved; P3 style-only churn omitted.
- [x] Frontend tsc PASS; frontend lint PASS; architecture-check PASS; git diff --check PASS.
- [x] Full Jest recorded: `150/154` suites PASS, `1427/1440` tests PASS; 13 known baseline failures documented in the canonical audit.
- [x] No dependency/version/baseline change.
- [x] Audit verdicts and full child SHAs updated.
- [ ] Cursor/PO PASS.
- [ ] Children + umbrella archived/locked; deploy НЕ.
