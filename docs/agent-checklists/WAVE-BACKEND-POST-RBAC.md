# WAVE checklist — Backend post-RBAC

> Промпт: `tasks/PROMPT-FREEBUFF-BE-WAVE.md`
> Обрыв → resume с первого незакрытого `[ ]`.

Status: **IN_PROGRESS**
agent_id: `buffy-gpt-5.6-luna`
started_at: `2026-08-31T20:49:43+03:00`
**RESUME:** сейчас открыт пункт 3 — QUEUE-LIVE + `_NOW` + archive prompt

## Волна

- [x] 0. Master-чеклист создан и claim зафиксирован
- [x] 1. `TZ-BACKEND-VALIDATION-NESTED-I18N` — archived, commit `1e209c74`, docs sync `61e21823` pushed
- [x] 2. `TZ-BACKEND-CATALOG-PART-BOM-IN-TREE` — code/gates/archive готовы; commit pending
- [ ] 3. QUEUE-LIVE + `_NOW` + Status=DONE + отчёт PO

## 1. TZ-BACKEND-VALIDATION-NESTED-I18N

- [x] Claim: checklist TZ заполнен, собственный active marker создан
- [x] Code: nested ValidationPipe exceptionFactory flatten + humanize RU
- [x] Gates: tsc PASS; focused 10 PASS; full Jest 119 suites / 1114 tests PASS; target eslint PASS; full lint baseline 45 errors / 200 warnings
- [x] Archive: `.done.md` создан; active marker очищен
- [x] Commit: `1e209c74` + docs sync `61e21823` pushed

## 2. TZ-BACKEND-CATALOG-PART-BOM-IN-TREE

- [x] Claim: checklist TZ заполнен, собственный active marker создан
- [x] Code: Product tree показывает BOM Детали одним уровнем; traversal semantics untouched
- [x] Gates: tsc PASS; focused 14 PASS; full Jest 119 suites / 1115 tests PASS; target eslint PASS; full lint baseline 45 errors / 200 warnings
- [x] Archive: `.done.md` создан; active marker будет очищен перед commit
- [ ] Commit: точечно создать и push, затем записать SHA

## Conflict

- Свои keys: только пути из соответствующих backend TZ specs и собственные checklists/archive
- Чужое: `frontend-nx/**`, `frontend/**`, `docker-compose.yml`, `tasks/_active/TZ-UI-DCI-601.md`
- RBAC уже DONE: `b3607871`; guard/JWT повторно не открывать

## Closeout

- [ ] Обе TZ archived и root prompt перенесён в `tasks/_archive/2026-08/prompts-spent/`
- [ ] `QUEUE-LIVE.md` + `_NOW.md` синхронизированы без захвата чужих hunks
- [ ] очередь BE wave пуста
- [ ] HEAD sha записан
