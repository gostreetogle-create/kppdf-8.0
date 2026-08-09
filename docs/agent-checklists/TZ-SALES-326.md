# TZ-SALES-326 checklist

> Status: **DONE**
> Marker: archived; `tasks/_active/TZ-SALES-326.md` removed after closeout
> Commit/push: scoped implementation and closeout pushed

## Claim slot

- agent_id: `agent-6c3d05b80e`
- claimed_at: `2026-08-09T12:21:11Z`
- workspace: `D:\kppdf-8.0`
- team_room_claim: unavailable for task registry; READY and closeout messages sent

## Preflight

- [x] Canonical `D:\kppdf-8.0` synced to current `origin/main` at `f529f7a5` before closeout.
- [x] TZ-SALES-326, product-vitrine audit, Spec §0/§3, GEMINI, AI-Agent Guide, and PO-DIARY §1–§4 read.
- [x] Active-map and active markers scanned; DOC-344 builder keys remained separate and untouched.
- [x] 325 was not claimed while proposal-create keys were active.

## Acceptance

- [x] Products flyout uses a dedicated 40rem cap (36–40rem target) and does not resize the A4 center.
- [x] Transparent backdrop over center/iframe closes both left products/template and right params flyouts.
- [x] Click inside flyout/rail/CDK overlay remains excluded from outside dismiss; Escape still closes.
- [x] `closeFlyouts()` is protected so the template binding compiles.
- [x] Cursor visual PASS: 40rem flyout, backdrop closes L+R, A4 does not compress.
- [x] No 325 draftLines, 328 vitrine content, 323/324 logic, DOC-344, 322/320, or deploy changes.

## Gates (факт)

- `cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit` — PASS
- `cd frontend && pnpm run build` — PASS; existing Angular component/chunk budget warnings only
- `cd frontend && pnpm test --testPathPattern=proposal-create --runInBand` — PASS, 11/11
- `git diff --check` — PASS
- Existing Angular `NG0953` destroyed OutputRef console warning remains non-failing.
- Cursor visual PASS — 40rem width, center/iframe outside dismiss, unchanged A4 geometry.

## Executor report (auto)

- implementation: products-only flyout width is capped at `min(40rem, available studio width)`; transparent backdrop handles center/iframe clicks; rails remain fixed; `closeFlyouts()` is template-safe.
- docs: Spec §3 and Create КП page record width/backdrop behavior.
- conflict disclosure: DOC-344 and foreign DOC-343 WIP untouched; 325 and 328 were not included.
- canonical implementation commits: `f816f2e0`, `adee07b8`.

## Closeout

- [x] archive + lock + progress + remove `_active`
- [x] Status = DONE
- closed_at: `2026-08-09T12:52:45Z`
