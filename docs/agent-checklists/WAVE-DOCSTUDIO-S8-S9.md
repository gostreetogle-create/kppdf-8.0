# WAVE checklist — Doc Studio S8→S9 (ведёт исполнитель)

> Промпт: `tasks/PROMPT-FREEBUFF-DOCSTUDIO-S8-S9-MASTER.md`  
> Старт: только если нет конфликта с DCI на `kppdf-web`.

Status: **IN_PROGRESS**  
agent_id: buffy (Freebuff continuous executor)  
started_at: 2026-08-31T22:40:00+03:00  
workspace: D:\kppdf-8.0 (main, не worktree)  
team_room_claim: unavailable (CLI отсутствует; claim slot заполнен)  
**RESUME:** пункт 1 (TZ S8-1 TEXT-SUBSTITUTION)

## Preflight

- [x] `git fetch origin && git merge origin/main` — Already up to date
- [x] `_active/` — пуст, чужих CLAIM на kppdf-web/studio нет
- [x] `nx build kppdf-web` baseline exit 0 (Nx cache, 5/5 tasks)
- [x] Claim slot заполнен (выше)

## S8 — подстановка

- [ ] 1. S8-1 TEXT-SUBSTITUTION — archive
- [ ] 2. S8-2 TABLE-ERP-BIND — archive
- [ ] 3. S8-3 LIST-TEMPLATES — archive
- [ ] 4. S8-4 PAGES-PANEL — archive

## S9 — контекст + витрина

- [ ] 5. S9-A ANCHORS-MODEL — archive
- [ ] 6. S9-B CATALOG-VITRINA (4 вкладки → таблица) — archive
- [ ] 7. S9-C TEMPLATE-BINDINGS-UX (dblclick) — archive

## Closeout

- [ ] QUEUE-LIVE + `_NOW.md` updated
- [ ] Status=DONE · отчёт PO

## PO rules (напоминание)

- Витрина → строки таблицы сразу
- Изделия | Модули | Детали (part) | Материалы
