# Catalog dialog width parity audit — DIALOG-305

**Date:** 2026-08-09
**Scope:** TZ-UX-DIALOG-305 (WAVE-CATALOG-UX-C #2)
**Rule:** большие каталоговые диалоги = эталон kind C `min(1120px, calc(100vw - 2rem))`;
kind A/B tiny dialogs (560/640) и kind D (1400) не трогаем.

## Результат

| Dialog | Shell | До | После | Статус |
|--------|-------|----|-------|--------|
| product FullEditor | `content` + `maxWidth` 1120 | 1120 (эталон) | 1120 | уже соответствовал |
| material FullEditor | `content` + `maxWidth` 1120 | 1120 (эталон) | 1120 | уже соответствовал |
| **module FullEditor** | `content` + `maxWidth` 1120 | form lg (~640) | **1120** | исправлен (DIALOG-305) |
| **composition picker «Добавить в состав»** | `form` + `maxWidth` 1120 | form xl (~920) | **1120** | исправлен (DIALOG-305) |

Проверено:
- Opener `dialog.open(..., { width: 'lg' })` на modules list/detail **не перебивает**
  ширину — `PiDialogComponent` читает ширину из собственных шаблонных входов
  (`variant` / `maxWidth`), `PI_DIALOG_CONFIG.width` нигде не инжектится.
- Sticky footer / body scroll не сломаны: `variant="content"` даёт ту же
  body-контракт (`flex-1 min-h-0 overflow-y-auto`), footer остаётся
  `sticky bottom-0 bg-paper shrink-0`.
- Tiny inventory dialogs (560/640), table-template (1400), FORM-307 (contracts/orgs)
  не менялись.

## Gates

```text
pnpm exec tsc -p tsconfig.app.json --noEmit  → PASS
pnpm test -- module-form-dialog|product-composition-picker → PASS
```
