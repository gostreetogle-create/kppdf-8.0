# TZ-UX-444C: Status-banner на каталоге + роли info/gold для data-links

PAGES: `/products/:id` ; `/materials/:id` ; `/kit/overview`
PAGE_DOCS: product-detail.page.md ; material-detail.page.md

РОЛЬ АГЕНТА: Frontend UI Engineer  
ЗАВИСИМОСТИ: **TZ-UX-444A DONE** (нужен `app-pi-status-banner`)  
LAYER: 3

### Preflight Check Output
- **Context read:** audit §3+§8; `product-detail` status badges; `material-detail` links `text-primary`/`sunrise-warm`; `AI-UI-CONTRACT.md`; PiStatusBanner из 444A
- **Key Constraints:** без новых токенов в styles.css; gold=CTA/focus; info=data links
- **Planned Deliverable:** banner на product (+ material если есть status); выравнивание data-link классов
- **Validation Path:** jest + tsc · docs

CONFLICT KEYS:
`frontend/src/app/pages/products/product-detail.page.ts`;
`frontend/src/app/pages/products/product-detail.page.spec.ts`;
`frontend/src/app/pages/materials/material-detail.page.ts`;
`frontend/src/app/pages/materials/material-detail.page.spec.ts`;
`docs/AI-UI-CONTRACT.md`;
`docs/pages/product-detail.page.md`;
`docs/pages/material-detail.page.md`

## Domain preflight

- ProductStatus: `new|active|archived|draft`.
- Material может не иметь того же enum — **если нет status** → только data-links на material, banner skip.
- **НЕ:** менять OKLCH значения в styles.css; не история цены; не where-used разметку 444B ломать (можно править class на `<a>`).

## ЧТО ДЕЛАТЬ

### ШАГ 1 — Product status banner

Импорт `app-pi-status-banner` под chrome/hero:

| status | tone | message |
|--------|------|---------|
| draft | warning | Черновик — изделие не готово к продаже/производству |
| archived | destructive | В архиве |
| new | info | Новый |
| active | — | **без баннера** (нормальное состояние) |

Мелкие badges можно оставить.

### ШАГ 2 — Data-links → info

На product-detail + material-detail (и where-used `<a>` если 444B уже влит):

- Было: `text-primary` / `hover:text-sunrise-warm` на **перекрёстных ссылках в данных** (артикул→карточка, «где используется», склад).
- Стало: `text-info underline decoration-dotted underline-offset-4 hover:opacity-90` (или эквивалент из theme).
- **Не** трогать PiButton gold CTA, chrome nav gold underline, focus rings.

Зафиксировать в AI-UI-CONTRACT одну строку: data-link = `text-info`…; CTA = gold / PiButton.

### ШАГ 3 — Tests + docs

Banner tones; link class smoke; page.md one-liner.

## НЕ ИЗМЕНЯТЬ

- `styles.css` значения токенов (только использование utility)
- order-detail (уже 444A)
- module-detail layout кроме class на ссылках where-used при необходимости
- Backend

## КРИТЕРИИ ПРИЁМКИ

1. draft/archived product → banner; active → нет.
2. Data-links на material/product detail используют info, не gold-as-link.
3. AI-UI-CONTRACT обновлён.
4. tsc + focused jest product-detail + material-detail.

## Archive

`tasks/_archive/2026-08/` + checklist + PAGE-TZ-INDEX.
