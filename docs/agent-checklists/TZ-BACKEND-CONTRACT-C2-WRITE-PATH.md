# TZ-BACKEND-CONTRACT-C2-WRITE-PATH checklist

> Status: **DONE**
> Marker: archived (removed from `tasks/_active/`)
> Commit/push: per `docs/GIT-POLICY.md`

## Claim slot

- agent_id: `claude`
- claimed_at: `2026-09-03T09:49:09+03:00`
- workspace: `D:\kppdf-8.0`
- team_room_claim: `unavailable`

## Preflight Check Output

- **Context read:** `docs/how-to-connect-ai.md`, `GEMINI.md`, `.agents/skills/kppdf-executor-loop/SKILL.md`, `.agents/skills/kppdf-context-preflight/SKILL.md`, `docs/PROJECT-MEMORY.md`, `docs/PO-CANON.md`, `docs/CONTEXT.md`, `docs/DOCS-INTEGRITY.md`, `docs/GIT-POLICY.md`, `tasks/TZ-BACKEND-CONTRACT-C2-WRITE-PATH.md`, `backend/src/modules/contract/contract.schema.ts`, `backend/src/modules/contract/dto/create-contract.dto.ts`, `backend/src/modules/contract/dto/update-contract.dto.ts`, `backend/src/modules/contract/contract.service.ts`.
- **Key Constraints:** backend-only; preserve `Contract.status` lifecycle; `contractStatus` is separate; `file_attached` needs a reference; `none` clears references; `generated` may be fileless; no multipart until C3; no frontend-nx, quotation, Order, UI, or deploy.
- **Planned Deliverable:** DTO validation and create/update persistence/clear semantics with focused regression; backend tsc, Jest, and eslint; archive and push owned paths.
- **Validation Path:** backend tsc + focused Contract DTO Jest + targeted eslint; FIC §C for backend write path, no page route in C2.

## Preflight

- [x] Git status / branch / worktree inspected; unrelated dirty WIP preserved
- [x] `_NOW.md` + `tasks/_active/` inspected; no competing active claim on C2 keys
- [x] C2 TZ and Contract DTO/service/schema read
- [x] Claim slot filled; Status = CLAIMED / IN PROGRESS
- [x] Active marker present
- [x] Baseline backend tsc exit 0

## Acceptance

- [x] DTO accepts optional `contractStatus`, `attachmentFileId`, `attachmentUrl`
- [x] `file_attached` rejects without file id or URL
- [x] Create persists attachment state/fields
- [x] Update supports attachment state; `none` clears both attachment fields
- [x] Existing lifecycle `status`, sign, activate untouched
- [x] backend tsc/tests/lint PASS

## Integrity slot

- [x] Type: module/API write path
- [x] FIC §C: backend Contract module surface; no frontend route in C2
- [x] page.md: N/A — NX `/contracts` explicitly successor/not this TZ
- [x] SECTION-READINESS: N/A
- [x] Foreign WIP not committed; conflict keys respected
- [x] COUPLING-MAP: N/A — lifecycle status unchanged; file state is separate
- [x] `docs/DOCS-INTEGRITY.md` applied

## Gates (факт)

- Red: DTO tests failed because `file_attached` was accepted without a reference (2 failed).
- Green: `cd backend && pnpm exec jest --config jest.config.ts --runInBand src/modules/contract/dto/create-contract.dto.spec.ts` → 4/4 PASS.
- `cd backend && pnpm exec tsc -p tsconfig.build.json --noEmit` → exit 0.
- Targeted eslint on C2 DTO/service/spec → exit 0.

## Executor report

Added the conditional attachment-reference invariant and centralized state resolution in ContractService. Explicit `none` clears both file references; `generated` is intentionally file-optional. Shared `_NOW.md` was not staged because it contains the parallel KP-family executor’s dirty WIP.

## Closeout

- [x] archive + lock + live-state sync + remove `_active` marker
- [x] Status = DONE
- closed_at: `2026-09-03`
