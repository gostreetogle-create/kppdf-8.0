# TZ-NX-DOCSTUDIO-S13-TABLE-VAT-ROW: НДС строка D3

**РОЛЬ АГЕНТА:** Executor (backend)  
**LAYER:** 3  
**PAGES:** document-studio  
**ЗАВИСИМОСТИ:** S12-TABLE-TOTALS DONE  
**CONFLICT KEYS:** `studio-data-resolver.ts`; `renderStudioTableHtml`; resolver specs

## ИСХОДНОЕ

S12: footer sum on last column. D3: итоги + НДС на сервере для согласованности PDF.

## ЧТО ДЕЛАТЬ

1. If column key/type matches `vat|nds|ндс` OR table settings `showVatRow` — append footer row «НДС» + computed value (default rate from org/document context or 20% configurable constant in resolver).
2. Sum row + VAT row order: subtotal → VAT → total (if total column exists).
3. Spec: 3 lines sum 1000 → VAT row 200 at 20%.
4. Disabled rows excluded (reuse S12 logic).

## known_limitation

Multi-rate VAT — PARK; single rate OK.

## КРИТЕРИИ ПРИЁМКИ

1. Preview table shows VAT footer when sum column present.
2. `pnpm test -- studio-data-resolver` exit 0.
3. `nx build kppdf-web` exit 0 last.

## Финализация

Archive → `tasks/_archive/2026-09/TZ-NX-DOCSTUDIO-S13-TABLE-VAT-ROW.done.md`
