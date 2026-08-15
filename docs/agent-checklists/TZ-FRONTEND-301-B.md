# TZ-FRONTEND-301-B checklist

> Status: **READY FOR REVIEW**
> Marker: `tasks/_active/TZ-FRONTEND-301-B.md`
> Commit/push: docs-only lane branch after review handoff

## Claim slot

- agent_id: Buffy-TZ-FRONTEND-301-B
- claimed_at: 2026-08-15T05:20:44.148Z
- workspace: D:\kppdf-8.0\.worktrees\TZ-FRONTEND-301-B
- branch: feature/TZ-FRONTEND-301-B
- team_room_claim: yes (Team Room lease/watcher; claimed task `TZ-FRONTEND-301-B`)
- parent: TZ-FRONTEND-301
- lane: B

## Conflict keys

- `docs/audits/2026-08-15-angular-component-integrity-platform.md`
- `docs/agent-checklists/TZ-FRONTEND-301-B.md`
- `frontend/src/app/shared/**`
- `frontend/src/app/core/**`
- `frontend/src/app/layout/**`
- `frontend/src/app/app.ts`
- `frontend/src/app/app.routes.ts` and `app.routes.spec.ts`
- `frontend/src/app/app.config.ts` and `app.config.spec.ts`
- `frontend/src/app/styles.css`
- `frontend/eslint.config.js`
- `frontend/eslint/**`
- `frontend/scripts/**`
- `scripts/architecture-check.mjs`

## Preflight

- [x] Isolated `.worktrees/TZ-FRONTEND-301-B` created from `origin/main` at `816689ed6c5895c0e165231ed14904d446acfb91`.
- [x] Main worktree dirty state inspected and left untouched; AUTH-305 remains out of scope.
- [x] `_NOW.md` and all root `tasks/_active/*` read; no exact conflict-key overlap found.
- [x] TZ, Angular guide, project patterns, Git policy, remediation wave, and Cursor rule read.
- [x] Task marker and claim slot created before source audit.
- [x] Team Room claim recorded; watcher active.

## Acceptance

- [x] Baseline frontend tsc, lint, focused custom-rule specs, and architecture-check recorded with exit codes.
- [x] Complete Lane B inventory covers shared/core/layout/root app/routes/config/styles and ESLint/tooling: 290 tracked files, 214 production files, 76 specs.
- [x] Every finding has manual source/test proof, evidence path:line, severity, and verdict.
- [x] Container/presentational review records state owner, boundary, and extract|keep decision.
- [x] Exact remediation batches are one boundary or at most eight related files, with non-overlapping keys; broad successors are explicitly STOP/BACKLOG.
- [x] No frontend source or tooling code was modified during Stage 1.
- [x] Report is ready for Lane A canonical import by full commit SHA.

## Integrity slot

- [x] Type: docs-only audit.
- [x] FIC/UI browser evidence: N/A — no product code or route is changed in Stage 1.
- [x] Page docs: N/A — Lane B platform scope only.
- [x] SECTION-READINESS: N/A — audit output is not a product change.
- [x] Foreign WIP excluded from commit; conflict keys preserved.
- [x] Canonical: `docs/DOCS-INTEGRITY.md` referenced; no product docs changed.

## Gates (fact)

- [x] `cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit` → PASS, exit 0.
- [x] `cd frontend && pnpm exec eslint src/` → PASS, exit 0; four pre-existing Lane A page warnings, no Lane B production warning.
- [x] `cd frontend && pnpm exec jest --runInBand --runTestsByPath eslint/rules/no-raw-http-in-components.spec.cjs` → baseline FAIL, exit 1; 5 tests fail with flat-config “No matching configuration” harness error.
- [x] `cd frontend && pnpm exec jest --runInBand --runTestsByPath eslint/rules/no-implements-oninit-in-pages.spec.cjs` → baseline FAIL, exit 1; same harness error.
- [x] `pnpm architecture:check` → PASS, exit 0; 936 files, baseline 6.
- [x] Focused composition/photo specs → PASS, 3 suites / 24 tests.
- [x] Focused quick-create/layout/root specs → PASS, 5 suites / 33 tests.
- [x] Focused core specs → PASS, 6 suites / 70 tests.
- [x] `git diff --check` → PASS, exit 0.

## Findings and proposed batches

- [x] P0: 0.
- [x] P1: 5 — `B-TOOLING` (FIX NOW), `B-PHOTO` (FIX NOW), `B-ENTITY-SPEC` (FIX NOW), `B-COMPOSITION-SUCCESSOR` (serial STOP/BACKLOG), `B-GROUP-ACL-SUCCESSOR` (serial STOP/BACKLOG).
- [x] P2: 1 — `B-QUICKCREATE` review trigger; KEEP NOW/BACKLOG, no mechanical split.
- [x] P3: 3 — ForbiddenPage OnPush, redundant standalone metadata, shadow drift; BACKLOG only.
- [x] Report contains exact conflict keys, manual evidence, accepted legacy/false positives, and browser scenarios for future UI batches.

## Output

- Report: `docs/audits/2026-08-15-angular-component-integrity-platform.md`
- Required final line: `ANGULAR AUDIT LANE B READY`
- Full pushed SHA: to be recorded in final handoff after commit/push.

## Review handoff

- [x] READY FOR REVIEW in lane handoff; canonical Lane A coordinator may import report after pushed full SHA.
- [x] Cursor/PO PASS required before any remediation; no Stage 2 product edit started.

## Closeout

- [ ] Archive/lock/progress are coordinator/PO follow-up after canonical audit review; do not mark DONE before PASS.
