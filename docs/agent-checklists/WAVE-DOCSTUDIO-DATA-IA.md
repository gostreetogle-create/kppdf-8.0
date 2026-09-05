# WAVE — Doc Studio Data IA (панель «Данные»)

Status: **READY** · 2026-09-05  
Аудит: `docs/audits/2026-09-05-docstudio-data-panel-ia-audit.md`  
Промпт continuous: `tasks/PROMPT-FREEBUFF-DOCSTUDIO-DATA-IA.md` (выдать после polish Gantt P5 или параллельно Claude, не параллельно второму Freebuff на kppdf-web)

## Goal

Сделать «Данные» понятными менеджеру: категории → буфер «Выбрано» → «вставить на лист» совместимым блоком. Без нового write-path.

## Chain

- [x] **D50** `TZ-NX-DOCSTUDIO-D50-DATA-IA-SHELL` — TOC категорий внутри панели + KP-first порядок + RU copy → `tasks/_archive/2026-09/TZ-NX-DOCSTUDIO-D50-DATA-IA-SHELL.done.md`
- [x] **D51** `TZ-NX-DOCSTUDIO-D51-SELECTED-BUFFER` — вкладка/секция «Выбрано» (empty → active) → `tasks/_archive/2026-09/TZ-NX-DOCSTUDIO-D51-SELECTED-BUFFER.done.md`
- [x] **D52** `TZ-NX-DOCSTUDIO-D52-INSERT-SUGGEST` — CTA «Вставить на лист» из буфера (таблицы catalog-*) → `tasks/_archive/2026-09/TZ-NX-DOCSTUDIO-D52-INSERT-SUGGEST.done.md`
- [x] **D53** `TZ-NX-DOCSTUDIO-D53-PARTY-COPY` — «Кому / Связи / Ещё»: подписи, подсказки, демоут редкого → `tasks/_archive/2026-09/TZ-NX-DOCSTUDIO-D53-PARTY-COPY.done.md`
- [x] **D54** `TZ-NX-DOCSTUDIO-D54-DOCS-SMOKE` — page.md + короткий operator smoke checklist → `tasks/_archive/2026-09/TZ-NX-DOCSTUDIO-D54-DOCS-SMOKE.done.md`

**WAVE STATUS: DONE (D50–D54).**

## Hard rules

Conflict: в основном `studio-data-panel` / vitrina / editor insert helpers.  
LAST каждой: `nx build kppdf-web`.  
Не L1 Ганта. Не contracts. Не auto-insert без клика.
