# TZ-DESKTOP-SUPPLY-EXCEL-A checklist

> Status: **DONE**
> Marker: removed (`tasks/_active/TZ-DESKTOP-SUPPLY-EXCEL-A.md` deleted at closeout)
> Wave: `WAVE-NX-SUPPLY-OPS` (6/7)

## Claim slot

- agent_id: claude
- claimed_at: 2026-09-08T00:00:00+03:00
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (no Team Room CLI in this executor)

## Preflight

- [x] `import-targets.ts`, `import-mapping.ts`, `multi-import.ts` read — column defs, header-classifier (alias substring match), row-validation pipeline (`ValidatedImportRow`), existing `fetchDedupeKeys` pattern for reference-lookup fetches
- [x] `App.svelte` supplyRequest send block (`POST /api/supply-requests`) and `confirmMapping()` wiring read
- [x] Found the canon test command (desktop has no `pnpm test` script) via `docs/agent-checklists/TZD-51.md`: `cd desktop && npx tsx --test src/core/*.test.ts src/core/ai/*.test.ts src/importers/*.test.ts src/ai-runner/*.test.ts`
- [x] `tasks/_active/` checked — no competing claim

## Acceptance

- [x] Форма/импорт с новыми колонками; miss = красная строка
- [x] desktop gates; bump patch version только если меняется installer-facing — иначе skip bump (skipped, 0.5.9 unchanged)
- [x] archive

## Integrity slot (before READY / archive)

- [x] Type: other (Desktop import pipeline; no NX/backend route, no new permission)
- [x] FIC §A–E: N/A — Desktop-only, no web route/permission
- [x] page.md: `desktop/README.md` §Снабжение (new) + `docs/pages/supply.page.md` TZ reference row
- [x] DOMAIN-MAP: N/A
- [x] No unrelated dirty WIP staged

## Build integrity

- N/A (Desktop, not `kppdf-web`) — `pnpm run typecheck` (tsc --noEmit) + `pnpm run check` (svelte-check) used instead

## Gates (fact)

- PASS: `cd desktop && npx tsx --test src/core/*.test.ts src/core/ai/*.test.ts src/importers/*.test.ts src/ai-runner/*.test.ts` — 124/124 (6 new; 1 alias-collision regression caught and fixed before commit)
- PASS: `cd desktop && pnpm run typecheck` (tsc --noEmit)
- PASS: `cd desktop && pnpm run check` (svelte-check) — 396 files, 0 errors, 0 warnings

## Executor report

- `import-targets.ts`: added `supplierName`, `orderNumber`, `orderLabel`, `invoiceNo`, `deliveryNote`, `paid` columns to `supplyRequest`; trimmed `orderId`/`supplierId`'s generic aliases (`заказ`/`поставщик`) to avoid alias collisions with the new name-based columns.
- `multi-import.ts`: new `SupplyRequestLookups`/`EMPTY_SUPPLY_LOOKUPS`/`normalizeLookupKey` exports; `validateTableRows`/`validateSupplyRows` take an optional lookups param; match rules — article → materialId, supplierName → supplierId, orderNumber → orderId (order always wins over orderLabel, XOR); an explicit raw ObjectId column still wins over any name match (unchanged validation); miss on an explicitly-filled match column is `invalid`, no silent create.
- `App.svelte`: new `fetchSupplyLookups()` (paginated `/api/materials`, `/api/organizations?type=supplier`, flat `/api/orders`) wired into `confirmMapping()` only when a `supplyRequest` block is present (mirrors the existing `workTypeNames` conditional-fetch pattern); POST payload gained `orderLabel`/`invoiceNo`/`deliveryNote`/`paid` (via the existing `boolOr()` helper).
- Caught and fixed one regression pre-commit: the initial `invoiceNo` alias `'счёт'` substring-matched "Расчётный счёт" (counterparty column), making `supplyRequest` spuriously suggest itself for counterparty-only files — narrowed to full-phrase aliases (`'счёт №'`, `'номер счёта'`, …).
- conflict disclosure: touched `App.svelte` beyond the TZ's listed conflict keys — justified in the claim file (it's the only place holding the POST payload + lookup fetch). Unrelated dirty WIP in the tree (docker-compose.yml, start.mjs, build-info.ts, data/, reports/, other nx-supply TZ files) — none staged.
- known limitation: material lookup keys on both article AND name (name inserted after article per material, so a same-text collision between one material's name and another's article would let the second insertion win) — acceptable for v1, documented here rather than hidden.

## Closeout

- [x] archive + DONE lock + remove `_active` marker
- closed_at: 2026-09-08T00:45:00+03:00
