# TZ-SUPPLY-307 — Строка «Что заказать»: категория → материал + full width

**Status:** READY — mock UI; PO review 2026-08-19 волна 2.

```
PAGES: /supply?view=quick
DEPENDS ON: TZ-SUPPLY-306 DONE
DESIGN CANON: docs/audits/2026-08-19-supply-quick-order-design-canon.md
ROLE: frontend executor
LAYER: frontend mock (+ optional read CategoriesService if trivial)
CONFLICT KEYS: frontend/src/app/pages/supply/supply-quick-order.* ;
  frontend/src/app/pages/supply/supply.page.ts (max-width only)
```

## PO intent (канон)

1. **Категория** = категории **материалов** из справочника `/categories` (`CategoriesService`, `type=material`). Редактирование только в справочниках — **не** «+ Новая» inline на снабжении.
2. Выбрал категорию → **выпадающий список материалов** этой категории (из базы; в 307 — mock `MOCK_MATERIALS[]` с `categoryId`).
3. Рядом **кнопка «+»** — зелёный квадратик (`--color-success`), не текст «+ Новая».
4. **«+» материал** → inline panel **под строкой** (как supplier panel): название*, артикул, цвет, фото stub, ед.изм.; [Сохранить][Отмена] → material в списке + auto-select + panel закрывается.
5. Из **основной полосы убрать**: свободное «Наименование», артикул, цвет, фото. **Оставить в полосе:** Категория · Материал (+) · **Кол-во** · **Ед.** (это qty заказа, не каталог).
6. **Full width:** убрать `max-w-6xl` у quick-order и registry container — контент на всю рабочую ширину (как `/desk`, `/orders`).

## Domain preflight

- Категория материала: `Category` (`categories.service.ts`), `type: 'material'`
- Материал: `Material` (`MaterialsService`) — в 305 persist; 307 mock only
- Supply row хранит: `categoryId`, `materialId`, `qty`, `unit`; `title`/`article`/`color` — **derived** от material или snapshot при save заявки (305)

## ЧТО ДЕЛАТЬ

### ШАГ 1 — Mock materials

`supply-quick-order.mock.ts`:
- `QuickOrderMaterial { id, categoryId, name, article?, color?, unit }`
- `MOCK_MATERIALS` seed: 2–3 на категорию (6205 → Подшипники, фреза → Оснастка, …)
- Helper `materialsForCategory(categoryId)`

### ШАГ 2 — Row «Что заказать»

- Select **Категория** → on change: reset `materialId`, refresh options
- Select **Материал** (disabled empty if no category): options filtered
- **Кнопка +** (`data-test="supply-quick-material-add"`):
  ```html
  <button class="supply-quick-order__add-btn" aria-label="Новый материал">+</button>
  ```
  CSS: ~1.75rem square, border success, bg success-soft, color success, hover чуть темнее
- Inline panel `supply-quick-material-panel`: name*, article, color, unit select, photo stub; save pushes mock + patchRow materialId

### ШАG 3 — Categories source

- Prefer `CategoriesService.list('material')` on init with **mock fallback** if request fails / empty in tests
- Tests: mock CategoriesService or use MOCK only — не ломать jest без backend

### ШАГ 4 — Summary line

- Title in collapsed row = selected material name (or «Без материала»)

### ШАГ 5 — Full width

- `supply-quick-order.component.ts`: `max-w-6xl` → `w-full min-w-0`
- `supply.page.ts`: registry `max-w-6xl` → `w-full`

### ШАГ 6 — Убрать

- Inline «+ Новая» категория и `showNewCategory` flow
- Поля article/color/photo из strip `--what`

### ШАГ 7 — Tests

- Category change filters materials
- Material add panel save selects new material
- data-test preserved/added
- Gates: tsc + `pnpm test -- supply`

## НЕ ИЗМЕНЯТЬ

- Strips 2–4 (Откуда / Контекст / Статус) — только если нужно для width
- Backend, MaterialsService POST (305)
- Registry table logic

## AC

1. Полоса «Что»: Категория · Материал · [+] · Кол-во · Ед. — одна строка lg+
2. Материалы фильтруются по категории
3. Зелёный square + открывает panel; save → option в select
4. Нет «+ Новая» категория
5. Страница full width — нет пустой полосы справа (PO red box)
6. tsc + supply tests PASS

## Successor (305)

- `GET /materials?categoryId=` live
- `POST /materials` from inline panel → catalog SoT
- SupplyRequest stores `materialId` FK

## known_limitation

307 mock materials in-memory; F5 resets new materials.
