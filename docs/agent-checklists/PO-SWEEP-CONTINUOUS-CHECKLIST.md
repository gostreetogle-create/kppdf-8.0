# PO SWEEP CONTINUOUS — живой чеклист

> Executor **обязан** обновлять после **каждой** стадии (до claim следующей).  
> Resume = первая `PENDING` / `IN_WORK`.  
> Промпт: `tasks/PROMPT-CLAUDE-PO-SWEEP-CONTINUOUS.md`

updated_at: 2026-09-12T09:25:00+03:00  
agent_id: claude  
status: **READY** (волна выдана PO)  
wave: `docs/agent-checklists/WAVE-NX-PO-SWEEP-2026-09-12.md`

## Правило отметки

| Status | Когда |
|--------|--------|
| `IN_WORK` | Старт стадии (одна строка) |
| `DONE` | + SHA кода + ISO время |
| `SKIP` | + причина |
| `DEFERRED_TZ` | Глобальный коллапс / неоднозначность → написал `tasks/_ready/nx-po-sweep/deferred/TZ-….md` + строка в WAVE; **не** стоп волны |
| `BLOCKED` | Нужен wipe/deploy/PO business — **STOP** continuous + Executor report |

## Очередь (порядок исполнения)

| # | Stage | TZ | Status | SHA | stopped_at |
|---|-------|-----|--------|-----|------------|
| 00 | ops nx start cache (CI→Angular cache) | `tasks/_archive/2026-09/TZ-OPS-NX-START-CACHE.done.md` | DONE | `32a8d149` | 2026-09-12T09:35:00+03:00 |
| 01 | product Save silent invalid | `tasks/_archive/2026-09/TZ-NX-PO-SWEEP-01-product-save-silent.done.md` | DONE | `95a844df` | 2026-09-12T09:45:00+03:00 |
| 02 | studio table click=select/resize | `tasks/_archive/2026-09/TZ-NX-PO-SWEEP-02-studio-table-click-resize.done.md` | DONE | `8b5cf552` | 2026-09-12T09:55:00+03:00 |
| 03 | studio props outside close | `tasks/_archive/2026-09/TZ-NX-PO-SWEEP-03-studio-props-outside-close.done.md` | DONE | `db3e4b4c` | 2026-09-12T10:05:00+03:00 |
| 04 | studio data vitrina thumbs+height | `tasks/_archive/2026-09/TZ-NX-PO-SWEEP-04-studio-data-vitrina-thumbs.done.md` | DONE | `5517da3e` | 2026-09-12T10:20:00+03:00 |
| 05 | studio table photo frame+controls | `tasks/_archive/2026-09/TZ-NX-PO-SWEEP-05-studio-table-photo-frame.done.md` | DONE | `1c32f6a8` | 2026-09-12T10:40:00+03:00 |
| 06 | studio WYSIWYG editor=preview=PDF | `tasks/_ready/nx-po-sweep/06-studio-wysiwyg-preview/TZ-NX-PO-SWEEP-06-studio-wysiwyg-preview.md` | PENDING | — | — |
| 07 | studio chrome-rail Document menu | `tasks/_ready/nx-po-sweep/07-studio-chrome-rail-categories/TZ-NX-PO-SWEEP-07-studio-chrome-rail-categories.md` | PENDING | — | — |

## Deferred (находки mid-wave → вопрос Cursor)

| ID | Path | from_stage | note |
|----|------|------------|------|
| — | — | — | — |

## Финал

Все #00–#07 DONE/SKIP/DEFERRED_TZ → `status: COMPLETE` · `_NOW` Claude IDLE · WAVE sync · Executor report таблица #→SHA.
