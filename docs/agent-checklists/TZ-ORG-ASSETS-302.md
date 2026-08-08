# TZ-ORG-ASSETS-302 checklist

> Status: **CLAIMED / IN PROGRESS** · Wave: PARTY-DOCS #6 · Depends: ASSETS-301 + ORDERS-306
> Source: `tasks/_backlog/party-docs/TZ-ORG-ASSETS-302-print-bind.md`
> Marker: `tasks/_active/TZ-ORG-ASSETS-302.md`
> Commit/push: **REQUIRED** per continuous executor canon.

## Claim slot
- agent_id: agent-3e757640b7
- claimed_at: 2026-08-08T17:08:00Z
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable — Team Room task registry does not contain backlog-only TZ IDs

## Preflight
- [x] `git status` checked; foreign WIP explicitly excluded
- [x] `_active-map.md` + `tasks/_active/` checked — no conflicting active claim
- [x] TZ / wave / dependencies read; ASSETS-301 and ORDERS-306 are archived DONE
- [x] Claim slot filled before product-code changes
- [x] `bash OrchestratorKit/verify-status.sh` run; pre-existing FAIL for 72 legacy kit-era entries (not this zone)

## Acceptance
- [x] Audit существующих print/requisites paths: existing HTML build + generated-document snapshot pipeline retained
- [x] Bind logo/seal/signature + реквизиты в шаблоны: registry fields and typed organization vault aliases
- [x] Smoke: order → stub КП → HTML/PDF-ready snapshot без crash без vault
- [x] Docs слотов для дизайнера

## Gates
- [x] BE typecheck + focused document-template/generated-document tests
- [x] FE typecheck + focused registry service test
- [x] Targeted ESLint (0 errors; existing `any` warnings only)
- [x] Formatting reviewed; frontend Prettier reports repository-wide CRLF vs configured LF only, backend package has no Prettier binary
- [x] `git diff --check`
- [x] `bash OrchestratorKit/verify-status.sh` (pre-existing legacy drift disclosed: 72 kit-era entries)

## Executor report
- Foreign WIP remains untouched and must not be committed.
- No new PDF engine; use the existing document/template pipeline.
- Empty vault slots render empty image/seal output or the signature placeholder.
- Prettier is not reported as a clean gate because the repository's existing CRLF files conflict with frontend `.prettierrc` `endOfLine: lf`; no formatter rewrite was applied.

## Closeout
- [x] Archive + lock + progress
- [x] Commit/push; deploy NO
