# TZ-UX-321 checklist

> Status: **READY FOR CLAIM**
> Goal: ←→ у внешней грани колонки контента (calc от 1400px), не у края окна
> Deploy: НЕ
> Quality bar: ≥98 (PO visual)

## Claim slot

- agent_id: _(fill on claim)_
- claimed_at:
- workspace:
- branch: feature/TZ-UX-321-nav-beside-content-column
- team_room_claim:

## Preflight

- [ ] Isolated worktree from origin/main
- [ ] Conflict keys free vs FRONTEND-304 / other layout claims
- [ ] Read TZ + this checklist before code

## Acceptance

- [ ] `left/right: max(8px, calc(50% - 700px - 48px))` (or equivalent gap 8–16px to column)
- [ ] No final `64px` / `14px` as gutter position
- [ ] Spec + tsc PASS
- [ ] Browser 1920: `frame.left - back.right` ∈ [8, 24]; mirror right; screenshot path logged
- [ ] Self-score ≥98
- [ ] Docs + archive + lock; deploy НЕ

## Executor report (auto)

_(fill on DONE)_
