# TZ-FRONTEND-301-B checklist — platform/shared audit lane

> Status: READY
> Product code: forbidden (audit only)
> Scope: shared/core/layout/root app/tooling; pages/** forbidden

## Claim

- [ ] Isolated workspace/branch/HEAD recorded.
- [ ] Lane B marker + Claim slot.
- [ ] No parallel writer for platform lane report.

## Baseline / inventory

- [ ] Frontend tsc/lint/custom-rule specs/architecture-check recorded.
- [ ] shared/core/layout/root app/tooling fully inventoried.
- [ ] Findings manually verified with P0/P1/P2/P3.
- [ ] Shared components have container/presentational `extract|keep` rationale.
- [ ] Batches have exact files/tests/browser scenario and `lane: B`.

## Handoff

- [ ] `docs/audits/2026-08-15-angular-component-integrity-platform.md` created.
- [ ] Report-only commit pushed; full SHA sent to Lane A/Team Room.
- [ ] No canonical audit, `_NOW`, product code, deploy or archive touched.
