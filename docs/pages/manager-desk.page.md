# Страница: Рабочий стол менеджера (`ManagerDeskPage`)

**Краткое описание:** дом после входа — **живая** очередь заказов (`GET /orders`) с **expand-in-row** tray
(как `/orders`), icon-rail + **L/R flyout**, одна sticky строка group-workspace chips вместо шапки-простыни.
Студии Гант/Комбайн — через workflow chips + `?view=` (407) или deep-link (404).

Канон IA: [`docs/superpowers/specs/2026-08-18-manager-desk-design.md`](../superpowers/specs/2026-08-18-manager-desk-design.md).

## Routes

```
/            — redirect → /desk
/desk        — «KPPDF — Стол»
/dashboard   — KPI «Обзор» (не дом)
```

`pageKey`: `orders`.

## Query

| Param | Значение |
|-------|----------|
| `orderId` | выбранный / раскрытый заказ (F5) |
| `panel` | flyout: `create` \| `edit` \| `filter` \| `summary` \| `client` \| `bom` \| `docs` \| `supply` \| `notebook` (408) |
| `view` | `desk` (default) \| `gantt` \| `combine` (407) |

## UI (rev.2 + chrome parity 406)

- **Одна** sticky строка `app-pi-group-workspace` + `desk-workflow-chips`:
  - Chips: **Стол** · **КП** · **Комбайн** · **Гант** · **Снабжение** · **Отгрузка** (без Каталог/Клиенты/Справ./Админ/Документы/список Заказов); Гант — stub `?view=gantt` до 407.
  - При expand: suffix `/ З-1001` в tools-слоте **той же** sticky chrome-строки — **без** «Рабочий стол» (brand-home уже SoT).
  - Канон: [`page-chrome.md`](./page-chrome.md) § Рабочий стол.
- Dense main (`isDenseWorkspaceUrl`).
- **Центр:** scrollable queue; **expand tray под строкой** (не блок ниже списка).
- Tray: группы как `/orders` expand — Заказ, Исполнение, Комбайн-strip, Состав, inline CTA.
  - **412:** один shared `order-hub-tray` (`mode="desk"`) — та же разметка, что `/orders` expand (`mode="hub"`), без форка шаблона.
- **L flyout** (create/filter/summary) · **R flyout** (edit/client/bom/docs/supply).
- **402:** `create`/`edit` хостит `order-form-panel` — один write-path с `/orders`; invalid `?orderId=` → RU toast + clear query.
- **412:** expand tray = `order-hub-tray` (shared с `/orders`); supply/docs/CTA — desk-события, tree+combine в 403.
- Правый rail — дубль; primary actions предпочтительно в tray.
- **Блокнот** (408): колонка или `panel=notebook`; anchor order/line/module.

### 401 (legacy, superseded by 405→402)

Fixture удалён в 402; очередь теперь живой `GET /orders`, форма — shared `order-form-panel`.

## Couplings

[`docs/COUPLING-MAP.md`](../COUPLING-MAP.md) — `Order.status`, `boardLane` в combine-strip.

## Связанные TZ

| ID | Статус |
|----|--------|
| DESK-401 | DONE |
| DESK-405 | layout rev.2 — DONE |
| **DESK-406** | chrome parity — **DONE** |
| **DESK-402** | форма + GET /orders — **DONE** |
| **DESK-412** | shared order-hub-tray — **DONE** |
| DESK-403 | состав + combine в tray |
| DESK-404 | deep-link студии |
| DESK-407 | crumbs + view=gantt/combine |
| DESK-408 | блокнот DeskNote |
