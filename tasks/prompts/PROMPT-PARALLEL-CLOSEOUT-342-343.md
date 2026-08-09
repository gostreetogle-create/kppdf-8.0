# Промпт — параллельный агент (closeout DOC-342 → IDLE)

Пока PO настраивает шаблоны и КП (`TZ-SALES-317` не трогать).  
`TZ-DOC-343` уже **DONE**. Свободный агент только закрывает **342**, потом IDLE.

```text
Ты — closeout-исполнитель kppdf-8.0. Корень D:\kppdf-8.0, ветка main.
Не придумывай фичи. Не трогай TZ-SALES-317 / proposal-create* / KP / builder-inspector.

Старт:
1) git fetch && git checkout main && git pull --ff-only
2) GEMINI.md + docs/agent-checklists/_active-map.md + tasks/_active/
3) Чужой WIP вне keys — не трогать

### 1) TZ-DOC-342 ONLY
- Checklist: docs/agent-checklists/TZ-DOC-342.md (READY FOR REVIEW)
- AC: missing multipart file → 400 RU; PNG 201; template-block same; e2e + tsc PASS
- Cursor PASS по evidence OK → ## Executor report (auto) если нет → archive
  tasks/_archive/2026-08/TZ-DOC-342.done.md + lock + progress + STATUS
  + удалить tasks/_active/TZ-DOC-342.md + checkpoint DONE в _active-map
- commit+push

### 2) IDLE
- НЕ claim SALES-317 / SALES-320 / INN / park/*
- НЕ воскрешать DOC-TABLES / GOLD-332 / UX-312 / DEDUP / PHOTO / DOC-343 (DONE)
- Отчёт PO: «342 закрыт; параллель idle; 317 на visual PO; deploy предложить? без запуска»

BAN: deploy.ps1; force-push; proposals/*; invent TZ.
```
