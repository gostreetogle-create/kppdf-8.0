# WAVE-NX-PO-SWEEP-2026-09-12 — находки PO → цепочка FIX

updated_at: 2026-09-12T09:25:00+03:00  
status: **RUNNING_READY** — continuous выдан  
agent: claude  
prompt: `tasks/PROMPT-CLAUDE-PO-SWEEP-CONTINUOUS.md`  
checklist: `docs/agent-checklists/PO-SWEEP-CONTINUOUS-CHECKLIST.md`

## Порядок исполнения (00→07)

| # | ID | Severity | Status | TZ |
|---|----|----------|--------|-----|
| 00 | ops-nx-start-cache | S ops | DONE `32a8d149` | `tasks/_archive/2026-09/TZ-OPS-NX-START-CACHE.done.md` |
| 01 | product-save-silent | P0 | TZ_READY | `tasks/_ready/nx-po-sweep/01-product-save-silent/…` |
| 02 | studio-table-click-resize | P0 | TZ_READY | `…/02-studio-table-click-resize/…` |
| 03 | studio-props-outside-close | P1 | TZ_READY | `…/03-studio-props-outside-close/…` |
| 04 | studio-data-vitrina-thumbs | P1 | TZ_READY | `…/04-studio-data-vitrina-thumbs/…` |
| 05 | studio-table-photo-frame | P1 | TZ_READY | `…/05-studio-table-photo-frame/…` |
| 06 | studio-wysiwyg-preview | P0 | TZ_READY | `…/06-studio-wysiwyg-preview/…` |
| 07 | studio-chrome-rail-categories | P1 | TZ_READY | `…/07-studio-chrome-rail-categories/…` |

## Почему такой порядок

00 независимый ops → быстрее последующие smoke.  
01 разблокирует сохранение фото.  
02→03 клик/resize затем outside-dismiss.  
04 витрина.  
05 frame в ячейке → 06 общий WYSIWYG CSS (после frame).  
07 chrome IA в конце (меньше thrash editor setTools).

## Фон (не в волне)

Orphan uploads wipe · `/production` · deploy — PARK.

## Запреты

wipe; deploy без PO; Гант; параллель двух FIX на kppdf-web.
