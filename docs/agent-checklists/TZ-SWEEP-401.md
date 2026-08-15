# TZ-SWEEP-401 checklist

> Status: **DONE** (Cursor Verdict PASS; closeout complete)
> Archive: `tasks/_archive/2026-08/TZ-SWEEP-401.done.md`
> Lock: `.mimocode/locks/TZ-SWEEP-401-kanban-order-write-path.lock`
> Commit/push: по `docs/GIT-POLICY.md` (claimed executor: после gates/review обязательно)

## Claim slot (ОБЯЗАТЕЛЬНО до кода)

- agent_id: Buffy (freebuff)
- claimed_at: 2026-08-15T21:27:31Z
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (в этой сессии нет Team Room клиента; Claim slot — источник правды)

## Preflight

- [x] Get-Location + git rev-parse --show-toplevel → оба `D:\kppdf-8.0`
- [x] Прочитал `_NOW.md` + `tasks/_active/` — конфликтов нет (PHOTO-343 архивирован
      параллельно; `_active/` содержит только мой маркер)
- [x] TZ / канон / deps прочитаны (`tasks/TZ-SWEEP-401-kanban-order-logic-tails.md`,
      `docs/audits/2026-08-16-kanban-order-logic-sweep.md`, `docs/pages/dashboard.page.md`)
- [x] Claim slot заполнен; Status = CLAIMED / IN PROGRESS
- [x] `tasks/_active/TZ-SWEEP-401.md` на месте

## Acceptance

- [x] PATCH `{status:'shipped'|'cancelled'|'delivered'}` → 400 RU; заказ и
      shipmentIds/reservationIds не меняются (тест: 3 статуса, save не вызван).
- [x] PATCH `{status:'ready'}` из `in_production` → 200; состав не требуется.
- [x] `POST /orders/:id/ship` создаёт Shipment, `order.status=shipped`,
      все items.status=shipped (тест: shipmentModel.create + items shipped).
- [x] Канбан: дроп Черновик→В производстве → PATCH; дроп в Отгружены →
      confirm + POST ship; отказ/ошибка → карточка на месте + toast RU
      (spec: PATCH ready / ship POST / rollback 400 / confirm-cancel).
- [x] Старый заказ без `items[].status`: доска не падает; селект «Ожидает»;
      смена статуса пишет поле (spec readinessLabel + BE setItemStatus).
- [x] «X из Y» на карточке не плюсует readyForWork (spec: readyForWork не считается).
- [x] Сделки TOC: chip «Комбайн» → `/dashboard`. Складской «Дашборд» без изменений.
- [x] Форма заказа не даёт выбрать Отгружен/Отменён как Save-status (spec statusOptions).
- [x] Verification команды зелёные (ниже).

## Integrity slot (до READY / archive)

- [x] Тип изменения определён: **page** (dashboard) + **module** (order write-path)
- [x] FIC §A–E — N/A с обоснованием: изменения внутри существующих страниц/модулей,
      новых прав/страниц/MCP нет; guards/roles не менялись
- [x] page.md / PAGE-TZ-INDEX — уже заготовлены архитектором; сверено, лейблы совпали
      (`dashboard.page.md` канон статусов/API/nav; `PAGE-TZ-INDEX` строки `/dashboard` + `/orders`)
- [x] SECTION-READINESS — N/A (новых секций/волн нет)
- [x] Чужой WIP не в коммите; conflict keys соблюдены (PHOTO-343 WIP не тронут)
- [x] Канон: docs/DOCS-INTEGRITY.md

## Gates (факт)

- `cd backend && pnpm exec tsc -p tsconfig.build.json --noEmit` → **PASS**
- `cd backend && pnpm test -- order.service.spec` → **PASS** (42/42, +8 новых)
- `cd backend && pnpm exec eslint order.service.ts order.service.spec.ts` → **PASS**
- `cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit` → **PASS**
- `cd frontend && pnpm exec jest --testPathPattern "dashboard.page|orders.service.spec|order-form-dialog" --no-coverage` → **PASS** (37/37)
- Follow-up `cd frontend && pnpm exec jest src/app/pages/dashboard/dashboard.page.spec.ts --runInBand` → **PASS** (5/5; commit `7f81c949`)
- дополнительно: deals-group-chips + app-layout.nav-order → **PASS**; app-layout / orders.page /
  order-detail / production-cockpit 62/62 → **PASS**
- changed-file ESLint (FE) → **PASS**; Prettier --check → **PASS**; `git diff --check` → **PASS**

## Executor report

- **Backend:** `assertOrderStatusTransition` до freeze — PATCH-граф draft↔confirmed↔in_production↔ready;
  shipped/delivered/cancelled → 400 RU; из HARD_FROZEN только no-op. Freeze состава не режет
  status-only payload (исключён `status` из blocked keys). `ship()` проставляет `items[].status='shipped'`.
  `setItemStatus('shipped')` → 400 пока заказ не shipped/delivered; отсутствующий item.status = 'pending'.
- **FE:** `OrdersService.ship/cancel` (silentPost); Канбан: snapshot статусов → optimistic PATCH →
  `res.ok` → подстановка ответа, иначе откат + toast (эталон PRODUCTION-333); колонка «Отгружены» —
  confirm («Создать отгрузку по заказу №N? Появится документ отгрузки.») → POST /ship; Cancel не двигает
  карточку; `changeItemStatus` по `res.ok` + reload+toast на ошибке; `readinessLabel` только
  item.status (ready/shipped), без readyForWork. Форма: статус-селект = draft|confirmed|in_production|ready,
  shipped/delivered/cancelled — disabled-показ.
- **Нав:** DEALS_TOC_CHIPS — chip «Комбайн» → /dashboard первым; app-layout activeAliases + isDenseWorkspaceUrl
  + /dashboard; крошки «Сделки → /orders» + «Комбайн»; login-комментарий /dashboard.
- **Docs:** dashboard.page.md + PAGE-TZ-INDEX + фраза в orders.page.md уже заготовлены архитектором — сверены, правки не потребовались.
- **Conflict disclosure:** PHOTO-343 (Buffy, другая ветка) архивирована параллельно; её WIP
  (product/material forms, PAGE-TZ-INDEX, orders.page.md, _NOW.md) не тронут. PAGE-TZ-INDEX/orders.page.md
  оставлены без правок — строки уже аддитивно подготовлены архитектором.
- **Known limits:** `/shipping` stub, warehouse picker, авто-промоушен Order.status из линий — вне TZ (по spec).

## Review handoff

- [x] READY FOR REVIEW — write-path склада/отгрузки
- [x] Cursor Verdict PASS — independent review completed; no blockers

## Closeout

- [x] archive + lock + progress + удалить `_active`
- [x] Status = DONE
- closed_at: 2026-08-16T00:56:32+03:00

### Timestamps

| Поле | Когда |
|------|--------|
| `claimed_at` | 2026-08-15T21:27:31Z |
| READY FOR REVIEW date | 2026-08-15T21:39:25Z (после зелёных gates) |
| Cursor Verdict PASS | 2026-08-16 (independent review; 8/8 evidence PASS) |
| `closed_at` (archive) | 2026-08-16T00:56:32+03:00 |
