# TZ-DOC-TABLES-304 checklist

> Status: **DONE** · Wave: DOC-TABLES #4
> Source: `tasks/_backlog/doc-tables/TZ-DOC-TABLES-304-registry-schema-autosync.md`

## Claim slot
- agent_id: `buffy-doc-tables-304`
- claimed_at: `2026-08-09T03:13:07Z`
- workspace: `D:\\kppdf-8.0`
- team_room_claim: unavailable (unknown task; task registry sync unavailable)

## Conflict keys
- `backend/src/modules/registry/**`
- `backend/src/modules/product/product.schema.ts`
- this checklist

## Acceptance
- [x] Product registry fields derive from schema paths with explicit deny-list and preserve 303 fields.
- [x] RU label overrides/fallback and scalar type mapping are deterministic.
- [x] Unit test proves a mock schema path appears without editing a descriptor array.
- [x] Source allowlist remains explicit; only fields auto-sync.
- [x] Backend tsc and tests pass.
- [x] Archive, lock, status/checkpoint, commit and push complete.

## Gates (fact)
- Backend tsc: PASS.
- Registry unit Jest: PASS — 1 suite / 2 tests.
- Registry e2e: PASS — 1 suite / 8 tests.
- Registry ESLint: PASS.
- Prettier and diff-check: PASS.
- Browser/PO visual review: not applicable.
