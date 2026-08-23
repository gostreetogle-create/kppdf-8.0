═══════════════════════════════════════════════════════════════
TZ-UX-FORM-309: FullEditor изделия — упаковать поля
═══════════════════════════════════════════════════════════════

> Канон: `docs/pages/ui-form-field-capacity.md`, brief `docs/superpowers/specs/2026-08-22-density-canon-brief.md`

РОЛЬ АГЕНТА: Frontend UI Engineer (Freebuff)

ЗАВИСИМОСТИ: Желательно FORM-308 на origin (экспорт `colSpanClass`). Если 308 ещё нет — копировать те же Tailwind-классы из `field-capacity.ts` (`max-w-[5.5rem]` nano, `max-w-[7rem]` xs, `md:col-span-*`) **в шаблон**, не править `field-capacity.ts`.

LAYER: 3

PAGES: /products
PAGE_DOCS: products.page.md ; product-detail.page.md

CONFLICT KEYS: frontend/src/app/pages/products/product-form-dialog.component.ts; frontend/src/app/pages/products/product-form-dialog.component.spec.ts

Проверено: `product-form-dialog.component.ts` ~140 `lg:grid-cols-3` + внутри `grid-cols-1` (вертикальные стеки); габариты `grid-cols-2` + max-w-[8rem]; textarea уже `rows=2`; ниже фото + BOM `max-h-[34rem]`. Payload/FormControl names не менять.

Dictation: изделие = Product FullEditor kind C, не QuickCreate.

═══════════════════════════════════════════════════════════════
ЧТО ДЕЛАТЬ
═══════════════════════════════════════════════════════════════

ШАГ 1: Убрать три вертикальных стека

Заменить внешний `lg:grid-cols-3` на поток секций. Внутри **Основные / Цена / Габариты** — `md:grid-cols-12 gap-x-3 gap-y-2`, не `grid-cols-1`.

Целевая упаковка (span ≤ 12):

- Название `md:col-span-8` + артикул `md:col-span-4`
- Вид + статус + активен — три `md:col-span-4` (чекбокс не на всю колонку)
- Цена control `max-w-[7rem]` + категория `md:col-span-4` + подкатегория `md:col-span-4`
- Габариты **одна лента**: Д/Ш/В/вес `max-w-[5.5rem]` + ед. габаритов/единица `max-w-[7rem]`; `md:col-start-1` на длине; числа `text-right tabular-nums`
- Цвет не full-bleed (оставить max-w ~14rem)
- Описание/заметки: **оставить rows=2**; не увеличивать
- Фото и BOM не раздувать; BOM может скроллиться внутри. Identity (до описания включительно) на 1440 — без необходимости скроллить к «Сохранить»

ШАГ 2: Хелперы

Если FORM-308 уже в дереве — `colSpanClass` / `controlMaxClass` с `useCapacityGrid=true`. Иначе литералы Tailwind как в ШАГ 1. Не менять `field-capacity.ts`.

ШАГ 3: Spec

- В шаблоне нет `lg:grid-cols-3` как внешней сетки трёх стеков.
- `prod-len` (или dimLength) обёрнут max-w / controlMax, не `w-full` на всю треть диалога.
- Payload: те же formControlName. Не трогать BOM write-path.

НЕ: module/material dialogs, backend, maxWidth 1120, auto-grow, git add -A.

Gates:
```
cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit
cd frontend && pnpm test -- product-form-dialog --runInBand
cd frontend && pnpm lint
```
Browser 1440 `/products` → Редактировать: identity виден, footer «Сохранить» без охоты за скроллом на пустой форме (без огромного BOM).

Archive: `tasks/_archive/2026-08/TZ-UX-FORM-309.done.md`. Без деплоя.
