═══════════════════════════════════════════════════════════════
TZ-UX-FORM-311: FullEditor материала — упаковать поля
═══════════════════════════════════════════════════════════════

> Канон: `docs/pages/ui-form-field-capacity.md`, `docs/pages/ui-form-sections-canon.md` (секции материала — эталон, не ломать).
> FORM-308 DONE: можно `colSpanClass` / `controlMaxClass`. FORM-310: `app-pi-input` может не пробрасывать host class → max-w на обёртке или style, как в 310.

РОЛЬ АГЕНТА: Frontend UI Engineer (Freebuff)

ЗАВИСИМОСТИ: FORM-308 DONE. Не пересекается с DESK-424 (Claude) и FORM-309 (изделие).

LAYER: 3

PAGES: /materials
PAGE_DOCS: materials.page.md

CONFLICT KEYS: frontend/src/app/pages/materials/material-form-dialog.component.ts; frontend/src/app/pages/materials/material-form-dialog.component.spec.ts

Проверено: `material-form-dialog.component.ts` ~139 `lg:grid-cols-2` секции; внутри «Основные» `sm:grid-cols-2` имя|артикул (50/50); вес и цена без nano max-w; «Дополнительно» `sm:grid-cols-3`; textarea уже `rows=2`; габариты FormArray уже `grid-cols-12`. Payload/FormControl names не менять. Поставщик = Organization type supplier, не Counterparty.

═══════════════════════════════════════════════════════════════
ЧТО ДЕЛАТЬ
═══════════════════════════════════════════════════════════════

ШАГ 1: Внутри секций — 12-col, не 50/50

Секции `app-pi-form-section` и внешний `lg:grid-cols-2` **оставить**. Packing внутри:

- Основные: `md:grid-cols-12`; название `md:col-span-8`, артикул `md:col-span-4` (не 50/50).
- Ед. / вид / sku — span по `colSpanClass` (`unit` xs, `sku` sm, kind sm).
- Вес + цена: `max-w-[5.5rem]` / `max-w-[7rem]` + `text-right tabular-nums` (как модуль 310).
- Дополнительно: сортамент/стандарт/марка не три равных full-bleed, если коротко — sm span.
- Описание/заметки: **не** увеличивать rows (уже 2).
- Фото и FormArray габаритов не раздувать; габариты-ряд уже 12-col — только nano max-w на `value`, если input растянут.

ШАГ 2: Хелперы из `field-capacity.ts` (`useCapacityGrid=true`). Не править сам реестр. Если class на `app-pi-input` не садится — обёртка/style как FORM-310, не патчить `input.component.ts`.

ШАГ 3: Spec — нет `sm:grid-cols-2` на паре имя/артикул; вес/цена с max-w; те же data-test и formControlName.

НЕ: product/module dialogs, composition-tree, order-hub-tray, manager-desk, field-capacity.ts, backend, git add -A, деплой.

Gates:
```
cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit
cd frontend && pnpm test -- material-form-dialog --runInBand
cd frontend && pnpm lint
```

Archive: `tasks/_archive/2026-08/TZ-UX-FORM-311.done.md`. Без деплоя.
