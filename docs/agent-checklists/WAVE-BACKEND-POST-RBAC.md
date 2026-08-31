# WAVE checklist — Backend post-RBAC

> Промпт: `tasks/PROMPT-FREEBUFF-BE-WAVE.md`
> Обрыв → resume с первого незакрытого `[ ]`.

Status: **IN_PROGRESS**
agent_id: `buffy-gpt-5.6-luna`
started_at: `2026-08-31T20:49:43+03:00`
**RESUME:** сейчас открыт пункт 2 — TZ-BACKEND-CATALOG-PART-BOM-IN-TREE

## Волна

- [x] 0. Master-чеклист создан и claim зафиксирован
- [x] 1. `TZ-BACKEND-VALIDATION-NESTED-I18N` — archived; commit/push pending closeout SHA
- [ ] 2. `TZ-BACKEND-CATALOG-PART-BOM-IN-TREE`
- [ ] 3. QUEUE-LIVE + `_NOW` + Status=DONE + отчёт PO

## 1. TZ-BACKEND-VALIDATION-NESTED-I18N

- [x] Claim: checklist TZ заполнен, собственный active marker создан
- [x] Code: nested ValidationPipe exceptionFactory flatten + humanize RU
- [x] Gates: tsc PASS; focused 10 PASS; full Jest 119 suites / 1114 tests PASS; target eslint PASS; full lint baseline 45 errors / 200 warnings
- [x] Archive: `.done.md` создан
- [ ] Commit: точечно создан и pushed, SHA будет записан после commit

## 2. TZ-BACKEND-CATALOG-PART-BOM-IN-TREE

- [ ] Claim: checklist TZ заполнен, собственный active marker создан
- [ ] Code: Product/Module tree показывает BOM Детали одним уровнем
- [ ] Gates: backend tsc, focused tests, full Jest, touched-file eslint
- [ ] Archive: `.done.md` создан, собственный active marker очищен
- [ ] Commit: точечно создан и pushed, чужой frontend WIP исключён

## Conflict

- Свои keys: только пути из соответствующих backend TZ specs и собственные checklists/archive
- Чужое: `frontend-nx/**`, `frontend/**`, `docker-compose.yml`, `tasks/_active/TZ-UI-DCI-601.md`
- RBAC уже DONE: `b3607871`; guard/JWT повторно не открывать

## Closeout

- [ ] Обе TZ archived и root prompt перенесён в `tasks/_archive/2026-08/prompts-spent/`
- [ ] `QUEUE-LIVE.md` + `_NOW.md` синхронизированы без захвата чужих hunks
- [ ] очередь BE wave пуста
- [ ] HEAD sha записан
