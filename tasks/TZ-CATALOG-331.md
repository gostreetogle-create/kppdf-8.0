# TZ-CATALOG-331 — Экран «Оформление каталога» + persist палитры kind

> Backlog. После **TZ-CATALOG-330**.
> Аудит: `docs/audits/2026-08-07-catalog-entity-colors-audit.md`

```
PAGES: /catalog/appearance  (или /dictionaries/catalog-appearance — выбрать один и зафиксировать в page doc)
PAGE_DOCS: catalog-appearance.page.md (создать); product-detail.page.md; ui-composition-tree.md
```

## РОЛЬ АГЕНТА

Full-stack thin: FE экран + BE persist org-scoped settings (или существующий
organization settings — **audit schema first**, не invent вторую БД без нужды).

## ЗАВИСИМОСТИ

- **TZ-CATALOG-330 DONE** (`catalogKindOklch` + tree wash из defaults).
- Эталон hue UI: `work-type-form-dialog` accentHue fieldset — вынести shared
  `PiAccentHueField` если ещё нет.

## LAYER

2–3 (если трогаешь org settings schema = согласовать CONFLICT KEYS)

## CONFLICT KEYS

```
frontend/src/app/pages/catalog/catalog-appearance.page.ts;
frontend/src/app/shared/ui/accent-hue/pi-accent-hue-field.component.ts;
frontend/src/app/shared/ui/catalog/catalog-kind-oklch.ts;
frontend/src/app/shared/page/… (chip / route);
backend/src/modules/… (org settings OR catalog-appearance);
docs/pages/catalog-appearance.page.md;
docs/pages/PAGE-TZ-INDEX.md
```

(Уточнить пути BE после 10-мин audit `organization` settings / preferences.)

## ИСХОДНОЕ СОСТОЯНИЕ

- 330: defaults в коде, дерево красится.
- Нет UI крутить hue для product/module/material.
- `color_references` = RAL — **не** использовать.

Проверено: audit entity-colors; work-type accentHue save path (footer click!).

## ЧТО ДЕЛАТЬ

1. Domain preflight: где хранить `CatalogAppearance` (org settings JSON vs collection).
2. API GET/PATCH палитры: `{ productHue, moduleHue, materialHue, materialRawHue? }`.
3. Страница **Оформление каталога** в группе Каталог (chip) или Справочники —
   один маршрут, русский UI.
4. Shared `PiAccentHueField` (пресеты + Авто); форма Save с `(click)="onSubmit()"`
   в footer (не type=submit вне form — урок work-types).
5. Подключить `catalogKindOklch` к загруженным пресетам (кэш + invalidate).
6. Page doc + PAGE-TZ-INDEX.
7. Specs FE + BE happy path; tsc зон.

## НЕ ИЗМЕНЯТЬ

- RAL / Product.ralCode
- WorkType / Gantt
- Per-SKU accentHue
- Списки Products/Modules (→ 332)

## КРИТЕРИИ ПРИЁМКИ

- [ ] PO меняет hue изделия/модуля/материала → Save → тост → дерево на `/products/:id` отражает после reload (или live invalidate)
- [ ] Light + dark читаемы
- [ ] Не смешано с `/dictionaries/color-references`
- [ ] Gates: `tsc` FE+BE зоны; jest затронутых спек
- [ ] Archive + progress + push

## ИЗВЕСТНЫЕ ОГРАНИЧЕНИЯ

Легенда / density / qty toggle — optional extras из аудита §4; если время —
легенда вкл/выкл, иначе known_limitation → 332/333.
