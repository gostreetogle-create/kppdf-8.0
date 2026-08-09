# TZ-UX-314 checklist

> Status: **RESERVED**  
> Marker: `tasks/_active/TZ-UX-314.md` (создаёт исполнитель при CLAIM)  
> Source: `tasks/TZ-UX-314-list-page-size-10.md`  
> Commit/push: per executor-loop / PO

## Claim slot (ОБЯЗАТЕЛЬНО до кода)

- agent_id: _(заполнит исполнитель)_
- claimed_at: _(ISO)_
- workspace: D:\kppdf-8.0
- team_room_claim: _(yes|no|unavailable)_

## Preflight

- [ ] Get-Location + git rev-parse --show-toplevel → `D:\kppdf-8.0`
- [ ] `_active-map.md` + `tasks/_active/` — нет чужого CLAIM на те же CONFLICT KEYS
- [ ] Прочитан `tasks/TZ-UX-314-list-page-size-10.md`
- [ ] Claim slot заполнен; Status = CLAIMED / IN PROGRESS
- [ ] `tasks/_active/TZ-UX-314.md` на месте

## Acceptance

- [ ] Рабочие list `PAGE_SIZE` / table `pageSize` = **10** (PAGES из TZ)
- [ ] Server list `limit=10` где уже был `limit: PAGE_SIZE`
- [ ] Counterparties: pager + limit=10, строки за 1-й страницей доступны
- [ ] Пикеры `limit: 200` / A4 / forms demo не тронуты
- [ ] Specs + page.md синхронизированы
- [ ] frontend tsc + затронутые page specs PASS

## Gates (факт)

_(исполнитель)_

## Executor report (auto)

_(исполнитель)_

## Closeout

- [ ] archive + lock + progress + удалить `_active`
- [ ] Status = DONE
- closed_at: _(ISO)_
