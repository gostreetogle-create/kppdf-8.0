# TZ-DOC-326 — textblock categoryId UI (legacy enum → categoryId)

<!-- ARCHIVE_MARKER -->

## Outcome

Single-pass residual sweep removing every legacy text-block `category` enum path from the frontend UI layer. Backend untouched (TZ-DOC-323 territory). All 5 spec steps complete; residual grep → 0 hits.

## Commits

- commit: 26a314a46c9509a9119d567302df512c3dd24918 — feat(texts): remove legacy text-block category enum — categoryId only (TZ-DOC-326)
- closeout_commit: e0dbf84fe1fe43af01af1afb762df96dcfa011df — docs(closeout): TZ-DOC-326 archive + verification log + executor-report + status sync

## What was done (spec ШАГ 1–4)

**ШАГ 1 — Type alignment (`pi-text-blocks.service.ts`):**
- Removed `export type TextBlockCategory = 'legal' | 'intro' | 'outro' | 'custom'` (legacy enum type; consumers all import the real FK interface `TextBlockCategory` from `pi-text-block-categories.service.ts` — verified 4/4 import sites).
- Removed `category: TextBlockCategory` from `TextBlock` interface; `categoryId` JSDoc updated (TZ-DOC-315/323 FK).
- Removed `category?: TextBlockCategory` from `TextBlockListParams`.
- Removed `if (params.category) httpParams = httpParams.set('category', ...)` — the legacy network write path. Now only `categoryId` is ever sent.

**ШАГ 2 — Insert UI hints (dead `@if (t.category)` → categoryId name lookup):**
- `builder-tool-pane.component.ts:118` — replaced `@if (t.category) { <span>{{ t.category }}</span> }` with `@if (categoryName(t.categoryId); as name)`; added `categoryName(id)` helper resolving FK → friendly name via the loaded catalog (TZ-DOC-317/309 cache). Item now shows the real category name, not a stale enum.
- `builder.page.ts:193` — same replacement in the inline toolbar dropdown; added `categoryName(id)` helper; the `textsRes` httpResource inline type `category?: string` → `categoryId?: string`.
- Bonus (within conflict key): removed `PiPageHeaderComponent` + `ButtonComponent` from `builder.page.ts` imports — NG8113 unused-import warnings inherited from the TZ-DOC-324 pure-editor rewrite (the template renders neither). ng build now emits 0 warnings for builder.page.ts.

**ШАГ 3 — Texts catalog/editor:** already on categoryId-only from TZ-DOC-316 (`texts.page.ts` column/filter via `categoryId` lookup, `text-block-editor` category select via `selectedCategoryId`) — verified, no gap.

**ШАГ 4 — Grep sweep → 0 legacy writes:**
- `pi-text-blocks.service.spec.ts`: fixtures `category: 'legal'/'custom'` → `categoryId`; create/update expectations updated (`categoryId: 'cat-1'`), body assertions aligned.
- `texts.page.spec.ts`: block fixtures `category: 'custom'` dropped.
- `builder-tool-pane.component.spec.ts`: fixture `category: 'rekvizity'` → `categoryId: 'c2'`.
- Final grep `category: 'legal'|'intro'|'outro'|'custom'` / `t.category` / `category?: TextBlockCategory` in `frontend/src` → **0 hits** (only the intentional `categoryName(t.categoryId)` FK lookups remain).

## Acceptance criteria

1. `rg "t\.category|category\?: TextBlockCategory|TextBlockCategory" frontend/src` → 0 legacy hits (the enum type is gone; the FK interface from the categories service is the only `TextBlockCategory`). ✅
2. Insert list shows the friendly category name (or nothing when uncategorized), never a legacy enum. ✅ (tool-pane + inline dropdown via `categoryName()`)
3. Create/update text-block from the frontend never sends `category` enum — `list()` only sets `categoryId`. ✅
4. frontend tsc / jest targeted PASS; Executor report in checklist. ✅

## Gates (all green)

- frontend `tsc -p tsconfig.app.json --noEmit` → exit 0
- backend `tsc -p tsconfig.build.json --noEmit` → exit 0 (sanity; backend untouched)
- jest targeted `pi-text-blocks texts.page text-block-editor builder-tool-pane builder.page` → 5 suites / 40 PASS
- jest full → 898 PASS, 2 FAIL (pre-existing disclosed flakes: `button.component.spec.ts` double-emit, `pi-showcase-card.component.spec.ts` TZ-PRODUCTS-305 lucide icon provider — both outside TZ-DOC-326 files)
- `ng build --configuration=development` → exit 0, 0 warnings (unused-import cleanup)
- `git diff --check` → clean
- `bash OrchestratorKit/verify-status.sh` → PASS, 0 warnings

## Known limitations

- Legacy `category` strings remain in **backend** files (`text-block.service.ts`, schema, DTO, migrations, e2e spec) — those are TZ-DOC-323 doc comments / migration history, out of scope (frontend-only TZ).
- Browser E2E for the hint change — MANUAL_BROWSER_CHECK_REQUIRED (dev-stack credentials unavailable); unit + typecheck + build are the canonical evidence.
- Pre-existing flakes (`button.component.spec.ts`, `pi-showcase-card.component.spec.ts`) disclosed, not fix-forced.

## Related archive (chain map)

- TZ-DOC-315 (backend `?categoryId=` contract + TextBlockCategory module) → `.done.md`
- TZ-DOC-316 (UI dictionary + categories service/page) → `TZ-DOC-316-text-block-category-reference-and-picker.done.md`
- TZ-DOC-317 (builder picker filter) → `TZ-DOC-317-builder-texts-filter-by-category.done.md`
- TZ-DOC-318 (topbar polish + URL persist) → `TZ-DOC-318-builder-texts-topbar-category-filter.done.md`
- TZ-DOC-323 (backend legacy enum removal) → `TZ-DOC-323.done.md`
- **TZ-CHAIN-COMPLETE: 315 → 316 → 317 → 318 → 326 — text-block category lineage fully closed.**

## Successor

- **TZ-CHAIN-COMPLETE** marker for the doc-constructor text-block category work — no further TZ in this lineage.
