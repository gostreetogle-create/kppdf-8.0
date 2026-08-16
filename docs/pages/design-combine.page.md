# Страница: Комбайн (`/design/combine`) — ряды изделий + mini-kanban

**Краткое описание:** Доска **изделий** (позиций заказа) в Проекте. Не склад `/inventory`,
не Обзор `/dashboard`. Layout V1 (TZ-COMBINE-409): **горизонтальный ряд = OrderItem**,
sticky шапка стадий (`boardLane`), раскрытие → мини-комбайн 5 ячеек с чипами модулей.
Create/delete досок нет. Write-path отгрузки = SWEEP-401 `POST /ship` (целый заказ).

## Routes

```
/design/combine — Комбайн
```

`pageKey`: `orders`. Компонент: `DashboardPage` (lazy).

## Стадии (boardLane) — sticky header

| Колонка | boardLane | Helper |
|---------|-----------|--------|
| Комплектация | `prep` | Состав / модули / материалы — к чертежу |
| Проектирование | `design` | Чертежи, виды работ, сроки |
| В цехе | `shop` | План на Ганте; вход только при workType + days (COMBINE-408); первый вход → freeze состава |
| К отгрузке | `to_ship` | Готово к документам |
| Отгружены | `shipped` | Только отгрузка **целого** заказа (не PATCH lane) |

Шапка: grid `1fr`×5, без horizontal scroll доски.

## Ряды (TZ-COMBINE-409)

- Один ряд = одно изделие (`OrderItem` + `lineId`), на всю ширину.
- Свёрнутый: № заказа · имя · qty · ▸ · **5 индикаторов** (сегмент active = модуль в lane / effective lane без модулей).
- Expand (accordion `expandedKey`): под рядом grid 5 ячеек; вертикальные hairline; чипы модулей.
- DnD CDK **только** между 5 ячейками **этого** `lineId` (`${card.key}::lane`); не между изделиями.
- Без модулей: чип «Изделие целиком» в effective lane (polish → COMBINE-410).
- Бейдж № заказа; фильтр по `orderId`; KPI-карточки сверху (Order.status) — без изменений.
- `Order.status` на доске не колонка — **rollup** (см. COUPLING-MAP §2).
- `OrderItem.status` = дериват lane (не перегружать enum prep/design).

## Couplings

Канон: [`docs/COUPLING-MAP.md`](../COUPLING-MAP.md).

## API (WAVE)

| Метод | Endpoint | Когда |
|-------|----------|--------|
| GET | `/api/orders` | данные доски (flat item rows + filter) |
| PATCH | `/api/orders/:id/lines/:lineId/lane` | DnD «изделие целиком» / legacy line move; optimistic + rollback |
| PATCH | `/api/orders/:id/lines/:lineId/modules/:moduleId/lane` | DnD чипа модуля в ячейке ряда |
| POST | `/api/orders/:id/ship` | дроп в «Отгружены» когда все линии `to_ship`/`shipped` → confirmShip |

Legacy: `PATCH .../items/:i/status` — не расширять новыми значениями.

**TZ-COMBINE-405/408:** freeze на первый shop; ship-whole gate; shop entry требует workType+days.

**TZ-COMBINE-409:** column-kanban → product rows + scoped mini-kanban. Semantics `boardLane`/`moduleLanes` без изменений.

## Навигация

Проект: Комбайн первым, Очередь вторым; `entryPath` = `/design/combine` (TZ-NAV-305).

## Связанные TZ

**COMBINE-401…408** · **409** product rows · **410** polish (park) · SWEEP-401 ship · NAV-303/305 · DASHBOARD-401 home widgets — не здесь
