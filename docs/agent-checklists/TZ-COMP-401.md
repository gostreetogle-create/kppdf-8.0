# TZ-COMP-401 checklist

> Status: **CLAIMED / IN PROGRESS**
> Marker: `tasks/_active/TZ-COMP-401.md` (должен существовать, пока не archive)

## Claim slot (ОБЯЗАТЕЛЬНО до кода)

- agent_id: Gemini
- claimed_at: 2026-08-18T03:48:00Z
- workspace: D:\kppdf-8.0
- team_room_claim: yes

## Preflight

- [ ] Get-Location + git rev-parse --show-toplevel → оба `D:\kppdf-8.0`
- [ ] Прочитал `_NOW.md` + `tasks/_active/` — нет чужого CLAIM на те же keys
- [ ] TZ `tasks/TZ-COMP-401.md` прочитан
- [ ] Claim slot заполнен; Status = CLAIMED / IN PROGRESS
- [ ] `tasks/_active/TZ-COMP-401.md` на месте

## Acceptance

- [ ] Анонимный GET `/legal/privacy` = 200
- [ ] Enroll: одно поле + ссылка на политику
- [ ] `/` без cookie = 401
- [ ] register = 410
- [ ] ng test privacy.page.spec PASS; tsc app; ng build PASS
- [ ] robots Disallow: /

## Integrity slot

- [ ] Тип: page
- [ ] page.md + PAGE-TZ-INDEX
- [ ] Чужой WIP не в коммите

## Gates

- (заполнит executor)

## Executor report (auto)

_(после работы)_
