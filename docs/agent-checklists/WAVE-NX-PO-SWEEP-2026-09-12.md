# WAVE-NX-PO-SWEEP-2026-09-12 — находки PO → цепочка FIX

updated_at: 2026-09-12T12:50:00+03:00  
status: **COMPLETE**  
agent: claude  
prompt: `tasks/PROMPT-CLAUDE-PO-SWEEP-CONTINUOUS.md`  
checklist: `docs/agent-checklists/PO-SWEEP-CONTINUOUS-CHECKLIST.md`

## Порядок исполнения (00→07)

| # | ID | Severity | Status | TZ |
|---|----|----------|--------|-----|
| 00 | ops-nx-start-cache | S ops | DONE `32a8d149` | `tasks/_archive/2026-09/TZ-OPS-NX-START-CACHE.done.md` |
| 01 | product-save-silent | P0 | DONE `95a844df` | `tasks/_archive/2026-09/TZ-NX-PO-SWEEP-01-product-save-silent.done.md` |
| 02 | studio-table-click-resize | P0 | DONE `8b5cf552` | `tasks/_archive/2026-09/TZ-NX-PO-SWEEP-02-studio-table-click-resize.done.md` |
| 03 | studio-props-outside-close | P1 | DONE `db3e4b4c` | `tasks/_archive/2026-09/TZ-NX-PO-SWEEP-03-studio-props-outside-close.done.md` |
| 04 | studio-data-vitrina-thumbs | P1 | DONE `5517da3e` | `tasks/_archive/2026-09/TZ-NX-PO-SWEEP-04-studio-data-vitrina-thumbs.done.md` |
| 05 | studio-table-photo-frame | P1 | DONE `1c32f6a8` | `tasks/_archive/2026-09/TZ-NX-PO-SWEEP-05-studio-table-photo-frame.done.md` |
| 06 | studio-wysiwyg-preview | P0 | DONE `188bebb8` | `tasks/_archive/2026-09/TZ-NX-PO-SWEEP-06-studio-wysiwyg-preview.done.md` |
| 07 | studio-chrome-rail-categories | P1 | DONE `6470660c` (+follow-up `a91342ff`) | `tasks/_archive/2026-09/TZ-NX-PO-SWEEP-07-studio-chrome-rail-categories.done.md` |

Post-wave live smoke (`scripts/po-sweep-2026-09-12-smoke.mjs`, Chrome CDP over
#02-#07 on a running `node start.mjs --nx`): 13/13 PASS. Found + fixed one
visual bug DOM tests couldn't catch (popover clipped by `.shell-rail`'s
`overflow-x:hidden`) — see `a91342ff` and checklist §Post-wave live smoke.

## Почему такой порядок

00 независимый ops → быстрее последующие smoke.  
01 разблокирует сохранение фото.  
02→03 клик/resize затем outside-dismiss.  
04 витрина.  
05 frame в ячейке → 06 общий WYSIWYG CSS (после frame).  
07 chrome IA в конце (меньше thrash editor setTools).

## Фон (не в волне)

Orphan uploads wipe · `/production` · deploy — PARK.

## Backlog (найдено при #01, не scope этой волны)

Тот же silent-invalid `form.invalid { markAllAsTouched(); return; }` без toast/focus
есть в `category-form-dialog`, `material-form-dialog`, `module-form-dialog`,
`unit-form-dialog`, `work-type-form-dialog`, `worker-form-dialog`,
`simple-registry-form-dialog.component.ts`. TZ-01 чинил только product-form —
остальные оставлены по прямой инструкции TZ («не scope creep»). Backlog для
следующей волны: применить тот же паттерн (`errorMessage` + `fieldError` +
focus/scroll первого invalid), если PO подтвердит приоритет.

## Запреты

wipe; deploy без PO; Гант; параллель двух FIX на kppdf-web.
