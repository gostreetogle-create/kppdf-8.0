# TZD-42 checklist

> Status: **DONE**
> Marker: `tasks/_active/TZD-42.md`
> Commit/push: **required by continuous executor; deploy NO**

## Claim slot

- agent_id: Buffy
- claimed_at: 2026-08-12T00:22:13Z
- workspace: D:\\kppdf-8.0
- team_room_claim: unavailable — Team Room CLI reported `Unknown task: TZD-42; sync tasks first`

## Preflight

- [x] Current branch is fast-forwarded to `origin/main` at `0432479c` after TZD-41; tree clean before claim
- [x] `_active-map.md` and `tasks/_active/` checked — no conflicting active claim
- [x] TZD-42, both MCP audit copies, GEMINI/executor rules, and relevant MCP docs read
- [x] Claim slot filled before code; Status = CLAIMED / IN PROGRESS
- [x] `tasks/_active/TZD-42.md` is present
- [x] Backend and Desktop/MCP dependency bootstrap is available or recorded before gates

## Acceptance

- [x] A 100-iteration propose→confirm regression passes without 404
- [x] Root cause is recorded here and in the archive: what happened and what changed
- [x] Missing-proposal tool/HTTP error includes the received `proposalId` and a useful hint
- [x] Backend mutation-journal focused test passes
- [x] `cd desktop/mcp && pnpm test && pnpm exec tsc --noEmit` passes
- [x] No frontend, TZD-43/44/45, production cleanup, or deploy changes
- [x] Known limitation: live replay of «Шест для лазания ШЛ-300» may remain unavailable if unit+MCP chain closes the hypotheses

## Investigation result

The backend propose→confirm path is stable: the 100-iteration service regression and
MCP-equivalent material/product mock chain both pass. The audit 404 was consistent with
a client supplying a nested/derived id instead of the proposal journal id (especially
before TZD-41 exposed top-level `proposalId`); no journal deletion, idempotency overwrite,
ownership race, or TTL expiry was reproduced. The fix is a narrow contract hardening:
proposal confirm/cancel 404s name the received id and tell the caller to reuse the exact
`proposalId` from `kppdf_propose_*`; the MCP confirm helper repeats the same hint on HTTP 404.

## Conflict keys

- `backend/src/modules/mutation-journal/mutation-journal.service.ts`
- `backend/src/modules/mutation-journal/mutation-journal.controller.ts`
- `backend/src/modules/mutation-journal/mutation-journal.service.spec.ts`
- `desktop/mcp/src/write-tools.ts`
- `desktop/mcp/src/write-tools.test.ts`
- `desktop/docs/MCP.md`

## Integrity slot (до READY / archive)

- [x] Тип изменения: MCP + backend mutation-journal error contract
- [x] FIC §E updated: TZD-42 confirm recovery row added; §C covered by focused backend module test
- [x] page.md / PAGE-TZ-INDEX: N/A — no UI route
- [x] SECTION-READINESS: N/A — no user-contour change
- [x] Foreign WIP excluded; conflict keys respected
- [x] Canon: `docs/DOCS-INTEGRITY.md`

## Gates (fact)

- [x] `cd backend && pnpm test -- mutation-journal` — 2 suites / 23 tests PASS
- [x] `cd backend && pnpm exec tsc --noEmit` — PASS
- [x] `cd desktop/mcp && pnpm test` — 30 suites / 100 tests PASS
- [x] `cd desktop/mcp && pnpm exec tsc --noEmit` — PASS
- [x] `git diff --check` — PASS
- [x] Prettier — N/A: neither backend nor desktop/mcp declares or installs a Prettier binary in this worktree

## Primary / secondary signal

- Primary: 100 backend confirms + material/product MCP mock chain + explicit missing-id response — PASS.
- Secondary: focused Jest, backend/MCP typecheck, and diff checks — PASS; Prettier N/A as recorded above.

## Executor report (auto)

- Backend ownership and TTL behavior were preserved; only proposal error wording and MCP confirm recovery were changed.
- Scope guard: no product-category (TZD-43), hygiene (TZD-44), production/supply (TZD-45), frontend, production cleanup, or deploy changes.

## Closeout

- [x] archive + lock + progress + status synchronization
- [x] remove `_active/TZD-42.md` after archive
- [ ] commit and push `main`
- closed_at: 2026-08-12T03:30:00Z
