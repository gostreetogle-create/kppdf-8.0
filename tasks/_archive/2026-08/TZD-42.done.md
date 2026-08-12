# TZD-42 DONE — MCP/journal confirm 404 recovery

- **Closed:** 2026-08-12T03:30:00Z
- **Executor:** Buffy
- **Deploy:** NO
- **Scope:** Desktop/MCP + backend mutation-journal only

## Root cause

The backend propose→confirm path is stable: a 100-iteration immediate confirm
regression passed, and the MCP-equivalent material/product mock chain passed. The
audit 404 was consistent with a client supplying a nested/derived id instead of
the proposal journal id, especially before TZD-41 exposed a top-level `proposalId`.
No journal deletion, idempotency overwrite, ownership race, or TTL expiry was
reproduced. Expiry remains a distinct 400 response after the one-hour TTL.

## Change

- Backend proposal confirm/cancel missing-id responses now say `Proposal <id> not found`
  and include the received id plus the recovery hint to reuse the exact `proposalId`
  from `kppdf_propose_*`, not `result.id` or `mutationId`.
- MCP `kppdf_confirm_proposal` keeps the exact supplied id in the request path and
  repeats the same actionable hint for HTTP 404 failures.
- MCP documentation now records the canonical propose→confirm chain, 404/403/400
  distinctions, and id-selection troubleshooting.
- Added backend tests for missing id, foreign ownership, and 100 immediate confirms;
  added MCP mock-chain tests for material and product plus missing-id failure text.
- Updated Feature Integration Checklist §E and TZD-42 checklist.

## Gates

- `cd backend && pnpm test -- mutation-journal` — 2 suites / 23 tests PASS
- `cd backend && pnpm exec tsc --noEmit` — PASS
- `cd desktop/mcp && pnpm test` — 30 suites / 100 tests PASS
- `cd desktop/mcp && pnpm exec tsc --noEmit` — PASS
- `git diff --check` — PASS
- Prettier — N/A: no Prettier binary is declared/installed in backend or desktop/mcp

## Integrity / scope

- `docs/FEATURE-INTEGRATION-CHECKLIST.md` §E updated for TZD-42.
- No frontend, TZD-43, TZD-44, TZD-45, production cleanup, or deploy changes.
- Live replay of «Шест для лазания ШЛ-300» remains optional; unit and MCP-chain
  coverage close the investigated hypotheses.
