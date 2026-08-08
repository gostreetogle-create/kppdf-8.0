# TZ-SALES-302 — КП immutable versions on send/fix

**Outcome:** DONE
**Date:** 2026-08-08
**Wave:** SHOP-NORTH-B #4
**Executor:** Buffy / openai-gpt-5.6-luna

## Delivered

- Embedded immutable quotation snapshots with version number, freeze timestamp, authenticated actor, line snapshots, totals, family metadata, template/design metadata, and conversion metadata.
- `POST /quotations/:id/freeze` uses an optimistic conditional update with bounded retry, preventing concurrent freezes from overwriting snapshots.
- `GET /quotations/:id/versions` and `GET /quotations/:id/versions/:version` expose summary and read-only snapshot payloads.
- Proposals UI adds a freeze action and visible version history.
- Existing quotation update, delete, and conversion behavior remains unchanged; ordinary PATCH does not address `versions`.

## Acceptance

- Freeze creates the next immutable snapshot: PASS.
- Later line edits do not mutate the old snapshot: PASS.
- Version list and individual snapshot APIs: PASS.
- Frontend shows version history after freeze: PASS.

## Gates

- Backend typecheck: PASS
- Backend quotation tests: PASS (25/25)
- Backend targeted ESLint: PASS
- Frontend typecheck: PASS
- Frontend proposals tests: PASS (16/16)
- Frontend targeted Prettier: PASS
- Frontend targeted ESLint: PASS
- `git diff --check` on SALES-302 paths: PASS

## Scope guard

- Only quotation backend, proposals frontend, quotation service tests, and task/checklist/closeout artifacts are included in this commit.
- Existing products/UI WIP, `desktop/mcp-runtime/`, and unrelated active markers are excluded.
- No deploy performed.

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-08T14:20:00Z
closed_by: Buffy
verification:
  - acceptance criteria: PASS
  - typecheck: PASS
  - tests: PASS
  - lint/format: PASS
  - checklist: ADDED
  - progress.md: UPDATED
  - status synchronization: PASS
  - review: PASS after atomicity/metadata/frontend-test fixes
