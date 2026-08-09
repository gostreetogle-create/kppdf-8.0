# TZ-SALES-326 checklist

> Status: **READY FOR REVIEW**
> Marker: `tasks/_active/TZ-SALES-326.md` (retain until visual PASS/archive)
> Commit/push: scoped implementation landed; closeout deferred until visual PASS

## Claim slot

- agent_id: `agent-6c3d05b80e`
- claimed_at: `2026-08-09T12:21:11Z`
- workspace: `D:\kppdf-8.0`
- team_room_claim: unavailable for task registry; READY FOR REVIEW message sent successfully

## Preflight

- [x] Canonical `D:\kppdf-8.0` checked; worktree synced/rebased to current `origin/main`.
- [x] TZ-SALES-326, product-vitrine audit, Spec §0/§3, GEMINI, AI-Agent Guide, and PO-DIARY §1–§4 read.
- [x] `_active-map.md` and canonical active markers scanned for overlap.
- [x] DOC-344 builder keys are separate and untouched; 325 is not claimed.
- [x] Claim marker existed before code changes.

## Acceptance

- [x] Products flyout uses a dedicated 40rem cap (36–40rem target) and does not resize the A4 center.
- [x] Transparent backdrop over center/iframe closes both left products/template and right params flyouts.
- [x] Click inside flyout/rail/CDK overlay remains excluded from outside dismiss; Escape still closes.
- [x] Fixed rails and A4 center geometry remain unchanged.
- [x] No 325 draftLines, 328 vitrine content, 323/324 logic, DOC-344, 322/320, or deploy changes.

## Gates (факт)

- `cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit` — PASS
- `cd frontend && pnpm test --testPathPattern=proposal-create --runInBand` — PASS, 11/11
- `git diff --check` — PASS
- Existing Angular `NG0953` destroyed OutputRef console warning remains non-failing in the focused suite.
- Cursor/PO visual check for 36–40rem width, center/iframe backdrop dismiss, and unchanged A4 width — **PENDING**

## Executor report (auto)

- implementation: products-only flyout width is capped at `min(40rem, available studio width)` while template/right flyouts retain the base width; a transparent backdrop captures center/iframe clicks; rails remain above it and flyouts remain interactive.
- tests: proposal-create now covers backdrop closure of both panels and pointerdown inside flyout; focused suite is 11/11.
- docs: Spec §3 and Create КП page document the products width/backdrop behavior.
- conflict disclosure: DOC-344 builder code and remaining foreign DOC-343 backend/docs WIP were not edited; 325 and 328 remain unclaimed.
- known limits: vitrine grid/content remains TZ-SALES-328.

## Review handoff

- [x] READY FOR REVIEW sent to Team Room
- [ ] Archive only after Cursor/PO visual PASS

## Closeout

- [ ] archive + lock + progress + remove `_active`
- [ ] Status = DONE
- closed_at: pending visual PASS
