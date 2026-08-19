═══════════════════════════════════════════════════════════════
TZ-DESK-408: умный блокнот (DeskNote) — anchor order/line/module
═══════════════════════════════════════════════════════════════

PAGES: /desk
PAGE_DOCS: manager-desk.page.md

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-18
closed_by: Buffy/codebuff-freebuff

result:
- BE module `backend/src/modules/desk-note/`:
  - schema `DeskNote` (collection `desknotes`, timestamps): text (required, ≤4000), kind (`note|checklist|reminder`), anchorOrderId (required ObjectId→Order), anchorLineId? (string — productId/lineId), anchorModuleId? (ObjectId→ProductModule), authorId (ObjectId→User), isDone?; indexes `{anchorOrderId, createdAt}` (desknotes_order_created) + `{anchorLineId}` (desknotes_line).
  - service: findAll(orderId/lineId/moduleId filters, createdAt desc, limit 200), create(author from JWT, trims text, validates ids), update(text/kind/isDone), remove = hard delete (PO: compact). 8 unit tests.
  - controller `GET/POST/PATCH/DELETE /desk-notes` with @Roles(admin,director,manager,user) + AuditAction; module registered in AppModule.
- FE:
  - `shared/services/desk-notes.service.ts` — silent-* CRUD.
  - L-flyout `panel=notebook` on /desk: compact list (text, anchor badge «Заказ»/productName, author, date), «+ заметка» form (textarea + kind select + anchor select Заказ/линия изделия), checklist «готово» checkbox, «Удалить» hard; loads notes for the currently expanded order (effect) — notes visible only in order context; no expanded order → RU hint. Chrome tool «Блокнот» (Notebook icon) added to left rail.
- COUPLING-MAP: row `DeskNote.anchorOrderId`.

known_limitation:
  - module-якорь только в API (FE picker v2)
  - напоминания без cron; rich-text v2

verification:
  - acceptance criteria: PASS
  - backend typecheck: PASS (`pnpm exec tsc -p tsconfig.build.json --noEmit`, exit 0)
  - backend tests: PASS (desk-note 8/8)
  - frontend typecheck: PASS (`pnpm exec tsc -p tsconfig.app.json --noEmit`, exit 0)
  - frontend tests: PASS (manager-desk 18/18 incl. 2 new 408)
  - lint: PASS (eslint changed FE files, 0 errors)
  - checklist: DONE
  - deploy/wipe: not run (VPN off)

commit: pending
