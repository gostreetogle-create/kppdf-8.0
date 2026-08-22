# TZ-OPS-320 checklist

> Status: **DONE**
> Marker: `tasks/_active/TZ-OPS-320-tasks-spent-hygiene.md` (archived)
> Commit/push: по `docs/GIT-POLICY.md`

## Claim slot (ОБЯЗАТЕЛЬНО до кода)

- agent_id: claude
- claimed_at: 2026-08-22T22:00:00+03:00
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (Team Room CLI не обнаружен)

## Preflight

- [x] Get-Location + git rev-parse --show-toplevel → оба `D:\kppdf-8.0`
- [x] Прочитал `_NOW.md` + `tasks/_active/` — нет чужого CLAIM на те же keys
- [x] TZ / канон / deps прочитаны
- [x] Claim slot заполнен; Status = CLAIMED / IN PROGRESS
- [x] `tasks/_active/TZ-OPS-320-tasks-spent-hygiene.md` создан до правок
- [x] `git fetch origin && git merge origin/main` → Already up to date

## Acceptance

- [x] В корне `tasks/` нет stale TZ `TZ-CORE-302`, `TZ-OPS-317`, `TZ-OPS-318`, `TZ-OPS-319`
- [x] Spent PROMPT из conflict keys перенесены из корня в archive
- [x] `git ls-files`/рабочее дерево показывают файлы в archive-папках
- [x] Deploy не выполнялся

## Integrity slot (до READY / archive)

- [x] Тип изменения определён: docs-only
- [x] FIC §A–E: N/A (нет product/page/permission/module/MCP изменения)
- [x] page.md / PAGE-TZ-INDEX: N/A (нет UI route)
- [x] SECTION-READINESS: N/A (docs hygiene)
- [x] Чужой WIP не в коммите; conflict keys соблюдены
- [x] Coupling map: N/A (не трогал общее поле/статус)
- [x] Канон: docs/DOCS-INTEGRITY.md учтён

## Gates (факт)

- [x] `git fetch origin && git merge origin/main` → PASS (Already up to date)
- [x] root stale-file check → PASS
- [x] archive path check → PASS
- [x] deploy check → PASS (не запускался)
- [x] review diff → PASS

## Executor report

- что сделано: четыре stale TZ и семь spent PROMPT перенесены в архив; `_NOW.md` обновлён; archive + lock созданы
- conflict disclosure: checkout содержит чужие изменения; product-код и чужие пути не затрагивались и не stage'ились
- known limits: `_backlog/` копии DONE не входят в scope

## Review handoff

- [x] READY FOR REVIEW: N/A (docs-only hygiene)
- [x] Archive выполнен после gates

## Closeout

- [x] archive + lock + checklist + `_NOW` обновлены
- [x] Status = DONE
- closed_at: 2026-08-22
