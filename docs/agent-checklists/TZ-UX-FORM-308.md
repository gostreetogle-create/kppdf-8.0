# TZ-UX-FORM-308 checklist

> Status: **DONE**
> Marker: archived — `tasks/_archive/2026-08/TZ-UX-FORM-308.done.md`
> Commit/push: по `docs/GIT-POLICY.md`

## Claim slot (ОБЯЗАТЕЛЬНО до кода)

- agent_id: claude
- claimed_at: 2026-08-22T20:33:35Z
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (no Team Room CLI in this session)

## Preflight

- [x] Get-Location + git rev-parse --show-toplevel → оба `D:\kppdf-8.0`
- [x] Прочитал `_NOW.md` + `tasks/_active/` — только `TZ-UX-345` (chrome-rail/page layout, другие conflict keys, не пересекается с `field-capacity.ts`/`index.ts`)
- [x] TZ / канон прочитаны: `GEMINI.md`, `docs/AI-AGENT-GUIDE.md`, `docs/pages/ui-form-field-capacity.md`, `tasks/TZ-UX-FORM-308-field-capacity-kind-c.md`
- [x] Claim slot заполнен; Status = CLAIMED / IN PROGRESS
- [x] `tasks/_active/TZ-UX-FORM-308.md` на месте

## Acceptance

- [x] Один `FIELD_CAPACITY` реестр покрывает QuickCreate (kind B) **и** FullEditor (kind C) — не вторая таблица
- [x] `colSpanClass`, `controlMaxClass`, `CAPACITY_CONTROL_MAX_CLASS` экспортированы из `index.ts`
- [x] Новый `field-capacity.spec.ts` с указанными в TZ утверждениями (6/6 PASS)
- [x] `subcategory`/`ralCode` добавлены как `sm`; `isActive` остаётся `lg`; `BAND_START_KEYS` = `dimLength` + `width` (не менялось)
- [x] Не тронуты `product-form-dialog`/`module-form-dialog` (309/310) и любые шаблоны каталожных диалогов

## Integrity slot (до READY / archive)

- [x] Тип изменения определён: shared UI utility (не page/permission/module/MCP)
- [x] FIC §A–E: N/A — не новая страница/право/модуль/MCP tool
- [x] page.md / PAGE-TZ-INDEX: N/A (shared ui, не route)
- [x] SECTION-READINESS: N/A
- [x] Чужой WIP не в коммите; conflict keys соблюдены — коммит только `field-capacity.ts`/`index.ts`/`field-capacity.spec.ts` (TZ conflict keys) + `quick-create-dialog.component.spec.ts` (см. Executor report — регрессия, не conflict-key файл, но правка обязательна), не `git add -A`
- [x] Coupling map: N/A
- [x] Angular 20 паттерны: чистый TS-модуль без компонентов, strict typed, без `any`

## Gates (факт)

```text
cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit    → exit 0 (PASS)
cd frontend && pnpm test -- field-capacity --runInBand        → 6/6 PASS
cd frontend && pnpm lint                                       → 0 errors, 18 pre-existing warnings (не мои файлы)

Regression check (вне TZ-заданных гейтов, найдена и исправлена):
cd frontend && pnpm test -- quick-create-dialog --runInBand   → 14/14 PASS (после фикса)
```

## Executor report

- `field-capacity.ts`: шапка файла переписана — реестр явно для QuickCreate (kind B) **и** FullEditor (kind C), не вторая таблица; добавлены `subcategory: 'sm'`, `ralCode: 'sm'` (FullEditor-only, no QC equivalent — `sku`/`article` уже были); `CAPACITY_CONTROL_MAX_CLASS` получил комментарий (nano ≈ 5–6 цифр / GOV.UK width-5, xs ≈ ед./короткий прайс, никогда `w-full`); `isActive: 'lg'` и `BAND_START_KEYS` (`dimLength`+`width`) не менялись, как требовал TZ.
- `index.ts`: добавлены экспорты `CAPACITY_CONTROL_MAX_CLASS`, `colSpanClass`, `controlMaxClass` (были только `FIELD_CAPACITY`/`CAPACITY_SPAN`/`capacityFor`/`spanFor`/`spanForKey`/`FieldCapacity`).
- Новый `field-capacity.spec.ts` (6 тестов): все 4 утверждения из ШАГ3 TZ дословно + 2 доп. (no-op при `useCapacityGrid=false`; `subcategory`/`ralCode` → `sm`).
- **Найденная регрессия (вне conflict keys, но обязана к фиксу):** существующий тест
  `quick-create-dialog.component.spec.ts` → `'FIELD_CAPACITY covers all product/module allowlisted keys'`
  проверял, что *каждый* ключ `FIELD_CAPACITY` входит в `PRODUCT_FIELD_KEYS ∪ MODULE_FIELD_KEYS`
  (строгий QuickCreate-only allowlist) — это прямо противоречит цели TZ-308
  («один реестр для B и C», новые ключи `subcategory`/`ralCode` живут только в
  FullEditor). Обновил assertion: добавлен явный список `fullEditorOnlyKeys =
  ['subcategory', 'ralCode']` как третье допустимое множество, с комментарием
  почему. Без этого фикса `pnpm test` (широкий прогон) падал бы, хотя
  TZ-заданная узкая команда `pnpm test -- field-capacity` его не ловит —
  почёл нужным закрыть регрессию, а не оставить с формальной отговоркой
  «не мой conflict key».
- `product-form-dialog.component.ts`/`module-form-dialog.component.ts` не
  трогал — проверил `grep`: там пока нет ни одного вызова `colSpanClass`/
  `controlMaxClass`/`capacityFor` (409/310 ещё не подключали реестр к
  шаблонам), так что подключение — точно их зона, не пересекается с этой TZ.
- Conflict disclosure: `tasks/_active/TZ-UX-345.md` (chrome-rail/page layout,
  Layer 3, другие файлы) — не пересекается, не трогал. Остальной большой
  объём чужого несвязанного uncommitted WIP в дереве — не тронут.

## Review handoff

- [x] READY FOR REVIEW — N/A, shared-utility TZ без явного review-wave в этой очереди

## Closeout (после PASS)

- [x] archive + lock + progress + удалить `_active`
- [x] Status = DONE
- closed_at: 2026-08-22
