# TZ-DESKTOP-SUPPLY-EXCEL-A — DONE

- **agent_id:** claude
- **implementation_sha:** pending (filled at closeout)
- **TZ:** tasks/_ready/nx-supply/TZ-DESKTOP-SUPPLY-EXCEL-A.md
- **WAVE:** WAVE-NX-SUPPLY-OPS (6/7)
- **Deps:** TZ-SUPPLY-BE-INVOICE-DELIVERY (`1c4c381a`)

## Что сделано

- **Columns:** `supplyRequest` import target gained `supplierName`, `orderNumber`, `orderLabel`, `invoiceNo`, `deliveryNote`, `paid` (`desktop/src/core/import-targets.ts`); trimmed the now-ambiguous generic aliases off `orderId`/`supplierId` to avoid classifier collisions with the new name columns.
- **Match rules (Sheets parity):** `multi-import.ts` — new `SupplyRequestLookups` (materialsByKey/suppliersByName/ordersByNumber) threaded through `validateTableRows`/`validateSupplyRows`. article → `materialId`, supplierName → `supplierId`, orderNumber → `orderId` (wins over `orderLabel`, XOR mirrors the backend). A raw ObjectId column still wins outright. Miss on an explicitly-filled match column is `invalid` — no silent create; material creation stays the S5 manual HITL flow (NX `/supply-requests`).
- **Send path:** `App.svelte`'s `fetchSupplyLookups()` (paginated materials/organizations, flat orders) runs only when a `supplyRequest` block is present, feeding `confirmMapping()`'s `validateTableRows` call; the `POST /api/supply-requests` payload gained `orderLabel`/`invoiceNo`/`deliveryNote`/`paid` (reusing the existing `boolOr()` coercion).
- **Regression caught pre-commit:** the first `invoiceNo` alias (`'счёт'`) substring-matched "Расчётный счёт" (a counterparty column), making `supplyRequest` spuriously suggest itself on counterparty-only files — fixed by narrowing to full-phrase aliases.
- **Docs:** `desktop/README.md` new §Снабжение under "Excel Form Studio"; `docs/pages/supply.page.md` TZ reference row.
- Version bump skipped — app-logic only, not installer-facing (TZ's own rule).

## Gates (все зелёные)

```
desktop npx tsx --test src/core/*.test.ts src/core/ai/*.test.ts src/importers/*.test.ts src/ai-runner/*.test.ts → 124/124 (6 new)
desktop pnpm run typecheck (tsc --noEmit) → 0 errors
desktop pnpm run check (svelte-check) → 396 files, 0 errors, 0 warnings
```

## AC чек

1. Форма/импорт с новыми колонками; miss = красная строка ✔ (spec covers article/supplierName/orderNumber miss → invalid)
2. desktop gates; bump patch version только если меняется installer-facing — иначе skip bump ✔ (skipped, 0.5.9 unchanged)
3. archive ✔

## known_limitation

Material lookup keys both article and name into the same map; a same-text collision between one material's name and a different material's article resolves to whichever was inserted last (article first, then name) — acceptable for v1, not hidden.

## НЕ тронуто

Multi-sheet pack B; NSIS llama; NX pages; dropDatabase.
