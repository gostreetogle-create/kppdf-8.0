# WAVE checklist — Backend post-RBAC

> Промпт: `tasks/PROMPT-FREEBUFF-BE-WAVE.md`
> Обрыв → resume с первого незакрытого `[ ]`.

Status: **DONE**
agent_id: `buffy-gpt-5.6-luna`
started_at: `2026-08-31T20:49:43+03:00`
closed_at: `2026-08-31T21:55:15+03:00`
**RESUME:** очередь BE wave пуста; HEAD `f8e411ce`

## Волна

- [x] 0. Master-чеклист создан и claim зафиксирован
- [x] 1. `TZ-BACKEND-VALIDATION-NESTED-I18N` — archived; commits `1e209c74` + docs `61e21823` pushed
- [x] 2. `TZ-BACKEND-CATALOG-PART-BOM-IN-TREE` — archived; commits `15ee4da9` + docs `f8e411ce` pushed
- [x] 3. QUEUE-LIVE + `_NOW` + Status=DONE + отчёт PO

## 1. TZ-BACKEND-VALIDATION-NESTED-I18N

- [x] Claim: checklist TZ заполнен, active marker создан
- [x] Code: nested ValidationPipe exceptionFactory flatten + humanize RU
- [x] Gates: tsc PASS; focused 10 PASS; full Jest 119 suites / 1114 tests PASS; target eslint PASS; full lint baseline 45 errors / 200 warnings
- [x] Archive: `.done.md` создан; active marker очищен
- [x] Commit: `1e209c74` + docs sync `61e21823` pushed

## 2. TZ-BACKEND-CATALOG-PART-BOM-IN-TREE

- [x] Claim: checklist TZ заполнен, active marker создан
- [x] Code: Product/Module display tree показывает BOM Детали одним уровнем; traversal semantics untouched
- [x] Gates: tsc PASS; focused 14 PASS; full Jest 119 suites / 1115 tests PASS; target eslint PASS; full lint baseline 45 errors / 200 warnings
- [x] Archive: `.done.md` создан; active marker очищен
- [x] Commit: `15ee4da9` + docs sync `f8e411ce` pushed

## Conflict

- Свои keys: только backend пути из двух TZ и собственные checklists/archive
- Чужое: `frontend-nx/**`, `frontend/**`, `docker-compose.yml`, DCI markers
- RBAC уже DONE: `b3607871`; guard/JWT повторно не открывались

## Closeout

- [x] Обе TZ archived и root prompt перенесён в `tasks/_archive/2026-08/prompts-spent/`
- [x] `QUEUE-LIVE.md` + `_NOW.md` синхронизированы in-place без staging чужих hunks
- [x] очередь BE wave пуста
- [x] HEAD sha записан: `f8e411ce`

## Known limitation

Полный backend eslint остаётся baseline FAIL: 45 ошибок и 200 предупреждений
в unrelated файлах; изменённые файлы обеих TZ проходят target eslint.
