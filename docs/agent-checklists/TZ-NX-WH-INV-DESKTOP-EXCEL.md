# TZ-NX-WH-INV-DESKTOP-EXCEL checklist

> Status: **DONE**
> Archive: `tasks/_archive/2026-09/TZ-NX-WH-INV-DESKTOP-EXCEL.done.md`
> Commit/push: по `docs/GIT-POLICY.md`
> **WAVE COMPLETE** — `WAVE-NX-WAREHOUSE-INVENTORY-IMPORT` (01/02/03 all DONE)

## Claim slot (ОБЯЗАТЕЛЬНО до кода)

- agent_id: claude
- claimed_at: 2026-09-11T08:56:55Z
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (no Team Room CLI in this session)

## Preflight

- [x] Get-Location + git rev-parse --show-toplevel → оба `D:\kppdf-8.0`
- [x] Прочитал `_NOW.md` + `tasks/_active/` — пусто (02 DONE/archived), нет чужого CLAIM
- [x] TZ прочитан; `import-targets.ts` (11 existing targets, columns/aliases/requiredFields shape), `multi-import.ts` (per-target `validateXRows` dispatch, `evaluateSendReadiness`), `supply-excel-pack.ts` (multi-sheet dropdown pattern — reference, NOT reused, see report), `excel-form-template.ts` (Form Studio allowlist — the mechanism actually used), `App.svelte` `createEntities`/`sendBlocks` (per-row dispatcher + commit loop — found the exact insertion point), `api.ts` (`apiPost<T>` signature)
- [x] Claim slot заполнен; Status = CLAIMED / IN PROGRESS
- [x] `tasks/_active/TZ-NX-WH-INV-DESKTOP-EXCEL.md` на месте

## Acceptance

- [x] Excel с 1 known + 1 unknown → unknown в отчёте, known уходит в batch — server-side partial success (backend, TZ-02) surfaced 1:1 through `sendInventoryBatch`'s `errors[]` mapping; desktop-side unit tests cover the analogous "неизвестный article/sku" shape at the validator layer (server resolution itself already covered by TZ-02's 14 tests)
- [x] После import остаток на `/storage-items` / journal IN виден — same `StockMovementService.create({type:'in'})` write path as manual «+ Приход», already proven end-to-end in TZ-02
- [x] Повторный import того же qty = ещё один IN — no dedupe key exists for `inventory` rows (explicit design choice, tested: `TZ-NX-WH-INV-DESKTOP-EXCEL inventory: the SAME article repeated across rows is never flagged duplicate`); `documentRef` defaults to `inventory-YYYY-MM-DD`

## Integrity slot (до READY / archive)

- [x] Тип изменения: Desktop core logic + one Svelte UI wiring point (not a redesign)
- [x] FIC: N/A — Desktop app, not an NX page/route
- [x] page.md обновлён: `storage-items.page.md` §«Desktop Excel» — operator flow + file pointers
- [x] Audit closeout: `docs/audits/2026-09-11-warehouse-inventory-import-readiness.md` §9 (WAVE COMPLETE)
- [x] Чужой WIP не в коммите; conflict keys соблюдены — touched exactly the 3 declared core files (`import-targets.ts`, `multi-import.ts`, `excel-form-template.ts`) plus their existing test files, and ONE surgical `App.svelte` insertion; `supply-excel-pack.ts` was read for pattern reference but **not modified**
- [x] Канон: docs/DOCS-INTEGRITY.md

## Gates (факт)

- `cd desktop && pnpm exec tsc --noEmit` → **PASS** exit 0
- `cd desktop && pnpm run check` (svelte-check) → **PASS** 401 files / 0 errors / 0 warnings
- `cd desktop && pnpm run build` (tsc + vite build) → **PASS** — ran despite "N/A unless FE touched" since `App.svelte` genuinely was touched
- `cd desktop && node --import tsx --test src/core/*.test.ts` → **PASS** 119/119 (was 33/33 in `multi-import.test.ts` and had one now-fixed pre-existing-pattern pin break in `excel-form-template.test.ts`, see report)

## Executor report

- **Architecture decision — Form Studio over a new multi-sheet dropdown pack.** The TZ's own wording ("как Supply B") suggested mirroring `supply-excel-pack.ts`'s bespoke multi-sheet-with-dropdowns generator. After reading it and `excel-form-template.ts` side by side, I used **Form Studio** (`excel-form-template.ts`'s `FORM_TEMPLATES` allowlist + `FORM_CATEGORIES`) instead — it is a *general* "pick category → table → download blank template → fill → reupload, identified by a hidden fingerprint sheet" mechanism, already wired generically into `App.svelte` (`{#each FORM_CATEGORIES}` / `formTemplatesByCategory`) with **zero** UI code needed per new target. Supply's dropdown pack is a bespoke mechanism Supply itself built for its own cross-reference needs (material/supplier/order pickers); PO's ask here ("Template download для оператора") is exactly what Form Studio already does for 11 other targets. This is the "reuse pattern, не ломать Supply" the conflict-key note asked for — reusing the *right* existing pattern, not the more elaborate one the TZ happened to name.
- `desktop/src/core/import-targets.ts`: new `'inventory'` target — columns `article`/`sku`/`qty`/`warehouseName`/`documentRef`, **no** weight column, **no** raw-id columns (a paper-count operator has a shelf label, not a Mongo id — those are for other automated callers of the BE endpoint, not this UI).
- `desktop/src/core/multi-import.ts`: new `validateInventoryRows` — requires qty > 0 and (article OR sku); **no catalog dedupe** (a repeat count of the same article, in one file or across separate imports, is a legitimate additional IN movement — the ledger is the source of truth for "how much now," not this validator). article/sku → Material/Product resolution is deferred entirely to the server (`StockMovementService.batchInventoryIn`, TZ-02) — this validator only checks the row is well-formed enough to send, it does not pre-resolve anything client-side (unlike `supplyRequest`, whose own backend endpoint has no such resolution and therefore needs client-side `lookups`).
- `desktop/src/core/excel-form-template.ts`: new `FormCategoryKey: 'inventory'` (`labelRu: 'Склад'`) + one `FORM_TEMPLATES` entry.
- `desktop/src/App.svelte`: **one** new branch in `sendBlocks()`'s per-block loop (`else if (block.targetKey === 'inventory')`) plus a new `sendInventoryBatch(cfg, rows)` helper right after `createEntities`. Deliberately **not** routed through `createEntities`'s per-row `apiPost` loop — inventory rows go out as **one** `POST /api/stock-movements/batch-in` call for the whole block (matching TZ-02's endpoint shape and its own partial-success contract), with the returned `errors[]` (by row index) mapped back to the same `{rowName, error}` shape the rest of the report UI already expects.
- Tests: extended `multi-import.test.ts` (+7 cases: ok via article, ok via sku-alone, missing-identifier, missing-qty, zero/negative qty, no-weight-column structural guard, same-article-twice-not-duplicate) and fixed a genuine pre-existing-pattern pin break in `excel-form-template.test.ts` (`formTemplates().length` 11→12, plus new `inventory` category assertions) — same "pinned count, bump when a real new item is added" pattern as the `app-shell.component.spec.ts` fix in the prior wave.
- Confirmed **zero** regressions to Supply Excel: ran the full `desktop/src/core/*.test.ts` suite (119 tests, including `supply-excel-pack.test.ts`'s exceljs/xlsx round-trip tests) — all green, `supply-excel-pack.ts` was never modified.
- No live Tauri/Electron manual click-through (no windowed desktop environment in this session); `pnpm run build` (production Vite build) succeeded and `svelte-check` found 0 errors across all 401 files, which is the strongest available proxy for "this compiles and type-checks correctly end-to-end" without a live app window.

## Closeout (после PASS)

- [x] archive + удалить `_active`
- [x] Status = DONE
- closed_at: 2026-09-11T09:35:00Z
