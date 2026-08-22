═══════════════════════════════════════════════════════════════
TZ-DESK-408: умный блокнот (DeskNote) — anchor order/line/module
═══════════════════════════════════════════════════════════════

PAGES: /desk
PAGE_DOCS: manager-desk.page.md

РОЛЬ АГЕНТА: Full-stack (BE module + FE panel). Root TZ. Freebuff или split BE/FE.

ЗАВИСИМОСТИ: TZ-DESK-402 DONE (живые id). После 405 layout ok.
**Не reuse** `Comment` (`packageTag` — другой домен).

LAYER: 2 (BE schema) + 3 (FE desk)

CONFLICT KEYS: backend/src/modules/desk-note/**; frontend/src/app/pages/desk/**; frontend/src/app/shared/services/desk-notes.service.ts

Проверено: PO — «быстро записать к заказу/изделию/модулю», фильтр, не личный календарь.
Существующих order-attached notes **нет**.

═══════════════════════════════════════════════════════════════
ЧТО ДЕЛАТЬ
═══════════════════════════════════════════════════════════════

ШАГ 1 — schema `DeskNote`
- Fields: `text` (required), `kind`: `note|checklist|reminder`, `anchorOrderId` (required),
  `anchorLineId?`, `anchorModuleId?`, `authorId`, `isDone?` (checklist), timestamps.
- Indexes: `{ anchorOrderId, createdAt }`, `{ anchorLineId }`.

ШАГ 2 — API
- `GET /desk-notes?orderId=` (optional lineId/moduleId filter)
- `POST /desk-notes`, `PATCH /desk-notes/:id`, `DELETE` soft or hard (PO: compact — hard ok v1)

ШАГ 3 — FE
- Колонка «Блокнот» слева в центре (collapsible) **или** flyout `panel=notebook` — выбрать
  более компактный вариант; PO предпочитает видеть рядом с очередью.
- «+ Заметка»: picker anchor (заказ / изделие строки / модуль из tree when 403 done).
- Список compact: текст, anchor badge, автор, дата; filter по текущему expand.

ШАГ 4 — gates
```
cd backend && pnpm exec tsc -p tsconfig.build.json --noEmit
cd backend && pnpm test -- desk-note
cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit
cd frontend && pnpm test -- --testPathPattern=desk-note|manager-desk
```

═══════════════════════════════════════════════════════════════
НЕ ИЗМЕНЯТЬ
═══════════════════════════════════════════════════════════════

- Comment module; push notifications; email reminders; deploy

КРИТЕРИИ ПРИЁМКИ
- Заметка создаётся и видна только в контексте заказа/линии/модуля.
- Один write-path CRUD. tsc + tests PASS. COUPLING-MAP строка DeskNote.

known_limitation: напоминания без cron; rich-text v2.
