# TZ-NX-DOCSTUDIO-S47-COLUMN-MAP-PARITY: ключи колонок ↔ ERP поля

**РОЛЬ АГЕНТА:** Executor (BE + NX studio) — claude
**LAYER:** 3 · **SIZE:** L
**PAGES:** `/studio/:id`
**PAGE_DOCS:** `docs/pages/document-studio.page.md`
**CONFLICT KEYS:** `backend/src/modules/studio-document/studio-data-resolver.ts`; `.spec.ts`; `frontend-nx/apps/kppdf-web/src/app/pages/studio/studio-editor.page.ts`; `studio-table-defaults.ts`; `studio-table-properties.component.ts` (wiring only); `docs/pages/document-studio.page.md`; `docs/agent-checklists/WAVE-DOCSTUDIO-S47-S48.md`

## Claim slot

- agent_id: claude
- claimed_at: 2026-09-08T19:46:35Z (retroactive — see process note in the working checklist, `docs/agent-checklists/TZ-NX-DOCSTUDIO-S47-COLUMN-MAP-PARITY.md`, kept for the record)
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable

## Что сделано

**Backend (`studio-data-resolver.ts`, `studio-document.module.ts`, `.spec.ts`):**
- `LineItem` += `description?`, `photoUrl?`.
- `COLUMN_ALIASES`: `sku` += `article`; new `photo` (9 aliases, parity with `proposal-table-layout.util.ts`) and `description` groups.
- `lineValue`: `+photo`, `+description` cases.
- Catalog branch: resolves `description` from the catalog doc; resolves `photoUrl` via new `resolveCatalogPhotoUrls`/`catalogPhotoId` helpers (batch `Photo` lookup by `mainPhotoId` → fallback first `photoIds` → `storageUrl`).
- `StudioDataResolverService` gains an injected `Photo` model (7th ctor arg); module registers it in `forFeature`.
- quotation-items needed no resolver code change (fields already present on `QuotationItem`, just weren't read); order-items still lacks description/photo fields on `OrderItem` (known limitation, separate schema TZ).
- New/updated tests: alias-by-key mapping incl. photo/description, `article`≡`sku`, full PO-canon 6-key catalog resolve with no positional leaks. 14/14 resolver tests green; 67/67 across the whole `studio-document` module.

**Frontend (`studio-editor.page.ts`, `studio-blocks-canvas.component.ts`):**
- `rehydrateLiveRowsAfterColumnChange(block)`: fires from `patchTableSettingsForBlock` whenever the patch includes `tableTemplateColumns` (covers template-select AND manual add/remove/move/rename-key) on a live-sourced table — re-puts the dataSet with empty rows so the backend re-fetches `liveRows` at the new width/keys instead of leaving stale rows misaligned under new headers (BUG-1).
- `tableRows()`: live rows now pass through `studioVisibleColumnIndices`, matching manual rows' hidden-column filter (BUG-5, audit-confirmed, low-risk one-line fix folded in — flagged in the working checklist, not silently added).
- New specs: `studio-editor-column-rehydrate.spec.ts` (2 tests), plus a new describe block in `studio-blocks-canvas.component.spec.ts` for hidden-column parity. All pass; existing S46/S45 specs unaffected.

**Docs:** `document-studio.page.md` gained an S47 paragraph (bind-by-key rule, rehydrate rule, hidden-column parity, known_limitation on the missing PO-canon `TableTemplate` seed); `PAGE-TZ-INDEX.md` row updated.

**ШАГ3 (defaults for KP path):** no seed with PO's exact 6 canon keys exists (`KP_LINE_ITEM_COLUMNS`/`КП — позиции` is a different, №|Наименование|Кол-во|Ед.|Цена|Сумма preset) — per the TZ's own escape hatch, documented as known_limitation instead of authoring a new seed/migration (out of conflict keys, out of an L-size field-binding fix's scope).

**Known limitations (documented in page.md, not fixed):** OrderItem has no description/photo fields; backend PDF bake path still doesn't filter hidden columns at all (wider pre-existing gap than BUG-5, not named in the audit).

## Gates

- `backend`: jest `studio-data-resolver` 14/14, full `studio-document` module 67/67, `tsc --noEmit` 0 errors, eslint 0 errors on touched files
- `frontend-nx`: jest (5 targeted suites) 21/21, `nx build kppdf-web` exit 0
- `nx lint kppdf-web`: pre-existing unrelated a11y baseline failures only (last touched commit `8e47e50f`, S34); my diff introduces no new lint errors (pure insertion, verified via `git diff --stat`)
- `pnpm architecture:check`: passed (1473 files; baseline 17)

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-09-08
closed_by: claude
verification:
  - acceptance criteria: PASS (all 4 TZ acceptance criteria verified by name in tests; see checklist)
  - typecheck: PASS (backend tsc 0 errors; frontend nx build 0 errors)
  - tests: PASS (backend 67/67 studio-document suite; frontend 21/21 targeted suites)
  - lint: PARTIAL — backend clean; frontend pre-existing unrelated baseline failures only, no new errors from this diff (documented above)
  - checklist: ADDED (`docs/agent-checklists/TZ-NX-DOCSTUDIO-S47-COLUMN-MAP-PARITY.md`)
  - progress.md: REDIRECT (не ведётся; статус — `_NOW.md` / WAVE file)
  - status synchronization: PASS (`docs/agent-checklists/WAVE-DOCSTUDIO-S47-S48.md` row 1 → DONE, row 2 unblocked)
