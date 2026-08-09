# TZ-SALES-329 checklist

> Status: **DONE**
> Marker: archived; `tasks/_active/TZ-SALES-329.md` removed after closeout
> Commit/push: scoped closeout committed and pushed

## Claim slot

- agent_id: `agent-6c3d05b80e`
- claimed_at: `2026-08-09T12:12:12Z`
- workspace: `D:\kppdf-8.0`
- team_room_claim: unavailable for task registry; READY FOR REVIEW message sent successfully

## Preflight

- [x] Canonical `D:\kppdf-8.0` checked; worktree synced/rebased to current `origin/main` before claim.
- [x] TZ-SALES-329, Spec §0, GEMINI, AI-Agent Guide, and PO-DIARY §1–§4 read.
- [x] `_active-map.md` and canonical active markers scanned for overlap.
- [x] DOC-344 builder keys did not overlap the layout/nav keys.
- [x] 323 and 324 were DONE; 325 remained explicitly DEFERRED by its shared-key conflict.
- [x] Claim marker existed before code changes.

## Acceptance

- [x] Deals top-nav entry defaults to `/proposals/create`.
- [x] Dark TOC «КП» opens `/proposals/create`.
- [x] Yellow «Все КП» remains `/proposals`; `/proposals` stays an active Deals alias.
- [x] No 325, proposal shell/preview, DOC-344, 322/320, or deploy changes.

## Gates (факт)

- `cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit` — PASS
- `cd frontend && pnpm test --testPathPattern=deals-group-chips --runInBand` — PASS, 2/2
- `git diff --check` — PASS
- Prettier check was not used as a gate: repository files are CRLF and the existing formatter check reports line-ending-only differences; no formatter rewrite was introduced.

## Executor report (auto)

- implementation: Deals `entryPath` now lands on Create КП; `/proposals` is retained as an active alias; dark «КП» chip follows `/proposals/create`; yellow «Все КП» remains `/proposals`.
- docs: proposals Create/list page route behavior documented.
- conflict disclosure: TZ-SALES-325 is deferred because active DOC-344 owns `pi-document-templates.service.ts`; canonical dirty `document-template.service.ts` WIP was preserved. DOC-344 itself was untouched.
- known limits: 325 → 326 → 328 remain queued behind the cleared shared-key conflict.

## Closeout

- [x] archive + lock + progress + remove `_active`
- [x] Status = DONE
- closed_at: `2026-08-09T12:13:28Z`
