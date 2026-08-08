# Страница: Карточка материала (MaterialDetailPage)

**Имя UI:** Карточка материала · **Route:** `/materials/:id`  
**Канон layout:** variant **A+** = тот же визуальный каркас, что у изделия  
([`product-detail.page.md`](./product-detail.page.md); модуль — [`module-detail.page.md`](./module-detail.page.md), TZ-CATALOG-336)  
**Исполнение A+:** **TZ-CATALOG-337** (после FACT-304)

**Краткое описание:** паспорт материала с фото и ценой + рабочая правая колонка
(«где используется» / склад). Не «простыня» секций I–IV и не fake BOM.

Материал — **лист** каталога: своего состава нет. Правая колонка = backlinks
(where-used), а не `ProductBomPanel`.

## Route

```
/materials/:id — «KPPDF — Материал»
```

## UI layout (variant A+ · цель TZ-CATALOG-337)

1. **Nav:** `Каталог / Материалы / <имя>` (`PiPageChrome`) + Назад (smart back UX-313) / Редактировать.
2. **Split xl:** слева sticky — hero-фото + паспорт (имя `font-display`, артикул/SKU/тип,
   FactStack габариты/вес) + аккордеон **Фото / Цена**;
   справа **рабочая зона на всю высоту:** таблица «Где используется» + ссылка на склад.
3. **Не** копировать `ProductBomPanel` / composition-tree на материал.
4. Цена: FactCard «Цена за ед.» с caption (закуп/учёт); без cost-preview модуля и без
   журнала CostCalculation изделия — у материала нет rollup.
5. Габариты: в паспорте краткий summary (нормализованный); детальная таблица типов —
   допустима в левой колонке или аккордеоне, не отдельной «простынёй» на всю ширину.
6. Фото: cover из `photoIds` / gallery API как у изделия/модуля (если поле есть);
   empty = «Нет фото», не битый img.

## Текущий долг (до 337)

Сейчас страница = `PiPageHeader` + секции I–IV (`material-detail.page.ts`).
FACT-304 только меняет passport `dl` → FactStack — **не** A+ shell.

## Связанные TZ

| ID | Роль |
|----|------|
| TZ-CATALOG-312 | первая карточка (section sheet) — DONE |
| TZ-UX-FACT-304 | passport → FactStack — узкий |
| TZ-CATALOG-336 | эталон A+ для модуля |
| **TZ-CATALOG-337** | material = A+ shell (этот канон) |
| TZ-UX-313 | smart back — DONE |
