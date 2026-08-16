# TZ-PRODUCTION-337.done — Workshop «Все активные» exclude draft

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-16T09:50:00Z
closed_by: cursor-closeout (Cursor Verdict PASS)
TZ: TZ-PRODUCTION-337
WAVE: order-status coupling (workshop ACTIVE)
DEP: docs/COUPLING-MAP.md §2 canon
Cursor_verdict: PASS

verification:
  - acceptance criteria: PASS
  - typecheck: PASS (`pnpm exec tsc -p tsconfig.app.json --noEmit`)
  - tests: PASS (gantt-bar.model | production-cockpit.page | orders-rail — 3 suites / 53 tests)
  - checklist: DONE
  - progress.md: UPDATED
  - status synchronization: PASS
  - deploy: NOT RUN

## Outcome

- `ACTIVE_COMMERCIAL_ORDER_STATUSES` = `confirmed` / `in_production` / `ready` (без `draft`).
- Цех `/production` «Все активные» больше не показывает черновики Комбайна.
- Docs: `production-cockpit.page.md`, `dashboard.page.md`, `orders.page.md` Couplings; `COUPLING-MAP.md` код = канон §2; `PAGE-TZ-INDEX` **PRODUCTION-337 DONE**.
- known_limitation: `?orderId=` на draft по-прежнему показывает выбранный (selected bypass).

## Verification

- `frontend` `tsc -p tsconfig.app.json --noEmit`: PASS
- `frontend` jest `--testPathPattern="gantt-bar.model|production-cockpit.page|orders-rail"`: PASS — 3 suites / 53 tests
- deploy: NOT RUN

## Files

- `frontend/src/app/pages/production/gantt-bar.model.ts`
- `frontend/src/app/pages/production/gantt-bar.model.spec.ts`
- `frontend/src/app/pages/production/blocks/orders-rail.component.spec.ts`
- `docs/pages/production-cockpit.page.md`
- `docs/pages/dashboard.page.md`
- `docs/pages/orders.page.md`
- `docs/COUPLING-MAP.md`
- `docs/pages/PAGE-TZ-INDEX.md`
- `docs/agent-checklists/TZ-PRODUCTION-337.md`

## Lock

`.mimocode/locks/TZ-PRODUCTION-337-workshop-exclude-draft.lock`

## known_limitation

- Deep-link `?orderId=` на draft-заказ по-прежнему показывает его через selected bypass. Не чинить в этом TZ.

---

# Full TZ body (source)

# TZ-PRODUCTION-337: Цех «Все активные» без черновиков

РОЛЬ АГЕНТА: Frontend (Angular production cockpit)
ЗАВИСИМОСТИ: Нет (канон уже в `docs/COUPLING-MAP.md`; код ещё врёт)
LAYER: 3
CONFLICT KEYS: frontend/src/app/pages/production/gantt-bar.model.ts; frontend/src/app/pages/production/gantt-bar.model.spec.ts; frontend/src/app/pages/production/production-cockpit.page.spec.ts; frontend/src/app/pages/production/blocks/orders-rail.component.spec.ts; docs/pages/production-cockpit.page.md; docs/COUPLING-MAP.md; docs/pages/PAGE-TZ-INDEX.md; docs/agent-checklists/TZ-PRODUCTION-337.md

PAGES: /production ; /dashboard
PAGE_DOCS: production-cockpit.page.md ; dashboard.page.md

Проверено: `gantt-bar.model.ts` L14–19 ACTIVE включает `draft`; `dashboard.page.ts` колонка Черновики = `draft` + PATCH status; `filterOrdersForRail` activeOnly; `docs/COUPLING-MAP.md` §2; audit `docs/audits/2026-08-16-order-status-coupling.md`.
Dictation: «в цехе в работе» = заказ виден при default «Все активные», не путать с `OrderItem.status` «В работе».

═══════════════════════════════════════════════════════════════
ИСХОДНОЕ СОСТОЯНИЕ
═══════════════════════════════════════════════════════════════

1. Комбайн `/dashboard`: дроп в «Черновики» пишет `Order.status='draft'` (`PATCH /api/orders/:id`). Запись живая.

2. Цех `/production`: чекбокс «Все активные» (`ctx.activeOnly`, default true) вызывает `filterOrdersForRail` → `isActiveCommercialOrderStatus`. Константа:

```ts
ACTIVE_COMMERCIAL_ORDER_STATUSES = ['draft', 'confirmed', 'in_production', 'ready']
```

Файл: `frontend/src/app/pages/production/gantt-bar.model.ts` (комментарий L5 тоже врёт).

3. Тест `gantt-bar.model.spec.ts` «rail filter keeps selected completed order…» ожидает, что единственный видимый при activeOnly — заказ `draft` (`_id: '1'`). Это закрепляет баг.

4. Канон смысла: `docs/COUPLING-MAP.md` §2 — `draft` не работа цеха. `confirmed` остаётся в плане/Ганте.

═══════════════════════════════════════════════════════════════
ЧТО ДЕЛАТЬ
═══════════════════════════════════════════════════════════════

ШАГ 1: Константа активных цеха

В `gantt-bar.model.ts` убрать `'draft'` из `ACTIVE_COMMERCIAL_ORDER_STATUSES`.
Итог ровно: `'confirmed' | 'in_production' | 'ready'`.
Комментарий lock A/C: ACTIVE = confirmed/in_production/ready (draft = Комбайн «Черновики», не цех).

Не трогать `ORDER_STATUS_LABELS` (семь статусов остаются). Не трогать `isHardFrozenOrderStatus`.

ШАГ 2: Тесты фильтра

- Спека «exposes exactly four active…» → три значения, без `draft`.
- Спека rail filter: в фикстуре добавь живой `confirmed` (например `_id:'5'`). При `activeOnly:true` и `selectedOrderId:null` виден он, **не** `draft`. `draft` скрыт. `shipped`/`cancelled` скрыты. `isActive:false` скрыт.
- `selectedOrderId` на `cancelled` по-прежнему показывает выбранный + активные (без draft).
- Прочие спеки, где `status:'draft'` стоит как «видимый в цехе по умолчанию» (`production-cockpit.page.spec.ts`, `orders-rail.component.spec.ts`) — смени фикстуру на `confirmed` **только если** тест проверяет default-visible rail/Gantt. Фикстуры «заказ существует в списке API» можно оставить draft.

ШАГ 3: Docs той же TZ

- `docs/pages/production-cockpit.page.md`: «Все активные» = confirmed/in_production/ready; **не** draft. Ссылка на `docs/COUPLING-MAP.md`.
- `docs/COUPLING-MAP.md` §2: убрать пометку «код ещё содержит draft / баг»; написать «код = канон (TZ-PRODUCTION-337)».
- `docs/pages/PAGE-TZ-INDEX.md`: строка `/production` += **PRODUCTION-337 DONE** (после closeout; пока READY в шапке работы).
- Couplings в `production-cockpit.page.md` (короткая таблица: `Order.status` → Комбайн колонки / этот фильтр).

ШАГ 4: Gates + closeout

Checklist по `_TEMPLATE.md` с Claim slot **до кода**. Integrity slot: тип other/page; Coupling map обновлён.

═══════════════════════════════════════════════════════════════
ИЗМЕНЯТЬ / НЕ ИЗМЕНЯТЬ
═══════════════════════════════════════════════════════════════

ИЗМЕНЯТЬ:
- `frontend/src/app/pages/production/gantt-bar.model.ts` — ACTIVE set
- `frontend/src/app/pages/production/gantt-bar.model.spec.ts` и затронутые production specs
- `docs/pages/production-cockpit.page.md`
- `docs/COUPLING-MAP.md` (строка кода vs канон)
- `docs/pages/PAGE-TZ-INDEX.md`
- `docs/agent-checklists/TZ-PRODUCTION-337.md`

НЕ ИЗМЕНЯТЬ:
- `dashboard.page.ts` / колонки Комбайна / PATCH draft
- backend `order.service.ts` FSM (draft↔confirmed↔in_production↔ready остаётся)
- `OrderItem.status`, `readyForWork`, supply, reservations
- Гант layout / cascade / skip-without-modules (336)
- deploy

known_limitation: deep-link `?orderId=` на draft-заказ по-прежнему показывает его (selected bypass). Не чинить в этом TZ. Не авто-переводить статус при открытии цеха.

═══════════════════════════════════════════════════════════════
КРИТЕРИИ ПРИЁМКИ
═══════════════════════════════════════════════════════════════

1. `ACTIVE_COMMERCIAL_ORDER_STATUSES` === `['confirmed','in_production','ready']`.
2. `filterOrdersForRail(..., {activeOnly:true, selectedOrderId:null})` не возвращает `status==='draft'`.
3. `confirmed` / `in_production` / `ready` при activeOnly видны (если не `isActive===false`).
4. Комбайн по-прежнему может PATCH в `draft`; регрессии колонок нет (этот TZ не трогает dashboard).
5. page.md + COUPLING-MAP согласованы: draft ≠ цех «Все активные».
6. Integrity slot: Coupling map не N/A.

Verification:

```text
cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit
cd frontend && pnpm exec jest --testPathPattern="gantt-bar.model|production-cockpit.page|orders-rail" --no-coverage
```

Финализация: root `GEMINI.md` + archive `tasks/_archive/2026-08/TZ-PRODUCTION-337.done.md` после Cursor/PO PASS. `## Executor report (auto)` в checklist. Deploy нет.
