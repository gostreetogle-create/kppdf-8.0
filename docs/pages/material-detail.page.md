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

## UI layout (variant A+ · shipped TZ-CATALOG-337)

1. **Nav:** `Каталог / <имя>` (`PiPageChrome`, 2 уровня, TZ-UI-405) + Редактировать.
   Один back-affordance — первая крошка (ghost «← Назад» UX-313 убран, TZ-UI-405 B-01).
2. **Split xl:** слева sticky — hero-фото + паспорт (имя `font-display`, артикул/SKU/тип,
   FactStack габариты/вес) + аккордеон **Фото / Цена**;
   справа рабочая зона на всю высоту: таблица «Где используется» + ссылка на склад.
   **TZ-UX-444C:** where-used и склад — data-links `text-info` dotted underline (не gold);
   status-banner нет (у материала нет ProductStatus).
3. **Не** копировать `ProductBomPanel` / composition-tree на материал.
4. Цена: FactCard «Цена за ед.» с caption «Закупочная / учётная цена материала»;
   без cost-preview модуля и без журнала CostCalculation изделия — у материала нет rollup.
5. Габариты: в паспорте краткий summary; детальная таблица типов остаётся в левой колонке.
6. Фото: cover/gallery из populated `photoIds` / `mainPhotoId`; empty = «Нет фото» /
   «Нет фото у этого материала», не битый img.
7. Where-used и склад остаются live-read поверх существующих API; backend/API не менялись.

## История исполнения

До CATALOG-337 страница была `PiPageHeader` + секции I–IV (`material-detail.page.ts`).
FACT-304 сначала перевёл passport `dl` → FactStack; CATALOG-337 добавил A+ shell без
изменения API и без второго write-path для состава.

## Связанные TZ

| ID | Роль |
|----|------|
| TZ-CATALOG-312 | первая карточка (section sheet) — DONE |
| TZ-UX-FACT-304 | passport → FactStack — DONE |
| TZ-CATALOG-336 | эталон A+ для модуля |
| **TZ-CATALOG-337** | material = A+ shell — DONE (этот канон) |
| TZ-UX-313 | smart back — DONE |
