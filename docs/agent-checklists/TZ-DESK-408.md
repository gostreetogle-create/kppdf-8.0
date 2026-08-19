# TZ-DESK-408 checklist

| Field | Value |
|-------|-------|
| Status | DONE |
| TZ | `tasks/TZ-DESK-408.md` |
| Depends | 402 DONE; optional after 407/404 |

## Claim slot

- agent_id: buffy
- claimed_at: 2026-08-18T23:35:00+0300
- workspace: D:\kppdf-8.0

## Acceptance

- [x] DeskNote BE module + FE panel on /desk
- [x] backend + frontend tsc/tests PASS

## Executor report (auto)

- BE: `backend/src/modules/desk-note` — schema `DeskNote` (text required, kind note|checklist|reminder, anchorOrderId required, anchorLineId?, anchorModuleId?, authorId, isDone?, timestamps; indexes `{anchorOrderId, createdAt}` + `{anchorLineId}`), DTO, service (findAll by orderId/lineId/moduleId, create with author from JWT, update, hard remove), controller `GET/POST/PATCH/DELETE /desk-notes`, module registered in AppModule. 8 service tests PASS.
- FE: `shared/services/desk-notes.service.ts` (silent-* CRUD); L-flyout `panel=notebook` on /desk — список compact (текст, anchor badge, автор, дата), форма «+ заметка» (textarea + kind select + anchor select Заказ/линия изделия), checklist «готово» toggle, delete hard; filter по текущему expand; без раскрытого заказа — RU-подсказка. 2 spec tests PASS.
- COUPLING-MAP: строка `DeskNote.anchorOrderId`.
- known_limitation: module-якорь только в API (picker v2); напоминания без cron; rich-text v2.
