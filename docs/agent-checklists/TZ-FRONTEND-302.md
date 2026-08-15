# TZ-FRONTEND-302 checklist

> Status: BLOCKED BY TZ-FRONTEND-301 PASS
> Product edits: child batch with exact conflict keys only

## Preflight

- [ ] 301 archive + approved audit exist.
- [ ] P0/P1 batch order copied from audit.
- [ ] No wildcard `frontend/src/**` claim.

## Batch discipline

- [ ] Each batch has child marker/checklist and ≤8 related files/one page boundary.
- [ ] Baseline/characterization tests PASS before refactor.
- [ ] No business/API/RBAC behavior added.
- [ ] Container/presentational boundary has explicit state owner and contract test.
- [ ] Focused tsc/Jest/ESLint/architecture/diff/browser gates PASS.
- [ ] Separate commit/push/evidence per batch.

## Final

- [ ] P0/P1 FIXED or explicit BLOCKED successor.
- [ ] Approved P2 resolved; P3 churn omitted.
- [ ] Full frontend tsc/lint/Jest + architecture-check PASS.
- [ ] No dependency/version/baseline change.
- [ ] Audit verdicts and full SHAs updated.
- [ ] Cursor/PO PASS.
- [ ] Children + umbrella archived/locked; deploy НЕ.
