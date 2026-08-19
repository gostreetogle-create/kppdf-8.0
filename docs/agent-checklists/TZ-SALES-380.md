# TZ-SALES-380 checklist

> Status: **DONE**
> Marker: `tasks/_archive/2026-08/TZ-SALES-380.done.md`
> Commit/push: по `docs/GIT-POLICY.md` (claimed executor: после gates/review обязательно)

## Claim slot (ОБЯЗАТЕЛЬНО до кода)

- agent_id: Gemini
- claimed_at: 2026-08-19T05:55:00Z
- workspace: D:\kppdf-8.0
- team_room_claim: no

## Preflight

- [x] Get-Location + git rev-parse --show-toplevel → оба `D:\kppdf-8.0`
- [x] Прочитал `_NOW.md` + `tasks/_active/` — нет чужого CLAIM на те же keys
- [x] TZ / канон / deps прочитаны
- [x] Claim slot заполнен; Status = CLAIMED / IN PROGRESS
- [x] `tasks/_active/<TASK-ID>.md` на месте

## Acceptance

- [x] В builder на line-items таблице можно сохранить «Строк на 1-й / следующих»; F5 builder восстанавливает значения.
- [x] Новый Create КП с этим шаблоном: «Вид листа» показывает те же числа (до ручной правки).
- [x] 0/0 + низкая рамка → auto split как 376 (регрессия).

## Integrity slot (до READY / archive)

- [x] Тип изменения определён: page | permission | module | MCP | docs-only | other
- [x] FIC §A–E (и §F если общее поле) пройдены **или** N/A с причиной одной строкой
- [x] page.md / PAGE-TZ-INDEX обновлены **или** N/A (нет UI route)
- [x] SECTION-READINESS обновлён **или** N/A
- [x] Чужой WIP не в коммите; conflict keys соблюдены
- [x] Coupling map: `docs/COUPLING-MAP.md` обновлён **или** N/A (не трогал общее поле/статус)
- [x] Канон: docs/DOCS-INTEGRITY.md

## Gates (факт)

- tsc backend: PASS
- jest document-template: PASS
- tsc frontend: PASS
- jest builder-inspector|proposal-create: PASS
- ng build: PASS

## Executor report

- Done backend defaultSheetLayout
- Done builder-inspector UI for rowsFirstPage/rowsNextPage
- Done proposal-create hydrate

## Review handoff

- [x] READY FOR REVIEW в wave inbox (CATALOG / DICT / …)
- [x] **Не** archive до Cursor Verdict PASS (если TZ требует review)

## Closeout (после PASS)

- [x] archive + lock + progress + удалить `_active`
- [x] Status = DONE
- closed_at: 2026-08-19T06:05:00Z
