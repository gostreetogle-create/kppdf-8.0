# TZ-UI-407: Фильтры каталога — Escape и честный overlay

PAGES: /products ; /modules ; /materials
PAGE_DOCS: products.page.md ; modules.page.md ; materials.page.md
РОЛЬ АГЕНТА: Frontend UI Engineer
ЗАВИСИМОСТИ: Нет
LAYER: 3
CONFLICT KEYS: frontend/src/app/pages/products/products.page.ts; frontend/src/app/pages/modules/modules.page.ts; frontend/src/app/pages/materials/materials.page.ts

Проверено: аудит D-04 — три копии flyout `role="dialog"` без ESC; backdrop уже закрывает (`products.page.ts` ~345–352). Не выносить общий компонент.

## ИСХОДНОЕ

Менеджер открывает «Фильтры», Escape не закрывает. `role="dialog"` без focus-trap — ложь для a11y.

## ЧТО ДЕЛАТЬ

ШАГ 1: На всех трёх страницах: `HostListener` document `keydown` Escape → `closeFilters()` если `filtersOpen()`. Не мешать другим диалогам: только если фильтры открыты.

ШАГ 2: Панель фильтров: `role="dialog"` → `role="region"`. Backdrop/aria-label «Фильтры» оставить.

ШАГ 3: Если в этих трёх шаблонах на лейблах фильтров есть `text-[10px]` / `text-[9px]` — заменить на `text-[11px]`. Не трогать kit.

ШАГ 4: Строка в PAGE-TZ-INDEX на products/modules/materials.

## ИЗМЕНЯТЬ

CONFLICT KEYS + PAGE-TZ-INDEX. Specs — только если уже есть page.spec с фильтрами; иначе ручной AC.

## НЕ ИЗМЕНЯТЬ

- Shared PiDialog / desk flyout / KP create
- Состав фильтров (поля, query)
- Deploy

## КРИТЕРИИ ПРИЁМКИ

```text
cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit
```

- Escape закрывает фильтры на трёх маршрутах (зафиксируй в checklist, как проверял)
- Нет `role="dialog"` на этих трёх filter-панелях

known_limitation: общий FilterFlyout — successor, не эта TZ.
