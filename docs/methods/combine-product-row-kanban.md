# Метод: Комбайн изделий (product-row mini-kanban)

**Статус:** канон UI-паттерна (2026-08-16)  
**Эталон реализации:** `/design/combine` (`DashboardPage`, TZ-COMBINE-409…414)  
**Данные:** `OrderItem.boardLane` + `Order.moduleLanes` — смысл колонок не менять при переносе паттерна.

## Когда применять

Нужен прогресс **по стадиям внутри одной сущности** (изделие / позиция), а глобальный колоночный канбан смешивает чужие карточки и ломает DnD.

Типичный кейс: производство / комплектация / проектирование / цех / отгрузка **по изделиям заказа**.

Не применять: простой список статусов без подэлементов; складские движения; произвольные «доски» без канона lane.

## Анатомия

```
[ Sticky header: Stage1 | Stage2 | … | StageN ]   ← равные доли ширины, без H-scroll
[ Row: entity A ]  collapsed = title + stage indicators
   └─ expand → mini-kanban N cells; chips = children (modules) DnD only inside this row
[ Row: entity B ]
```

1. **Ряд = единица работы** (у нас `OrderItem`), на всю ширину.  
2. **Стадии = колонки внутри ряда**, не глобальные колоды.  
3. **Свёрнуто:** индикаторы «где горят» стадии.  
4. **Раскрыто:** равные ячейки + hairline; DnD **scoped** к `lineId` / entity key.  
5. **Без children:** один чип «целиком» двигает сущность по стадиям.  
6. **Группировка родителя** (заказ): без текстовых «ЗАКАЗ №» дублей — компакт внутри группы, отступ / рамка на смене родителя; цвет — опционально позже.  
7. **Клики:** номер родителя → карточка родителя; **имя / qty / индикаторы ряда → expand**; **карандаш → edit** сущности; ▸ → expand; children → edit child (карандаш на чипе). Не открывать edit по клику имени.

## Инварианты данных (kppdf)

| UI | SoT |
|----|-----|
| Stage column | `boardLane` / module lane |
| Chip move | PATCH lane (не invent status enum) |
| «Отгружены» | целый заказ / ship write-path, не PATCH shipped как обычная lane |
| Rollup заказа | сервер из эффективных lane |

## Переиспользование

1. Скопировать IA (sticky stages + accordion rows + scoped CDK lists).  
2. Подставить свою entity + stages enum + PATCH.  
3. Conflict keys: один Layer-3 host component.  
4. Page doc + ссылка сюда.

## Не смешивать

- Гант (время/ресурсы) ≠ комбайн (стадии состава).  
- KPI-карточки сверху — rollup, не стадии ряда.

## Successor polish (не блокер метода)

- DnD preview без прыжка (placeholder / cdkDragPreview).  
- Цветовое кодирование групп-родителей.  
- Плотная склейка рядов одной группы (общая рамка).

См. также: `docs/pages/design-combine.page.md`, `docs/COUPLING-MAP.md` § boardLane.
