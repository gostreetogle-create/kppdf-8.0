# TZ-CATALOG-330 — Цвета типов каталога на дереве состава

> Backlog / park. Поднять в `tasks/` когда PO скажет «в работу».  
> Аудит: `docs/audits/2026-08-07-catalog-entity-colors-audit.md`

```
PAGES: /products/:id ; /modules/:id
PAGE_DOCS: product-detail.page.md ; ui-composition-tree.md
```

## РОЛЬ АГЕНТА

Frontend (+ минимальный shared helper). Backend persist — **не** в этом TZ
(defaults в коде). Persist + экран настроек → TZ-CATALOG-331.

## ЗАВИСИМОСТИ

- Composition tree + BOM panel на Карточке изделия (уже в main).
- Эталон hue UI: `WorkTypeFormDialog` / `workTypeOklch` (только паттерн, не копипаст Ганта).

## LAYER

2

## CONFLICT KEYS

```
frontend/src/app/shared/ui/composition/composition-tree.component.ts;
frontend/src/app/pages/products/product-bom-panel.component.ts;
frontend/src/app/shared/ui/catalog/catalog-kind-oklch.ts;
docs/pages/ui-composition-tree.md;
docs/pages/product-detail.page.md
```

## ИСХОДНОЕ СОСТОЯНИЕ

- Дерево: бейджи изд/мод/мат, без kind-палитры.
- WorkType: `accentHue` + `workTypeOklch` — рабочий UX пресетов.
- `color_references` = RAL, **не** трогать.

Проверено: audit `docs/audits/2026-08-07-catalog-entity-colors-audit.md`;
`gantt-bar.model.ts` `workTypeOklch`; composition-tree kindShort.

## ЧТО ДЕЛАТЬ

1. Добавить `catalogKindOklch(kind, materialKind?, …)` + default hue map
   (product / module / material; material raw vs non-raw — два тона если просто).
2. Composition-tree: wash фона строки + цвет бейджа из helper.
3. BOM inspector: точка/полоска того же тона у «Выбрано».
4. Обновить `ui-composition-tree.md` + `product-detail.page.md`.
5. Specs: snapshot/class или style assertion на kind wash.

## НЕ ИЗМЕНЯТЬ

- `color_references`, Product.ralCode
- WorkType / Gantt bar colors
- Persist settings UI (→ 331)
- Per-instance accentHue на Product/Module (→ later)

## КРИТЕРИИ ПРИЁМКИ

- [ ] На Карточке изделия в дереве изделие/модуль/материал визуально разной заливкой
- [ ] Контраст читаем в light и dark
- [ ] RAL-справочник и формы товара без новых полей цвета UI
- [ ] `cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit`
- [ ] jest: composition-tree или bom-panel spec зелёный

## ИЗВЕСТНЫЕ ОГРАНИЧЕНИЯ

Цвета пока только из кода-defaults; PO крутит пресеты после TZ-331.

---

ARCHIVE → `tasks/_archive/YYYY-MM/` по GEMINI.md при исполнении из `tasks/`.
