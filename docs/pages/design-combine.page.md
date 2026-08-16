# Страница: Комбайн (`/design/combine`) — ряды изделий + mini-kanban

**Краткое описание:** Доска **изделий** (позиций заказа) в Проекте. Не склад `/inventory`,
не Обзор `/dashboard`. Layout V1 (TZ-COMBINE-409+): **горизонтальный ряд = OrderItem**,
sticky шапка стадий (`boardLane`), раскрытие → мини-комбайн 5 ячеек с чипами модулей
(или «целиком»). **Метод (переиспользовать):** [`docs/methods/combine-product-row-kanban.md`](../methods/combine-product-row-kanban.md).
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

Шапка: grid `1fr`×5, без horizontal scroll доски. Titles: `text-ink` (COMBINE-415).

## Ряды (TZ-COMBINE-409 + polish 410…412)

- Один ряд = одно изделие (`OrderItem` + `lineId`), на всю ширину.
- Без группового «Заказ №…»: номер только на ряду; **склейка** одного заказа (`gap-0`, `border-t-0` между рядами, `border-rule-strong` + скругление только на краях группы); межзаказный зазор `mt-3`.
- Свёрнутый: **№ заказа** (`font-mono text-xs font-medium text-ink` + `bg-paper-2`, без `pi-tech-label`) · **имя** (`text-ink`) · qty · ▸ · **5 индикаторов** (сегмент active = модуль в lane / effective lane без модулей). Prefetch `GET /modules?productId=` — индикаторы корректны без expand.
- **Клики:** ▸ / **имя изделия** / qty / индикаторы → expand mini-kanban; **карандаш изделия** → `editProduct`; № заказа → карточка заказа; **карандаш модуля** → `openModuleEdit` (диалог, URL остаётся `/design/combine`).
- Expand (accordion `expandedKey`): `aria-expanded` + `aria-controls` → panel id; под рядом grid 5 ячеек; вертикальные hairline; чипы модулей (`py-2` + grip + pencil).
- DnD CDK **только** между 5 ячейками **этого** `lineId` (`${card.key}::lane`); не между изделиями. Preview непрозрачный (`combine-chip-drag-preview`); placeholder `opacity: 0` **только** внутри `[data-testid=combine-mini-kanban]` (COMBINE-415); drop animating смягчён (COMBINE-413).
- Без модулей каталога: чип **«целиком»** в effective lane; drag → тот же `PATCH .../lines/:lineId/lane` (не module lane).
- Бейдж № заказа; фильтр по `orderId`; KPI-карточки сверху (Order.status) — без изменений.
- `Order.status` на доске не колонка — **rollup** (см. COUPLING-MAP §2).
- `OrderItem.status` = дериват lane (не перегружать enum prep/design).

## Couplings

Канон: [`docs/COUPLING-MAP.md`](../COUPLING-MAP.md).

## API (WAVE)

| Метод | Endpoint | Когда |
|-------|----------|--------|
| GET | `/api/orders` | данные доски (flat item rows + filter) |
| GET | `/api/modules?productId=` | prefetch/expand состава изделия |
| PATCH | `/api/orders/:id/lines/:lineId/lane` | DnD «целиком» / legacy line move; optimistic + rollback |
| PATCH | `/api/orders/:id/lines/:lineId/modules/:moduleId/lane` | DnD чипа модуля в ячейке ряда |
| POST | `/api/orders/:id/ship` | дроп в «Отгружены» когда все линии `to_ship`/`shipped` → confirmShip |

Legacy: `PATCH .../items/:i/status` — не расширять новыми значениями.

**TZ-COMBINE-405/408:** freeze на первый shop; ship-whole gate; shop entry требует workType+days.

**TZ-COMBINE-409:** column-kanban → product rows + scoped mini-kanban. Semantics `boardLane`/`moduleLanes` без изменений.

**TZ-COMBINE-410:** whole-product chip + indicator prefetch + a11y expand.

**TZ-COMBINE-411:** drop duplicate order group headers; compact same-order gap + larger margin on orderId change (no color coding).

**TZ-COMBINE-412:** fuse same-order rows (`gap-0` / shared border); name→expand (см. 414); module pencil → dialog (см. 413); inter-order `mt-3`. Method: [`combine-product-row-kanban.md`](../methods/combine-product-row-kanban.md).

**TZ-COMBINE-414:** PO rollback — имя/qty/индикаторы → `toggleExpand`; edit изделия **только** карандашом. Fuse 412 без изменений.

**TZ-COMBINE-413:** DnD polish — solid preview + invisible placeholder + soft drop anim; module pencil → `DashboardDialogService.openModuleEdit` (stay on combine). Lane PATCH unchanged.

## Навигация

Проект: Комбайн первым, Очередь вторым; `entryPath` = `/design/combine` (TZ-NAV-305).

## Связанные TZ

**COMBINE-401…408** · **409** product rows · **410** polish · **411** drop headers · **412** fuse DONE · **414** name→expand / pencil-edit DONE · **413** DnD no-jump + module dialog DONE · SWEEP-401 ship · NAV-303/305 · DASHBOARD-401 home widgets — не здесь
