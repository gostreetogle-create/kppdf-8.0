# TZ-NX-DOCSTUDIO-S10-OPERATOR-DOCS-SYNC: page.md + queue closeout

**РОЛЬ АГЕНТА:** Executor (docs only)  
**LAYER:** 1  
**PAGES:** document-studio  
**PAGE_DOCS:** `docs/pages/document-studio.page.md`  
**ЗАВИСИМОСТИ:** S10-DATA-PANEL-POLISH DONE (или parallel если не трогает те же файлы — **после** S10 polish если один агент)  
**CONFLICT KEYS:** `docs/pages/document-studio.page.md`; `tasks/QUEUE-LIVE.md`; `docs/agent-checklists/_NOW.md`; `tasks/WAVE-DOCSTUDIO-S8.md`

## ИСХОДНОЕ

- `document-studio.page.md` §7 всё ещё перечисляет S8 gaps как открытые (устарело).
- `QUEUE-LIVE.md` показывает S9-FINISH READY вместо DONE.

## ЧТО ДЕЛАТЬ

1. Обновить §7 «Не сделано» — снять закрытые S8/S9 пункты; оставить PARK: Ctrl+Z, Fit/zoom, per-page background (S8-4 limitation).
2. Добавить § «S9/S10» что работает: substitution, ERP table, vitrina, anchors partial→full after S10.
3. Sync `QUEUE-LIVE.md`, `_NOW.md`, `WAVE-DOCSTUDIO-S8-S9.md` status DONE + S10 if any.

## КРИТЕРИИ ПРИЁМКИ

1. §7 не ссылается на закрытые S8 TZ как OPEN.
2. QUEUE отражает S8+S9 DONE, S10 если в работе/готово.

## Финализация

Archive → `tasks/_archive/2026-09/TZ-NX-DOCSTUDIO-S10-OPERATOR-DOCS-SYNC.done.md`
