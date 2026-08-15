# TZ-UX-320 checklist

> Status: **READY**
> Goal: переместить системные ←→ из края окна в поля у колонки контента
> Deploy: НЕ

## Claim slot

- agent_id:
- claimed_at:
- workspace:
- branch:
- team_room_claim:

## Preflight

- [ ] Isolated worktree from origin/main
- [ ] No conflict with TZ-FRONTEND-304 / other layout claims
- [ ] Claim before code

## Work

- [ ] CSS: не left/right 14px у края viewport
- [ ] Кнопки в вертикальных полях у pi-page-frame / padding шапки
- [ ] ≥1680 visible; history logic untouched
- [ ] page-chrome + audit note updated
- [ ] app-layout specs PASS (+ position assertion)

## Gates / closeout

- [ ] tsc / focused Jest / eslint / architecture / diff-check
- [ ] Browser smoke ≥1680 light/dark
- [ ] Archive/lock/progress/push; Deploy НЕ
