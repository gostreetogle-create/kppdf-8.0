# TZ-NX-DOCSTUDIO-S14-TABLE-FORMAT: формат колонок D3

**РОЛЬ АГЕНТА:** Executor (backend)  
**LAYER:** 3  
**PAGES:** document-studio  
**PAGE_DOCS:** `docs/architecture/nx-doc-studio.md` D3  
**ЗАВИСИМОСТИ:** S13 VAT row DONE  
**CONFLICT KEYS:** `studio-data-resolver.ts`; `renderStudioTableHtml`

## ИСХОДНОЕ

Cells — raw strings. Column `type: 'currency'|'number'` и `align` частично игнорируются в body.

## ЧТО ДЕЛАТЬ

1. `renderStudioTableHtml`: format numbers with ru-RU locale (2 decimals currency, integer qty).
2. Respect `column.align` on td/th.
3. Footer totals use same formatter.
4. Spec: price 1500.5 → `1 500,50` or project number format.

## КРИТЕРИИ ПРИЁМКИ

1. Preview table currency column formatted.
2. `pnpm test -- studio-data-resolver` exit 0.
3. `nx build kppdf-web` exit 0 last.

## Финализация

Archive → `tasks/_archive/2026-09/TZ-NX-DOCSTUDIO-S14-TABLE-FORMAT.done.md`
