═══════════════════════════════════════════════════════════════
TZ-UX-FORM-308: Ёмкость полей — kind C в одном реестре
═══════════════════════════════════════════════════════════════

> `docs/TZ-AUTHORING.md`. Канон: `docs/pages/ui-form-field-capacity.md` (обновлён 2026-08-22), `docs/DIALOG-COOKBOOK.md`.
> Параллель: FORM-309 product, FORM-310 module — **другие файлы**, можно вместе.

РОЛЬ АГЕНТА: Frontend Component Engineer (Claude terminal)

ЗАВИСИМОСТИ: Нет

LAYER: 2

PAGES: (shared ui)
PAGE_DOCS: ui-form-field-capacity.md

CONFLICT KEYS: frontend/src/app/shared/ui/quick-create/field-capacity.ts; frontend/src/app/shared/ui/quick-create/index.ts; frontend/src/app/shared/ui/quick-create/field-capacity.spec.ts

## ЧТО СДЕЛАНО

- `field-capacity.ts`: шапка переписана — один реестр для QuickCreate (kind B)
  **и** FullEditor (kind C). Добавлены `subcategory: 'sm'`, `ralCode: 'sm'`
  (FullEditor-only ключи product; `sku`/`article` уже были). Комментарий к
  `CAPACITY_CONTROL_MAX_CLASS`: nano ≈ 5–6 цифр (GOV.UK width-5), xs ≈
  ед./короткий прайс, никогда `w-full`. `isActive: 'lg'` (QC lock) и
  `BAND_START_KEYS` (`dimLength`+`width`) не менялись.
- `index.ts`: экспортированы `colSpanClass`, `controlMaxClass`,
  `CAPACITY_CONTROL_MAX_CLASS` (раньше не были публичными).
- Новый `field-capacity.spec.ts` (6 тестов): `capacityFor('dimLength')==='nano'`;
  `controlMaxClass('dimLength', true)` содержит `max-w-`;
  `controlMaxClass('name', true)===''`; `colSpanClass('dimLength', true)`
  содержит `md:col-start-1`; + no-op при `useCapacityGrid=false`;
  `subcategory`/`ralCode` → `sm`.
- Регрессия вне conflict keys, но обязательная к фиксу: существующий тест
  `quick-create-dialog.component.spec.ts` требовал, чтобы КАЖДЫЙ ключ
  `FIELD_CAPACITY` входил в строгий QuickCreate-only allowlist
  (`PRODUCT_FIELD_KEYS ∪ MODULE_FIELD_KEYS`) — прямое противоречие цели этой
  TZ. Assertion обновлён: добавлен явный список `fullEditorOnlyKeys =
  ['subcategory', 'ralCode']` третьим допустимым множеством, с комментарием.
- `product-form-dialog.component.ts`/`module-form-dialog.component.ts` (309/310)
  не тронуты — подтверждено `grep`: там ещё нет ни одного вызова
  `colSpanClass`/`controlMaxClass`/`capacityFor`.

## Acceptance (из TZ)

- [x] Один `FIELD_CAPACITY` реестр покрывает QuickCreate и FullEditor
- [x] `colSpanClass`, `controlMaxClass`, `CAPACITY_CONTROL_MAX_CLASS` экспортированы из `index.ts`
- [x] `field-capacity.spec.ts` с утверждениями из ШАГ3 — 6/6 PASS
- [x] `subcategory`/`ralCode` добавлены как `sm`; `isActive`/`BAND_START_KEYS` не менялись
- [x] Не тронуты каталожные диалоги/шаблоны (309/310)

## Gates (факт)

```text
cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit    → exit 0
cd frontend && pnpm test -- field-capacity --runInBand        → 6/6 PASS
cd frontend && pnpm lint                                       → 0 errors, 18 pre-existing warnings (unrelated files)

Regression check (найдена и исправлена, вне TZ-заданных гейтов):
cd frontend && pnpm test -- quick-create-dialog --runInBand   → 14/14 PASS
```

## known_limitation

Ничего не отложено. Подключение реестра к шаблонам `product-form-dialog`/
`module-form-dialog` — отдельные TZ-309/310, не в этой TZ.

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-22
closed_by: claude
sha: 0047dad9
verification:
  - acceptance criteria: PASS
  - typecheck: PASS
  - tests: PASS (field-capacity 6/6; quick-create-dialog regression 14/14)
  - lint: PASS (0 errors)
  - checklist: ADDED (`docs/agent-checklists/TZ-UX-FORM-308.md`)
  - progress.md: N/A
  - status synchronization: PASS (`_NOW.md`)
