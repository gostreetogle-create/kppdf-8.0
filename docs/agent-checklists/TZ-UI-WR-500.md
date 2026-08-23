# TZ-UI-WR-500 checklist — Canon rules + stale audit patch

> Status: **CLAIMED / IN PROGRESS**
> Marker: `tasks/_active/TZ-UI-WR-500.md` (должен существовать, пока не archive)
> Commit/push: по `docs/GIT-POLICY.md` (claimed executor: после gates/review обязательно)

## Claim slot (ОБЯЗАТЕЛЬНО до кода)

- agent_id: freebuff-wr-a (Buffy, Freebuff UI-WR Agent A)
- claimed_at: 2026-08-23T07:15:00+03:00
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (Freebuff CLI, нет Team Room CLI — Claim slot заполнен в checklist)

## Preflight

- [x] Get-Location + git rev-parse --show-toplevel → `D:\kppdf-8.0`
- [x] `git fetch origin && git merge origin/main` — up to date, HEAD `518806ed`
- [x] Прочитал `_NOW.md` + `tasks/_active/` — нет чужого CLAIM на те же keys (в _active только UX-FORM-310/311/313, DONE)
- [x] TZ / канон / deps прочитаны (TZ-500, war-room program, standardization program, AI-AGENT-GUIDE §3, PAGE-TZ-INDEX)
- [x] Claim slot заполнен; Status = CLAIMED / IN PROGRESS
- [x] `tasks/_active/TZ-UI-WR-500.md` на месте

## Acceptance (из TZ)

- [ ] В обоих аудитах S-01/C-02 помечены FIXED/DONE с TZ-UI-401
- [ ] В AI-AGENT-GUIDE есть блок UI overlay canon (≥6 bullets)
- [ ] PAGE-TZ-INDEX содержит секцию UI War Room
- [ ] `git diff --check` PASS

## Integrity slot (до READY / archive)

- [x] Тип изменения определён: docs-only
- [x] FIC §A–E: N/A — docs-only, нет новой страницы/права/модуля/способности
- [x] page.md / PAGE-TZ-INDEX: PAGE-TZ-INDEX обновлён (секция UI War Room)
- [x] SECTION-READINESS: N/A
- [x] Чужой WIP не в коммите; conflict keys соблюдены (только docs из CONFLICT KEYS)
- [x] Coupling map: N/A (не трогал общее поле/статус)
- [x] Канон: docs/DOCS-INTEGRITY.md

## Gates (факт)

- `git diff --check` — PASS
- docs-only: кодовые тесты N/A (записано в отчёте)

## Executor report

- См. `tasks/_archive/2026-08/TZ-UI-WR-500.done.md`

## Review handoff

- [ ] READY FOR REVIEW в wave inbox — N/A (docs-only, волна WR)
- [x] Не archive до Cursor Verdict PASS — N/A (TZ не требует review перед archive)

## Closeout (после PASS)

- [ ] archive + lock + progress + удалить `_active`
- [ ] Status = DONE
- closed_at: _(ISO)_
