═══════════════════════════════════════════════════════════════
TZ-UX-FORM-310: FullEditor модуля — упаковать поля
═══════════════════════════════════════════════════════════════

> Канон: `docs/pages/ui-form-field-capacity.md`

РОЛЬ АГЕНТА: Frontend UI Engineer (Freebuff)

ЗАВИСИМОСТИ: Как FORM-309 — FORM-308 желателен, не блокирует: литералы Tailwind ок, `field-capacity.ts` не трогать.

LAYER: 3

PAGES: /modules
PAGE_DOCS: modules.page.md

CONFLICT KEYS: frontend/src/app/pages/modules/module-form-dialog.component.ts; frontend/src/app/pages/modules/module-form-dialog.component.spec.ts

Проверено: `module-form-dialog.component.ts` ~80 `grid-cols-2` имя|артикул (артикул на полширины); габариты `grid-cols-4` без max-w на input; вес отдельно full; notes `rows=3`; фото + виды работ ниже. Kind C `maxWidth min(1120px,…)`. FormControl names не менять.

═══════════════════════════════════════════════════════════════
ЧТО ДЕЛАТЬ
═══════════════════════════════════════════════════════════════

ШАГ 1: Сетка 12-col

- Основные: `md:grid-cols-12`; название `md:col-span-8`, артикул `md:col-span-4` (не 50/50).
- Габариты: одна лента; Ш/В/Глубина `max-w-[5.5rem]`; ед. `max-w-[7rem]`; вес в ту же ленту (`max-w-[5.5rem]`), не отдельным full-width. Числа `text-right tabular-nums`.
- Заметки: `rows=3` максимум, не больше.
- Фото и виды работ не раздувать.

ШАГ 2: Хелперы как в 309, без правки `field-capacity.ts`.

ШАГ 3: Spec — нет `grid-cols-2` на паре имя/артикул; dim-width имеет max-w; те же data-test.

НЕ: product/material dialogs, backend, git add -A.

Gates:
```
cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit
cd frontend && pnpm test -- module-form-dialog --runInBand
cd frontend && pnpm lint
```

Archive: `tasks/_archive/2026-08/TZ-UX-FORM-310.done.md`. Без деплоя.
