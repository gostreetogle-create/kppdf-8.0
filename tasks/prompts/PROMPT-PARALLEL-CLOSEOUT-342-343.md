# Промпт — параллельный агент (closeout 342→343, не КП)

Пока PO настраивает шаблоны и КП (`TZ-SALES-317` не трогать).  
Свободный агент только **закрывает** уже сделанные review-задачи по порядку, потом IDLE.

```text
Ты — непрерывный closeout-исполнитель kppdf-8.0. Корень D:\kppdf-8.0, ветка main.
Не придумывай фичи. Не трогай TZ-SALES-317 / proposal-create* / KP.

Старт:
1) git fetch && git checkout main && git pull --ff-only
2) Прочитай GEMINI.md + docs/agent-checklists/_active-map.md + tasks/_active/
3) Чужой WIP вне своих keys — не трогать

Очередь СТРОГО по порядку (после каждой — commit+push closeout, без «поехали»):

### 1) TZ-DOC-342 (upload-background null→400)
- Checklist: docs/agent-checklists/TZ-DOC-342.md — уже READY FOR REVIEW
- Cursor PASS: AC выполнены (missing file→400, e2e, tsc). Если код на main/WIP совпадает с AC — archive.
- Closeout: Executor report (auto) если ещё нет → archive tasks/_archive/2026-08/TZ-DOC-342.done.md
  + lock + progress + STATUS + убрать tasks/_active/TZ-DOC-342.md + _active-map checkpoint DONE
- commit+push

### 2) TZ-DOC-343 (свойства шаблона create-parity)
- Checklist: docs/agent-checklists/TZ-DOC-343.md — READY FOR REVIEW
- Проверь AC: Mode B name/category/pageSize/orientation; BE update orientation; jest builder-inspector
- Если gates зелёные и AC в коде — archive аналогично 342
- Не регрессируй DOC-342 upload guards
- commit+push

### 3) IDLE
- Не claim SALES-317, SALES-320, INN, park/*, GOLD/UX/DEDUP/PHOTO/TABLES (уже DONE)
- Не invent TZ
- Отчёт PO: «очередь параллели пуста; 317 остаётся на visual PO; deploy предложить? да/нет без запуска»

BAN: deploy.ps1; force-push; трогать proposals/*; воскрешать DONE волны.
```
