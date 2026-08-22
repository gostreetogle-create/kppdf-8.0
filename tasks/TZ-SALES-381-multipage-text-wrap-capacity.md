# TZ-SALES-381: Вместимость страницы КП — перенос длинного текста

PAGES: /proposals/create
PAGE_DOCS: proposals-create.page.md
РОЛЬ АГЕНТА: Backend Developer
ЗАВИСИМОСТИ: TZ-SALES-377 DONE
LAYER: 4
CONFLICT KEYS: backend/src/modules/document-template/document-template.service.ts; backend/src/modules/document-template/document-template.continuation.spec.ts

Проверено: `splitPreviewLines` считает `rowsOnPage += 1` (`document-template.service.ts` ~747–801); `estimateAutoRowCapacity` не видит `productName`/`description`; DTO `BuildPreviewLineDto.productName` + `description`. UI «КП» = сущность `Quotation`.

## ИСХОДНОЕ

Длинное наименование/описание клипается (`overflow:hidden` на таблице). Геометрия рамки считает все строки одинаковой высоты.

## ЧТО ДЕЛАТЬ

ШАГ 1: В `splitPreviewLines` вместо `rowsOnPage += 1` — вес строки: `1 + extraWrap`. `extraWrap = max(0, ceil(textLen / 36) - 1)`, `textLen` = длина `productName` + (description, если не пусто). Clamp extra ≤ 3.

ШАГ 2: Ручной `rowsFirstPage`/`rowsNextPage` > 0 тоже через вес (слот = единица веса, не «1 линия = 1 слот»).

ШАГ 3: Jest в `document-template.continuation.spec.ts`: 8 коротких имён при `rowsFirstPage: 8` → 1 секция; 8 имён по ≥120 символов → больше 1 секции. Не ломать тест header-drop (короткие Item N).

## ИЗМЕНЯТЬ

Только CONFLICT KEYS. При необходимости одна строка в `proposals-create.page.md` (successor 381 DONE).

## НЕ ИЗМЕНЯТЬ

- FE Create КП / table editor UI
- `rowsFirstPage` schema defaults
- PDF renderer / Chromium
- Deploy, builder

## КРИТЕРИИ ПРИЁМКИ

```text
cd backend && pnpm exec tsc -p tsconfig.build.json --noEmit
cd backend && pnpm exec jest --runInBand document-template.continuation.spec
```

known_limitation: точный wrap как в браузере не считаем — conservative 36 символов.
