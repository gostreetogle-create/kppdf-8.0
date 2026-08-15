# TZ-FRONTEND-301 checklist

> Status: **READY FOR REVIEW** (canonical audit published — await Cursor/PO PASS)
> Product code: forbidden (audit only)
> Lane: A coordinator — pages/** + canonical merge
> Marker: `tasks/_active/TZ-FRONTEND-301.md`

## Claim slot

- agent_id: cursor-lane-a / agent-a67af91333
- claimed_at: 2026-08-15T05:20:00Z
- workspace: D:\kppdf-8.0\.worktrees\TZ-FRONTEND-301-A
- branch: feature/TZ-FRONTEND-301-A
- head_at_claim: 816689ed6c5895c0e165231ed14904d446acfb91
- team_room_claim: unavailable for formal claim (Unknown task); join + send OK

## Claim

- [x] Workspace/branch/HEAD recorded.
- [x] Claim slot + active marker before audit.
- [x] `_NOW` and active conflict keys checked.

## Baseline

- [x] Frontend tsc/lint recorded.
- [x] Custom ESLint rule specs recorded (FAIL → B-TOOLING).
- [x] Architecture-check recorded.

## Audit integrity

- [x] Lane A pages inventory complete.
- [x] Lane A pages report pushed — SHA `95106d7890dfd1b012d5ac1cf4e9dff8a3d4ecef`
- [x] Lane B platform report imported by full SHA — `7682389a551a35d1831c0dacb41dfe76089445c7`
- [x] Findings manually verified; false positives separated; deduped in canonical.
- [x] P0/P1/P2/P3 severity applied (canonical: P0=3, P1=9, P2=5, P3=4).
- [x] Container/presentational candidates have `extract|keep` rationale.
- [x] Every remediation batch has exact files, tests and browser scenario.
- [x] Every ready batch assigned `lane: A|B`; no overlapping exact conflict keys.
- [x] No Angular 22-only API/new dependency recommended.
- [x] Canonical audit: `docs/audits/2026-08-15-angular-component-integrity.md`

## Closeout

- [x] Canonical audit created.
- [x] Executor report ≤15 lines (below).
- [ ] Cursor/PO PASS.
- [ ] Archive/lock/progress after PASS; deploy НЕ.
- Stage 2 (`TZ-FRONTEND-302`) blocked until PASS.

## Executor report (auto)

- Lane A pages + Lane B platform merged by SHA.
- Ready: A1–A6, B-TOOLING, B-PHOTO, B-ENTITY-SPEC.
- Backlog STOP: composition successor, group ACL successor, P3 churn.
- Product code: unchanged. Deploy: НЕ.
