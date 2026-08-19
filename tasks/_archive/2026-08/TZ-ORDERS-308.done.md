═══════════════════════════════════════════════════════════════
TZ-ORDERS-308: Заказы — PATCH номера + soft-delete в списке
═══════════════════════════════════════════════════════════════

PAGES: /orders ; /desk
PAGE_DOCS: orders.page.md

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-19
closed_by: executor

result:
- Order schema: `deletedAt?: Date | null` (+ index).
- `update()`: assigns `number` (trim, non-empty, unique pre-check + E11000 → 409 «Номер уже занят»); allowed in plan-frozen statuses via PLAN_UPDATE_KEYS.
- `findAll`: `deletedAt: null`; `findById` / `findByIdRaw`: 404 when soft-deleted.
- `remove()`: sets `deletedAt` + `isActive: false`.
- Tests: PATCH number, duplicate 409, findAll filter, findById 404 deleted.
- Docs: orders.page.md DELETE + freeze number note.

verification:
  - acceptance criteria: PASS
  - typecheck: PASS (`pnpm exec tsc -p tsconfig.build.json --noEmit`)
  - tests: PASS (order.service.spec 78/78)
  - deploy/wipe: not run

process note: любой soft-delete → все list/find + schema field + test «удалённый не в списке».
