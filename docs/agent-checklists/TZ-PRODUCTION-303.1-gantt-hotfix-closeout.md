# TZ-PRODUCTION-303.1-gantt-hotfix-closeout checklist

> Status: **RESERVED** (ожидает CLAIM исполнителя)
> Marker: `tasks/_active/TZ-PRODUCTION-303.1-gantt-hotfix-closeout.md` (создаёт исполнитель)
> Commit/push: **YES** после gates · Deploy: **NO** unless PO says «деплой»
> TZ: `tasks/TZ-PRODUCTION-303.1-gantt-hotfix-closeout.md`
> Handoff: `tasks/HANDOFF-PRODUCTION-303.1-executor-prompt.md`

## Claim slot (ОБЯЗАТЕЛЬНО до кода)

- agent_id: _(заполняет исполнитель)_
- claimed_at: _(ISO-8601)_
- workspace: D:\kppdf-8.0
- team_room_claim: yes | no | unavailable

## Preflight

- [ ] Get-Location + git rev-parse --show-toplevel → оба `D:\kppdf-8.0`
- [ ] Прочитал `_active-map.md` + `tasks/_active/` — нет чужого CLAIM на те же keys
- [ ] TZ + audits (first-look, gantt verdict, peer-delta) прочитаны
- [ ] Claim slot заполнен; Status = CLAIMED / IN PROGRESS
- [ ] `tasks/_active/TZ-PRODUCTION-303.1-gantt-hotfix-closeout.md` на месте

## Acceptance

- [ ] Gantt hotfix (фильтры, confirm days, bar context, docs) в commit
- [ ] `/orders?q=` применяется к search (spec PASS)
- [ ] tsc app PASS
- [ ] targeted jest production + orders PASS
- [ ] diff --check PASS
- [ ] lint без mutating `--fix` как evidence (или disclosed fix list)
- [ ] push выполнен; deploy **не** делался

## Gates (факт)

_(исполнитель заполняет команды + PASS/FAIL)_

## Executor report (auto)

```
commit:
gates:
deploy: NO
known_limits:
```

## Closeout

- [ ] archive + lock + progress + удалить `_active`
- [ ] Status = DONE
- closed_at:
