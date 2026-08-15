# TZ-FRONTEND-301 checklist

> Status: **READY FOR REVIEW** (Lane A Stage 1 — pages report)
> Product code: forbidden (audit only)
> Lane: A coordinator — pages/** + canonical merge (canonical blocked on Lane B)
> Marker: `tasks/_active/TZ-FRONTEND-301.md`

## Claim slot (ОБЯЗАТЕЛЬНО до кода)

- agent_id: cursor-lane-a / agent-a67af91333
- claimed_at: 2026-08-15T05:20:00Z
- workspace: D:\kppdf-8.0\.worktrees\TZ-FRONTEND-301-A
- branch: feature/TZ-FRONTEND-301-A
- head_at_claim: 816689ed6c5895c0e165231ed14904d446acfb91
- team_room_claim: unavailable — `claim TZ-FRONTEND-301` → Unknown task (sync tasks first); Stage 1 best-effort join OK as agent-a67af91333; root marker `tasks/_active/TZ-FRONTEND-301.md` is canonical claim

## Claim

- [x] Workspace/branch/HEAD recorded.
- [x] Claim slot + active marker before audit.
- [x] `_NOW` and active conflict keys checked.
  - Dirty main AUTH-305 WIP not in this worktree; no key overlap with Lane A docs.
  - Lane B checklist/report not edited.

## Baseline

- [x] Frontend tsc/lint recorded. — tsc PASS; lint PASS (4 raw-HTTP warnings).
- [x] Custom ESLint rule specs recorded. — FAIL under Jest+ESLint10 Linter API; live eslint enforces rules. Not fixed in 301.
- [x] Architecture-check recorded. — PASS (936 files; baseline 6).

## Audit integrity

- [x] All frontend source zones inventoried. *(Lane A: pages/** — 32 domains / 98 components)*
- [x] Lane A pages report pushed. — `docs/audits/2026-08-15-angular-component-integrity-pages.md`
- [ ] Lane B platform report imported by full SHA. *(blocked until Lane B READY)*
- [x] Findings manually verified; false positives separated.
- [x] P0/P1/P2/P3 severity applied. — P0:3 · P1:4 groups · P2:4 · P3:2
- [x] Container/presentational candidates have `extract|keep` rationale.
- [x] Every remediation batch has exact files, tests and browser scenario. — BATCH-A1…A6 (+ A7 backlog)
- [ ] Every batch assigned `lane: A|B`; no overlapping conflict keys. *(canonical only — after B)*
- [x] No Angular 22-only API/new dependency recommended.

## Closeout

- [x] Lane A audit report created.
- [x] Executor report ≤15 lines (in pages report §8).
- [ ] Cursor/PO PASS (Lane A Stage 1).
- [ ] Canonical audit after Lane B SHA.
- [ ] Archive/lock/progress; deploy НЕ.

## Gates (факт)

```
pnpm --dir frontend typecheck     → PASS 0
pnpm --dir frontend lint          → PASS 0 (4 warnings no-raw-http-in-components)
pnpm architecture:check           → PASS
jest eslint/rules/*.spec.cjs      → FAIL (ESLint 10 Linter config API; pre-existing vs live lint)
```

## Review handoff

- STOP 1: `ANGULAR AUDIT LANE A READY`
- Next: wait Lane B platform report full SHA → canonical merge by Lane A → PO PASS → Stage 2 TZ-FRONTEND-302
