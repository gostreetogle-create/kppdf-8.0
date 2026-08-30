# TZ-CATALOG-377: категории — единый справочник + name-path + UX справочников

PAGES: `/categories` ; `/supply/quick-order` ; `/materials` ; `/products` ; `/modules`
PAGE_DOCS: categories.page.md ; supply-quick-order.page.md
РОЛЬ АГЕНТА: executor (Freebuff) · Cursor — архитектура/docs
ЗАВИСИМОСТИ: CATALOG-376 hotfix (slug→name picker) DONE локально
LAYER: backend + frontend + docs
CONFLICT KEYS: `category.service.ts`; `categories.seed.ts`; `categories.page.ts`; `category-form-dialog.component.ts`; `supply-quick-order.component.ts`; material/product form dialogs

## Domain preflight

- **Проверено:** Category — **единый** справочник с полем `type`: `material` | `product` | `general` (не отдельные коллекции).
- **Проверено:** Material/Product/Module ссылаются на Category через `categoryId` (FK).
- **Проверено:** PO хочет **раздельные деревья по type** (материалы / изделия / модули), но **одна CRUD-точка** в Справочниках → `/categories` с фильтром типа.
- **Проверено:** `fullPath` сегодня хранит **slug** (`metals/plastic`) — picker показывал EN; hotfix FE: slug-path → `name` (377 follow-up: BE name-path).
- **Не делать:** объединять все type в один flat list без фильтра; дублировать category CRUD в material form без write-through в API.

## ИСХОДНОЕ СОСТОЯНИЕ

PO smoke 2026-08-24:

1. Supply → категория: `components`, `metals` (slug), не «Комплектующие», «Металлы».
2. Категория созданная из формы материала — неясно попадает ли в `/categories`.
3. Переименование в справочнике — `name` меняется, но `fullPath` slug-based; иерархия в pickers ломается.
4. Справочники `/categories`: breadcrumbs/навигация «бардак» — PO не понимает куда лезть за rename/delete.

## Целевая модель (канон)

```text
/categories (Справочники → Классификация → Категории)
  ├── type=material   → pickers: Supply, Material form, …
  ├── type=product    → Product form, …
  └── type=general    → legacy / общие (не смешивать в material picker)

Material.categoryId ──► Category(type=material)
Rename Category.name ──► все FK остаются; labels в UI из Category.name (не денормализованная копия)
fullPath (display) ──► «Металлы › Лист» (name segments), slug остаётся для URL/SKU
```

**Module categories:** если modules используют `type=product` или отдельный type — зафиксировать в ADR одной строкой в `docs/CONTEXT.md` (не invent `module` type без schema review).

## ЧТО ДЕЛАТЬ

### 1. BE — name-based fullPath (migration)

- `create()`: root `fullPath = name`; child `fullPath = parent.fullPath/name` (не slug).
- `update()` при rename `name`: пересчитать fullPath узла + descendants (name segments).
- One-shot migration script или bootstrap patch: существующие slug fullPath → resolve через `name`/`slug` map.
- Seed: `fullPath: c.name` вместо `c.slug`.

### 2. FE — единый picker source

- Supply / material / product forms: **только** `CategoriesService.list(type)` или `tree(type)` — без mock categories после first live response.
- `categoryPickerLabel(c)`: name-path join ` › `; slug-only fallback = `name` (уже есть).

### 3. Write-through create

- Quick-create category из material form / supply panel → `POST /categories` с `type=material`; on success refresh picker + `/categories` tree.
- Запрет local-only mock id без POST (кроме offline demo flag).

### 4. Справочники UX (categories page)

- Chip/breadcrumb: **Справочники → Классификация → Категории** (явно в `categories.page.md` + template subtitle).
- Default type filter = `material` при входе из Supply deep-link (query `?type=material`).
- Row actions: edit (name, parent, type), delete guard, copy slug read-only.
- Empty state hint: «Категории материалов используются в Снабжении и карточке материала».

### 5. Tests

- BE unit: create/update fullPath uses names
- FE unit: `categoryPickerLabel` (есть в supply-quick-order.mock.spec.ts)
- Smoke: supply picker «Металлы» не «metals»

## ИЗМЕНЯТЬ

- `backend/src/modules/category/category.service.ts`
- `backend/src/common/seed/categories.seed.ts`
- `frontend/src/app/pages/dictionaries/categories.page.ts`
- `frontend/src/app/pages/supply/supply-quick-order.component.ts`
- Material/product category pickers (write-through create)
- `docs/pages/categories.page.md`
- `docs/CONTEXT.md` — одна строка category type canon

## НЕ ИЗМЕНЯТЬ

- Слияние type=material/product в один picker без фильтра
- Денормализация category name на Material document

## Критерии приёмки

- [ ] Supply категория: «Металлы», «Пластик», «Комплектующие» (RU)
- [ ] Создал категорию из material form → видна в `/categories?type=material`
- [ ] Rename в справочнике → supply picker + material card обновили label (F5 или live refresh)
- [ ] `cd backend && pnpm test -- category` · `cd frontend && pnpm test -- categoryPickerLabel`

## Verification

```text
cd backend && pnpm exec tsc -p tsconfig.build.json --noEmit && pnpm test -- category
cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit && pnpm test -- supply-quick-order.mock
```
