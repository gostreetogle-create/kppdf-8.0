# TZ-SALES-323 checklist

> Status: **DONE**
> Marker: archived; `tasks/_active/TZ-SALES-323.md` removed after closeout
> Commit/push: scoped closeout committed and pushed

## Claim slot

- agent_id: `agent-6c3d05b80e`
- claimed_at: `2026-08-09T11:38:09Z`
- workspace: `D:\kppdf-8.0`
- team_room_claim: unavailable — Team Room registry did not contain TZ-SALES-323

## Preflight

- [x] Canonical `D:\kppdf-8.0` and isolated worktree verified; base synced to `origin/main`.
- [x] Claim marker and checklist existed before product-code edits.
- [x] Relevant TZ, audit, prompt, Spec §0, agent guide, and PO diary were read.
- [x] DOC-344 and unrelated active work were preserved untouched.

## Acceptance / gates

- [x] A4 preview has no visible horizontal or vertical sheet scrollbar.
- [x] PO visual PASS on canonical `main`; scrollWidth/scrollHeight observed within client dimensions (+1px tolerance).
- [x] FE contain scale and BE portrait/landscape A4 page-box changes are on canonical `main`.
- [x] Backend typecheck PASS; document build e2e PASS 8/8.
- [x] Frontend typecheck PASS; proposal-create suite PASS 9/9.
- [x] No 324/325, snapshot/print, Builder/DOC-344, or deploy work included.

## Executor report (auto)

- implementation: FE contain scale uses a 2px safety inset and ResizeObserver; build HTML uses bounded portrait/landscape A4 page boxes with hidden document overflow.
- review: PO visual PASS confirmed no H/V scroll on Create КП sheet on canonical `main`.
- canonical code commit: `a270fa09`; canonical closeout commit follows this checklist/archive update.
- known limits: empty table skeleton is TZ-SALES-324; live product rows are TZ-SALES-325; print/snapshot remain PARK.

## Closeout

- [x] archive + lock + progress + remove `_active`
- [x] Status = DONE
- closed_at: `2026-08-09T12:07:23Z`
