# TZ-UX-444D: Empty thumbnail — единая штриховка «нет фото»

PAGES: `/products/:id` ; `/kit/overview` (если есть photo demo)
PAGE_DOCS: product-detail.page.md ; ui-density / AI-UI-CONTRACT

РОЛЬ АГЕНТА: Frontend UI Engineer  
ЗАВИСИМОСТИ: Желательно после 444B (тот же product-detail) — **не параллелить с 444B/444C на product-detail**  
LAYER: 3

### Preflight Check Output
- **Context read:** audit §5.4; `product-detail` gallery `@empty`; `photo-dropzone`; `PiEmptyState` (table rows — другой кейс)
- **Key Constraints:** одна конвенция для миниатюр; токены rule/paper; не spinner как empty
- **Planned Deliverable:** CSS utility / tiny presentational placeholder + adoption на product hero/gallery empty
- **Validation Path:** visual + jest smoke · docs

CONFLICT KEYS:
`frontend/src/app/shared/ui/photo/`;
`frontend/src/styles.css` (только `@layer components` utility, без новых hex);
`frontend/src/app/pages/products/product-detail.page.ts`;
`frontend/src/app/pages/products/product-detail.page.spec.ts`;
`docs/AI-UI-CONTRACT.md`

## Domain preflight

- Легаси: диагональная штриховка читается лучше «Нет»/spinner.
- У нас: gallery empty — текст/empty state; нужна **миниатюра-плейсхолдер** того же размера, что thumb.

## ЧТО ДЕЛАТЬ

### ШАГ 1 — Примитив/утилита

Предпочтительно:

- Класс `.pi-thumb-empty` в `styles.css` `@layer components`: размер через existing spacing; фон `bg-paper-2`; диагональные линии через `repeating-linear-gradient` с `var(--color-rule)` (без raw hex); `aria-hidden` на декоративе.
- Опционально крошечный компонент `PiThumbEmpty` если нужен slot/label «Нет фото» `text-xs text-muted-foreground` — не обязателен, class+span ок.

### ШАГ 2 — Product detail

Hero без фото и gallery `@empty`: показать `.pi-thumb-empty` фиксированного размера (как существующие thumbs), не голый текст «Нет» и не бесконечный spinner.

### ШАГ 3 — Docs + test

AI-UI-CONTRACT: empty thumb = `.pi-thumb-empty`. Spec: empty gallery renders placeholder `data-test="pi-thumb-empty"`.

## НЕ ИЗМЕНЯТЬ

- PiEmptyState таблиц (другой паттерн)
- Backend / upload pipeline
- Параллельно не трогать те же hunks, что 444B/C — **выполнять после** их archive или только CSS+dropzone без product, если product ещё в claim

## КРИТЕРИИ ПРИЁМКИ

1. Нет фото → штрихованный thumb, light+dark читаем.
2. Нет raw hex в новом CSS.
3. tsc + focused product-detail jest.
4. AI-UI-CONTRACT строка.

## Archive

`tasks/_archive/2026-08/` + checklist + PAGE-TZ-INDEX.
