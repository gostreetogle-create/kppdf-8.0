# Audit — NX Gantt: матрица переноса legacy → NX (порт L0)

**Дата:** 2026-09-04
**Волна:** `PROMPT-FREEBUFF-NX-GANTT-*` (G0–G7) · WAVE checklist: `docs/agent-checklists/WAVE-NX-PRODUCTION-GANTT.md`
**TZ:** `tasks/_ready/nx-gantt/TZ-NX-GANTT-G0-PORT-AUDIT.md`
**Режим:** audit only (docs + read-only legacy), без product-кода.

> SoT волны: `docs/ux/production-gantt-studio-spec.md` (FROZEN) +
> `docs/pages/production-cockpit.page.md`. Legacy читается как эталон,
> **не переписывается in-place**. L1–L6 (check-in, табель %/часов,
> авто-назначение, факт цеха, уведомления) — вне волны;
> `ProductionOrder`/`OrderTask` не создаются.

---

## 1. Общая картина

| Аспект | Legacy (`frontend/`) | NX (`frontend-nx/`) | Разрыв |
|---|---|---|---|
| Route `/production` | есть, `ProductionCockpitPage` | **нет** — `nav-categories.ts` уже объявляет `/production` (pageKey `production`, label «Гант»), но route отсутствует → чип скрыт `collectPageRoutePaths` | G1: добавить route + stub shell |
| Capability | `production:read` / `production:write` | `production:read` уже в `libs/data-access/src/lib/capabilities/capabilities.metadata.ts`; `production:write` — проверить/добавить при G5 (пишет через `production:write`) | G1/G5 |
| Chrome tools | `PiChromeToolsService` (app chrome rails) | **`ShellToolRailService`** (`layout/shell-tool-rail.service.ts`): `setTools(owner, {left, right})` / `clear(owner)` / `invoke`; эталон регистрации — `studio-editor.page.ts` (setTools on init, clear on destroy) | G1: регистрировать через ShellToolRailService, **не** PiChromeToolsService |
| Orders API | `OrdersService` (list/update/**patchEstimateDays**/**patchEstimateStart**) | `PiOrdersService` (`libs/data-access/src/lib/sales/pi-orders.service.ts`): `list()` / `getById()` / `create()` / `update()` (PATCH `/orders/:id`) — **estimate-методы отсутствуют** | G2: добавить `patchEstimateDays` / `patchEstimateStart` (+ types/specs) |
| Products/modules/work-types/workers | facade через сервисы/Http | есть данные-клиенты: `products-http-data-source`, `modules-http-data-source` и т.п.; work-types/workers — проверить наличие в G2 | G2: подключить существующие клиенты, не плодить новые |
| Стек | Angular signals + RxJS, OnPush | Angular 20 standalone, signals, OnPush, strict | порт 1:1 по сигналам |

---

## 2. File map: legacy → NX target

Целевой контур NX: `frontend-nx/apps/kppdf-web/src/app/pages/production/**`
(паттерн проекта: `pages/<домен>/<page>.<block>.ts`, тесты рядом `*.spec.ts`).

| # | Legacy файл | Роль | NX target (целевой) | G |
|---|---|---|---|---|
| 1 | `production-cockpit.page.ts` | Smart shell: reads, PATCH-оркестрация, chrome tools, фильтры, range/fit/today, скролл-команды | `pages/production/production-cockpit.page.ts` | G1 (stub) → G3/G4/G5 |
| 2 | `production-read.facade.ts` | Чтение/кэш/маппинг композиции; bars + warnings | `pages/production/production-read.facade.ts` | G2 |
| 3 | `gantt-bar.model.ts` | **Pure** модель: Order→Product→Module→WT, workers-группировка, skip сборка/упаковка, WHOLE_PRODUCT sentinel, estimate math | `pages/production/gantt-bar.model.ts` (+ `gantt-bar.model.spec.ts`) | G2 |
| 4 | `production-cockpit.context.ts` | Локальные UI-сигналы (selectedOrderId, search, activeOnly, zoom, filters, expanded*Ids, scrollRequest) | `pages/production/production-cockpit.context.ts` | G2 |
| 5 | `blocks/gantt-bars.component.ts` | Timeline: дерево, полосы, каскад meta/detail, zoom day/month, resize/drag, «По рабочим» | `pages/production/blocks/gantt-bars.component.ts` | G3 (+G4/G5/G6) |
| 6 | `blocks/orders-rail.component.ts` | Список заказов + поиск + фильтры (Counterparty, activeOnly, приоритет, даты, Сброс) | `pages/production/blocks/orders-rail.component.ts` | G3 |
| 7 | `blocks/production-scale-controls.component.ts` | Toolbar в шапке Ганта: группировка (По заказам/По рабочим), zoom День/Месяц/Вместить сроки | `pages/production/blocks/production-scale-controls.component.ts` | G3 (+G6) |
| 8 | `blocks/order-inspector.component.ts` | helpers `promptCatalogDaysChange` (sheet-хост удалён в TZ-322) | переносить только helpers, без bottom sheet | G3/G5 |
| 9 | `production-group-chips.ts` | Chips Цех / Гант / Виды работ (секция) | в NX уже есть паттерн `admin-group-chips.ts`; NX-group-chips по аналогии | G1 (если нужно оформить секцию) |
| 10 | spec-файлы (`.spec.ts` × 6) | Регрессия поведения (model, facade, page, bars, rail, scale) | порт/адаптация рядом с каждым файлом | G2/G3/G4 |
| 11 | (legacy layout nav) | `NAV_CATEGORIES` | уже в NX `layout/nav-categories.ts` (п. `/production` есть) | G1 |

Легенда G: этап волны, где файл появляется/допиливается.

---

## 3. UX checklist (1:1 с legacy, визуал не переизобретать)

| Пункт | Legacy-поведение (SoT) | Статус в NX | G |
|---|---|---|---|
| Дерево ▸ | Заказ (summary) → Изделие → Модуль → WT; expand keys `expandedProductIds` / `expandedModuleIds` / `expandedOrderIds` (session-scoped, F5 reset OK) | новый | G3 |
| ▸ крупно | chevron ▸/▾ ≥14–16px, колонка ≥36px (TZ-PRODUCTION-339); клик по всей строке label = expand | новый | G3 |
| Каскад meta | номер заказа → order-meta под summary (статус/важность/начало плана/ссылка `/orders?q=`); **одна** широкая полоса `gantt-cascade-panel`; только под summary | новый | G3 |
| Work-detail | клик/▸ WT → inline detail под строкой: люди, дни (PATCH estimate-days), override-hint, «в справочнике» (production:write); один detail, Esc/dismiss | новый | G3 |
| Zoom | День = 36px/день, тик `DD.MM` + ПН…ВС (UTC); Месяц = `max(12, floor(timelineWidth/dayCount))`, тики RU-месяцев; шапки `h-10` | новый | G3/G4 |
| Сегодня | всегда recenter красного маркера + pulse-ack, расширение range при необходимости (не silent no-op) | новый | G4 |
| Вместить сроки | padded min…max баров + Месяц + scroll к началу (не no-op) | новый | G4 |
| Фильтры | Заказчик (Counterparty `<select>`), active-only (confirmed/in_production/ready, **без draft**), приоритет, даты С/По; Сброс если dirty; chrome «Фильтры» active пока dirty | новый | G3 |
| По рабочим | Worker → Module(+контекст заказ·изделие·модуль) → WT; default collapsed; **read-only** (нет resize/body-drag); «Не назначен» группа + banner CTA `/people`; ФИО + summary tint dominant WT (`resolveWorkTypeHue`); milk fallback | новый | G6 |
| Сборка/Упаковка | модули/WT с именами, содержащими «сборк*/упаков*», скрыты из `buildGantBars` | перенести | G2 |
| Range/скролл | scrollRequest (target `today`|`fit`, monotonic nonce) + QA-445E pulse; адаптивная перестройка диапазона | новый | G4 |
| Dismiss | клик по пустой сетке / Esc → свернуть detail + meta + деревья | новый | G3 |
| Layout | Гант full width; flyouts overlay без reflow (тут нет A4-закона студии — полная ширина); ctx.selectedOrderId = null → «Все активные» | новый | G3 |

---

## 4. Известные баги пан/drag (для G4)

1. **«После сдвига заказа на более раннюю дату экран/диапазон не обновлялся»** (Боль PO, G4): plannedDate стал раньше min range → viewport/скролл «залипал» справа; нельзя нормально скроллить/двигать влево. Причина-гипотеза (legacy): range пересчитывается только на reload/fit, а после optimistic drag `applyFilteredActive` вызывается без принудительного range/scroll reconcile.
2. **Zoom/тики** (регрессионный контур): legacy чинил «н.32» → RU месяцы; День = 36px/день + ПН…ВС; «Вместить сроки»/«Сегодня» обязаны быть активными, не no-op (QA-445E: pulse-ack, когда scrollLeft не может двинуться).
3. **Контекст скролла**: скролл-команды идут сигналом monotonic nonce (`scrollRequest: {target, nonce}`) — после сдвига баров команда «сдвинуться к новой дате» должна обновить range **и** viewport.
4. **Пан/drag без «залипания»**: после сдвига на раннюю дату viewport должен включить новую дату (spec на G4: after shift startDate earlier than min range → range/scroll include new date).
5. (legacy audit `2026-08-15-gantt-bar-resize-drag-audit`) — архитектурные причины «нельзя просто нарисовать ручки»: write-path в каталог, нет SoT полосы, ACL дыра — на NX-порте сохранить order-level override только (заказ, не каталог).

---

## 5. API-контракты (использовать только существующие)

| Метод | Endpoint | Назначение | NX | G |
|---|---|---|---|---|
| GET | `/api/orders` | Список коммерческих заказов | `PiOrdersService.list()` | G2 |
| GET | `/api/products/:id` | Изделие + composition (dual-read) | data-access products client | G2 |
| GET | `/api/modules/:id` | Модуль + workTypes | data-access modules client | G2 |
| GET | `/api/work-types` | Справочник дней (`days`) | data-access work-types (проверить наличие; иначе добавить client-only) | G2 |
| GET | `/api/workers?limit=100&isActive=true` | Лейблы людей по workType (BE `@Max(100)`) | data-access workers (проверить) | G2/G6 |
| PATCH | `/api/orders/:id` | plannedDate/priority (meta, summary-drag) | `PiOrdersService.update(id, payload)` — уже есть | G5 |
| PATCH | `/api/orders/:id/estimate-days` | Override дней вида работ заказа (resize) | **добавить** `patchEstimateDays` | G2 (клиент) → G5 (UI) |
| PATCH | `/api/orders/:id/estimate-start` | Offset старта работы заказа (body-drag) | **добавить** `patchEstimateStart` | G2 (клиент) → G5 (UI) |
| PATCH | `/api/work-types/:id` | Каталог days «для всех заказов» — только явный confirm | существующий work-types client (не менять) | G5 |

Write-path matrix FE: summary drag → `canEditOrder` (admin|manager); child resize/start → `production:write`; meta auto-save (plannedDate/priority) → `canEditOrder`; после успеха — optimistic локальные бары, без полного reload.

---

## 6. NX gaps (что достроить по ходу волны)

1. **Route `/production`** — нет в `app.routes.ts` → чип «Гант» скрыт. G1: lazy route + capabilities `production:read` (данные уже в metadata).
2. **Chrome tools** — NX `ShellToolRailService` (`layout/shell-tool-rail.service.ts`), эталон `studio-editor.page.ts`. PiChromeTools (legacy) не переносить.
3. **PiOrdersService** — не имеет `patchEstimateDays`/`patchEstimateStart` (legacy `OrdersService` имеет). G2: добавить методы + types/specs.
4. **Work-types / workers data-access** — проверить наличие клиентов в `libs/data-access`; отсутствие — add в G2 (client-only, BE не менять).
5. **Capability `production:write`** — проверить метаданные capabilities в `capabilities.metadata.ts`; нужна для G5 resize-гатов.
6. **Estimate `?orderId=` / `?from=desk`** — legacy поддерживает deep-links; G1 заложить чтение query-параметров, G2/G3 — логика select (unknown id → RU hint + fallback).
7. **Скролл-контракт legacy** (`scrollRequest` + nonce + pulse) — перенести в контекст на NX (G2/G4), чтобы G4 регал QA-445E-pulse.

---

## 7. НЕ (границы)

- Не переписывать legacy `frontend/src/app/pages/production/**` in-place.
- Не создавать ProductionOrder/OrderTask/факт-цеха; не менять BE schema.
- Не табель %/часов; не авто-сварщик; не L1–L6.
- Не Doc Studio / S37 (отдельная волна).
- ROI: визуал не переизобретать — цель parity с legacy глазами PO.