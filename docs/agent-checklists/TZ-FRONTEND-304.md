# TZ-FRONTEND-304 checklist

> Status: **READY**
> Goal: аккуратно разделить контейнер и UI блока «состав изделия» (BOM)
> Speed: не важна; важны characterization и отсутствие регрессий
> Deploy: НЕ

## Claim slot

- agent_id:
- claimed_at:
- workspace:
- branch:
- team_room_claim:

## Preflight

- [ ] Isolated worktree from origin/main (после land 303)
- [ ] `_NOW` + `_active` — нет конфликта exact keys
- [ ] Claim marker + this checklist до кода
- [ ] Прочитан `docs/ANGULAR-GUIDE.md` + integrity audit P1-COMPOSITION

## Phase 0–1

- [ ] Caller map + dynamic imports (path:line)
- [ ] Baseline focused composition/quick-create recorded
- [ ] Characterization tests green on current behavior

## Phase 2

- [ ] Chosen split A or B + rationale
- [ ] No pages/** dynamic imports from shared composition (or BLOCKED successor)
- [ ] Child batches ≤8 files; page callers one-by-one
- [ ] Gates per child PASS

## Closeout

- [ ] Canonical finding updated
- [ ] Full frontend Jest без новых fail
- [ ] Archive/lock/progress/push
- [ ] Deploy НЕ
