# TZ-BACKEND-CONTRACT-C1-SCHEMA checklist

> Status: **DONE**
> Marker: archived (removed from `tasks/_active/`)
> Commit/push: per `docs/GIT-POLICY.md`

## Claim slot

- agent_id: `claude`
- claimed_at: `2026-09-03T09:40:30+03:00`
- workspace: `D:\kppdf-8.0`
- team_room_claim: `unavailable`

## Preflight Check Output

- **Context read:** `docs/how-to-connect-ai.md`, `GEMINI.md`, `.agents/skills/kppdf-executor-loop/SKILL.md`, `.agents/skills/kppdf-context-preflight/SKILL.md`, `docs/PROJECT-MEMORY.md`, `docs/PO-CANON.md`, `docs/CONTEXT.md`, `docs/DOCS-INTEGRITY.md`, `docs/GIT-POLICY.md`, `tasks/TZ-BACKEND-CONTRACT-C1-SCHEMA.md`, `docs/architecture/nx-contract-file-roadmap.md`, `backend/src/modules/contract/contract.schema.ts`, `docs/agent-checklists/WAVE-BACKEND-CONTRACT-FILE.md`.
- **Key Constraints:** backend-only parallel slot; preserve lifecycle `Contract.status`; add separate file-attachment state; no frontend-nx, quotation, Order, UI, or deploy.
- **Planned Deliverable:** add indexed `contractStatus` default `none` plus optional file id/url; run backend typecheck and targeted lint; archive and push owned paths only.
- **Validation Path:** backend tsc + targeted schema lint; FIC N/A for schema-only change; checklist/archive integrity.

## Preflight

- [x] Git status / branch / worktree inspected; continuous `main`; unrelated dirty WIP preserved
- [x] `_NOW.md` + `tasks/_active/` inspected; no competing active claim on Contract keys
- [x] C1 TZ, wave, backend schema and asset conventions read
- [x] Claim slot filled; Status = CLAIMED / IN PROGRESS
- [x] Active marker present during implementation
- [x] Baseline backend typecheck exit 0

## Acceptance

- [x] `contractStatus` enum `none|file_attached|generated`, default `none`, indexed
- [x] `attachmentFileId?` and `attachmentUrl?` optional schema fields
- [x] Existing lifecycle `status` enum and sign/activate fields unchanged
- [x] Backend typecheck PASS

## Integrity slot

- [x] Type: module/schema
- [x] FIC §C: N/A for route/API in C1; schema groundwork only
- [x] `SECTION-READINESS`: N/A — no user-visible section status change
- [x] Foreign WIP not committed; conflict keys respected
- [x] `COUPLING-MAP`: N/A — no shared UI/status/FK behavior changed
- [x] `docs/DOCS-INTEGRITY.md` applied

## Gates (факт)

- `cd backend && pnpm exec tsc -p tsconfig.build.json --noEmit` → exit 0
- `cd backend && pnpm exec eslint src/modules/contract/contract.schema.ts` → exit 0

## Executor report

Added the separate contract file-state schema fields without touching the lifecycle FSM. The backend tree contained unrelated dirty work from the parallel KP-family executor; only C1-owned schema and records are included in the handoff.

## Closeout

- [x] archive + lock + live-state sync + remove `_active` marker
- [x] Status = DONE
- closed_at: `2026-09-03`
