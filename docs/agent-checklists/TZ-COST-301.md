# TZ-COST-301 checklist

> Status: **RESERVED**
> Marker: `tasks/_active/TZ-COST-301.md` (при CLAIM)
> TZ: `tasks/_backlog/cost/TZ-COST-301-work-type-hourly-rate-required.md`
> Review: да · Commit/push: после PASS / по PO

## Claim slot

- agent_id:
- claimed_at:
- workspace: D:\kppdf-8.0
- team_room_claim:

## Preflight

- [ ] Get-Location + git rev-parse → D:\kppdf-8.0
- [ ] Нет чужого CLAIM на work-type keys
- [ ] Аудит канон прочитан (Виды работ остаются в Каталоге)
- [ ] `_active/TZ-COST-301.md` + Status CLAIMED

## Acceptance

- [ ] hourlyRate required BE
- [ ] FE validators + колонка списка
- [ ] backfill / default 0 для legacy
- [ ] Не тронут CostCalculation / appearance / desktop

## Gates

- [ ] backend tsc
- [ ] frontend tsc

## Review handoff

- [ ] READY FOR REVIEW → Cursor PASS → archive

## Executor report (auto)

_(после commit)_
