# TZ-FRONTEND-301 checklist

> Status: READY
> Product code: forbidden (audit only)
> Lane: A coordinator — pages/** + canonical merge

## Claim

- [ ] Workspace/branch/HEAD recorded.
- [ ] Claim slot + active marker before audit.
- [ ] `_NOW` and active conflict keys checked.

## Baseline

- [ ] Frontend tsc/lint recorded.
- [ ] Custom ESLint rule specs recorded.
- [ ] Architecture-check recorded.

## Audit integrity

- [ ] All frontend source zones inventoried.
- [ ] Lane A pages report pushed.
- [ ] Lane B platform report imported by full SHA.
- [ ] Findings manually verified; false positives separated.
- [ ] P0/P1/P2/P3 severity applied.
- [ ] Container/presentational candidates have `extract|keep` rationale.
- [ ] Every remediation batch has exact files, tests and browser scenario.
- [ ] Every batch assigned `lane: A|B`; no overlapping conflict keys.
- [ ] No Angular 22-only API/new dependency recommended.

## Closeout

- [ ] Audit report created.
- [ ] Executor report ≤15 lines.
- [ ] Cursor/PO PASS.
- [ ] Archive/lock/progress/commit/push; deploy НЕ.
