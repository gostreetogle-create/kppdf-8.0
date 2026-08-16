# Страница: Комбайн (`/design/combine`) — канбан изделий

**Краткое описание:** Доска **изделий** (позиций заказа) в Проекте. Не склад `/inventory`,
не Обзор `/dashboard`. Колонки = `OrderItem.boardLane` (TZ-COMBINE-401+). Create/delete
досок нет. Write-path отгрузки = SWEEP-401 `POST /ship` (целый заказ).

## Routes

```
/design/combine — Комбайн
```

`pageKey`: `orders`. Компонент: `DashboardPage` (lazy).

## Колонки (boardLane)

| Колонка | boardLane | Helper |
|---------|-----------|--------|
| Комплектация | `prep` | Состав / модули / материалы — к чертежу |
| Проектирование | `design` | Чертежи, виды работ, сроки |
| В цехе | `shop` | План на Ганте; вход только при workType + days (COMBINE-408); первый вход → freeze состава |
| К отгрузке | `to_ship` | Готово к документам |
| Отгружены | `shipped` | Только отгрузка **целого** заказа (не PATCH lane) |

## Карточки

- Одна карточка = одно изделие (`OrderItem` + `lineId`).
- Бейдж № заказа; фильтр по `orderId`.
- `Order.status` на доске не колонка — **rollup** (см. COUPLING-MAP §2).
- `OrderItem.status` = дериват lane (не перегружать enum prep/design).
- Материалы — не карточки. Модули DnD — COMBINE-406/407 (после v1).

## Couplings

Канон: [`docs/COUPLING-MAP.md`](../COUPLING-MAP.md).

## API (WAVE)

| Метод | Endpoint | Когда |
|-------|----------|--------|
| GET | `/api/orders` | данные доски (flat item cards + filter) |
| PATCH | `/api/orders/:id/lines/:lineId/lane` | CDK DnD изделия (405); optimistic + rollback |
| POST | `/api/orders/:id/ship` | дроп в «Отгружены» когда все линии `to_ship`/`shipped` → confirmShip |

Legacy: `PATCH .../items/:i/status` — не расширять новыми значениями.

**TZ-COMBINE-405:** DnD карточек → `patchLane`; первый вход любой линии в `shop` → freeze modal RU; дроп в «Отгружены» — ship-whole gate (toast «Ещё N изделий не готовы» / confirm → POST ship, не PATCH lane=shipped).

**TZ-COMBINE-408:** вход линии/модуля в `shop` — 400 RU, если нет вида работы с оценкой дней (override заказа или каталог `WorkType.days`); FE показывает тост из тела ошибки.

## Навигация

Проект: Комбайн первым, Очередь вторым; `entryPath` = `/design/combine` (TZ-NAV-305).

## Связанные TZ

**COMBINE-401…405** (v1) · **406–408** modules/gate · SWEEP-401 ship · NAV-303/305 · DASHBOARD-401 home widgets — не здесь
