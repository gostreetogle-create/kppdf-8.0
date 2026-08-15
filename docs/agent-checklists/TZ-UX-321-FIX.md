# TZ-UX-321-FIX checklist

> Status: **DONE**
> Spec: `tasks/TZ-UX-321-fix-rail-anchor-and-right-rail.md`
> Audit: `docs/audits/2026-08-15-ux321-rail-regression.md`
> Archive: `tasks/_archive/2026-08/TZ-UX-321-FIX.done.md`
> Lock: `.mimocode/locks/TZ-UX-321-FIX-frame-relative-rails.lock`
> Deploy: НЕ

## Claim slot

- agent_id: Cursor Product Executor
- claimed_at: 2026-08-15T14:40:00Z
- ready_at: 2026-08-15T14:45:00Z
- closed_at: 2026-08-15T14:50:00Z
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable

## Acceptance

- [x] `.pi-page-frame` → `position: relative`
- [x] Left + right transparent rails; ← left only, → right only
- [x] Anchors `left:0` / `right:0` (no `left/right:64px`, no `fixed` on rails)
- [x] Jest: ownership + no `app-nav-gutter`
- [x] Browser 1920 geometry JSON (frame edges ±0px)
- [x] Narrow 1440/1280: `display:none`
- [x] Quality **98** with geometry evidence
- [x] No TZ-UX-322 page-tools

## Gates

| Gate | Result |
|------|--------|
| tsc | PASS |
| Jest app-layout | PASS 5/5 |
| ng build development | PASS |
| CDP geometry smoke | PASS selfScore 98 |

## Quality score

- self_score: 98
- reviewer_score: **98** (Cursor 2026-08-15; SHA + geometry JSON cross-check PASS)

## Executor report (auto)

- outcome: DONE
- quality_score: 98
- commit: fade51c910b7610ec9ef43834728afd8a6922518
- evidence: reports/TZ-UX-321-FIX-chrome-rail-geometry.json
- geometry_1920: frame/leftRail left=255; frame/rightRail right=1655; not viewport+64
- deploy: NOT EXECUTED

## Review handoff

- [x] READY FOR REVIEW
- [x] Cursor/PO PASS **98/100**
- [x] archive + lock
