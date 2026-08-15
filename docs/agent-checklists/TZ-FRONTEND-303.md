# TZ-FRONTEND-303 checklist

> Status: **READY**
> Goal: починить старый Jest baseline debt (materials + form-profiles)
> Deploy: НЕ

## Claim slot

- agent_id:
- claimed_at:
- workspace:
- branch:
- team_room_claim:

## Preflight

- [ ] Isolated worktree from origin/main
- [ ] `_NOW` + `_active` checked; no overlap with SALES-375 / other claims
- [ ] Claim marker + this checklist filled before code

## Work

- [ ] Baseline failing suites recorded (exact errors)
- [ ] Each fail classified: test / code / needs PO
- [ ] Materials specs green
- [ ] form-profiles.spec green
- [ ] No new full-suite regressions

## Gates

- [ ] focused Jest PASS
- [ ] frontend tsc PASS
- [ ] eslint changed PASS
- [ ] architecture:check PASS
- [ ] git diff --check PASS
- [ ] full frontend test: target debt gone; no new fails

## Closeout

- [ ] Archive/lock/progress/commit/push
- [ ] Deploy НЕ
