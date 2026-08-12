# TZD-41 — MCP envelope, outputSchema and list aliases

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-12
closed_by: Buffy
verification:
  - acceptance criteria: PASS
  - typecheck: PASS
  - tests: PASS (98/98)
  - lint: N/A — desktop/mcp has no configured ESLint/Prettier gate; Prettier command attempted and was unavailable
  - checklist: ADDED (`docs/agent-checklists/TZD-41.md`)
  - progress.md: UPDATED
  - status synchronization: PASS

## Delivered

- Added a shared `{ ok, result, id?, proposalId? }` envelope with `structuredContent` and `_id` → `id` normalization.
- Normalized proposal identifiers to top-level `proposalId`, including batch-first ids and stable ids for local draft-only propose tools.
- Added reusable `outputSchema` to the MCP tool registration surface in the TZD-41 conflict-key files.
- Added canonical `kppdf_list_*` names with one-wave aliases for document types/templates/categories, import tasks/todos, and text-block categories/blocks.
- Updated the registry/docs health count to 81 and documented the response contract in `desktop/docs/MCP.md`.
- No backend REST business logic, frontend, production cleanup, deploy, TZD-42, TZD-43, TZD-44, or TZD-45 work was included.

## Evidence

- `cd desktop/mcp && pnpm test` — PASS, 98/98.
- `cd desktop/mcp && pnpm exec tsc --noEmit` — PASS.
- `tools/list` in-memory MCP smoke — PASS, 81 tools; selected key tools expose outputSchema properties `ok`, `result`, `id`, `proposalId`.
- In-memory `kppdf_propose_module_create` smoke — PASS; top-level `proposalId` and `structuredContent` present.
- `git diff --check` — PASS.

## Known limitation

The four domain/validate registrations in `desktop/mcp/src/domain-tools.ts` remain outside TZD-41’s explicit conflict-key outputSchema sweep; a future registry contract pass may standardize them too. Confirm-404, product category, hygiene and production/supply remain the next queue items or park.
