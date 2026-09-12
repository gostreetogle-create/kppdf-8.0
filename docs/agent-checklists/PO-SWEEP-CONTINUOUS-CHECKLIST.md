# PO SWEEP CONTINUOUS — живой чеклист

> Executor **обязан** обновлять после **каждой** стадии (до claim следующей).  
> Resume = первая `PENDING` / `IN_WORK`.  
> Промпт: `tasks/PROMPT-CLAUDE-PO-SWEEP-CONTINUOUS.md`

updated_at: 2026-09-12T12:50:00+03:00  
agent_id: claude  
status: **COMPLETE**  
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
| 06 | studio WYSIWYG editor=preview=PDF | `tasks/_archive/2026-09/TZ-NX-PO-SWEEP-06-studio-wysiwyg-preview.done.md` | DONE | `188bebb8` | 2026-09-12T11:05:00+03:00 |
| 07 | studio chrome-rail Document menu | `tasks/_archive/2026-09/TZ-NX-PO-SWEEP-07-studio-chrome-rail-categories.done.md` | DONE | `6470660c` (+follow-up `a91342ff`) | 2026-09-12T11:25:00+03:00 |

## Deferred (находки mid-wave → вопрос Cursor)

| ID | Path | from_stage | note |
|----|------|------------|------|
| — | — | — | — |

## Post-wave live smoke (после #07, до финала)

`scripts/po-sweep-2026-09-12-smoke.mjs` — Chrome CDP смоук #02–#07 на живом
`node start.mjs --nx`, headless Chrome, реальный документ через API.
13/13 PASS. Нашёл 1 визуальный баг, который DOM-тесты не ловят (querySelector
находит элемент независимо от CSS-обрезки): popover «Документ» рендерился
`position:absolute` внутри `.shell-rail` (`overflow-x:hidden`) — визуально
обрезался невидимым сразу за 32px рельса. Пофикшено в том же коммите-хвосте
(`a91342ff`, `position:fixed` + координаты от `getBoundingClientRect()`
триггера) — повторный смоук 13/13 PASS, скриншот подтверждает popover
корректно виден.

## Финал

Все #00–#07 DONE. `status: COMPLETE`. Backlog (не в scope волны, записан в
`WAVE-NX-PO-SWEEP-2026-09-12.md` §Backlog): тот же silent-invalid паттерн
в category/material/module/unit/work-type/worker/simple-registry form
dialogs — только `product-form-dialog` чинился в #01 по прямой инструкции TZ.
