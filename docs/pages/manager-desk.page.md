# Страница: Рабочий стол менеджера (`ManagerDeskPage`)

**Краткое описание:** дом после входа — очередь заказов с **expand-in-row** tray
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
| `panel` | flyout: `create` \| `filter` \| `summary` \| `client` \| `bom` \| `docs` \| `supply` \| `notebook` (408) |
| `view` | `desk` (default) \| `gantt` \| `combine` (407) |

## UI (rev.2 + chrome parity 406)

- **Одна** sticky строка `app-pi-group-workspace` + `desk-workflow-chips`:
  - Chips: **Стол** · **КП** · **Комбайн** · **Гант** · **Снабжение** · **Отгрузка** (без Каталог/Клиенты/Справ./Админ/Документы/список Заказов); Гант — stub `?view=gantt` до 407.
  - При expand: suffix `/ З-1001` в tools-слоте **той же** sticky chrome-строки — **без** «Рабочий стол» (brand-home уже SoT).
  - Канон: [`page-chrome.md`](./page-chrome.md) § Рабочий стол.
- Dense main (`isDenseWorkspaceUrl`).
- **Центр:** scrollable queue; **expand tray под строкой** (не блок ниже списка).
- Tray: группы как `/orders` expand — Заказ, Исполнение, Комбайн-strip, Состав, inline CTA.
- **L flyout** (create/filter/summary) · **R flyout** (client/bom/docs/supply).
- Правый rail — дубль; primary actions предпочтительно в tray.
- **Блокнот** (408): колонка или `panel=notebook`; anchor order/line/module.

### 401 (legacy, superseded by 405)

Fixture, innards под очередью, один R flyout — заменить в 405.

## Couplings

[`docs/COUPLING-MAP.md`](../COUPLING-MAP.md) — `Order.status`, `boardLane` в combine-strip.

## Связанные TZ

| ID | Статус |
|----|--------|
| DESK-401 | DONE |
| DESK-405 | layout rev.2 — DONE |
| **DESK-406** | chrome parity — **DONE** |
| DESK-402 | форма + API (после PO ok) |
| DESK-403 | состав + combine в tray |
| DESK-404 | deep-link студии |
| DESK-407 | crumbs + view=gantt/combine |
| DESK-408 | блокнот DeskNote |
