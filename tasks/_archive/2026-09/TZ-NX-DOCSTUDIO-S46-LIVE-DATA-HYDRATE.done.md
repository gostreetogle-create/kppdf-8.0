# TZ-NX-DOCSTUDIO-S46-LIVE-DATA-HYDRATE — DONE

- agent_id: freebuff
- claimed_at: 2026-09-06T18:27:00+03:00
- archived_at: 2026-09-06T22:33:02+03:00
- implementation_sha: bf90a214409e3dfe1a9bd7ddad3900ff1938e73b
- status: DONE

## What shipped

**Root cause (audit-confirmed):** `saveLayouts` replaced `blocks` with the layout-API
response, which never carries ephemeral `settings.liveRows` → rows inserted from
«Выбрано» vanished after any drag/resize save.

**Fix (client-only, no Mongo persist):**

1. `studio-block-helpers.ts`: new `STUDIO_EPHEMERAL_SETTING_KEYS` (`liveRows`, `imageUrl`)
   + `studioPreserveClientBlockSettings(local, remote)` — server fields win; ephemeral
   client-only settings are carried over when the server response omits them.
2. `studio-editor.page.ts` `saveLayouts`: layout response is merged block-by-block by id
   via the helper (instead of naked `blocks.set(api)`), then the normalizer applies, then
   `ensureLiveRowsAfterLayoutSave` — a safety net that re-hydrates **once** via the
   existing `refreshLiveDataSetsOnLoad` only when a live-source table still has no rows
   (no loop: it fires only when rows are empty).

**Tests (15/15 green):** helpers spec gains the merge-preserve cases;
new `studio-editor-live-rows.spec.ts` locks the PO bug end-to-end: rows survive a save
whose response omits them; drag applies new server x/y while keeping rows; safety net
fires `putDataSet` only when liveRows are empty (bootstrap excluded from the count).

**page.md:** «Live-данные таблиц (S46)» paragraph — rows ephemeral client-side,
merge-restore after layout save, one-shot re-hydrate safety net.

## Gates

- tsc (apps/kppdf-web) — 0 errors
- focused jest — 15 passed / 0 failed
- ESLint on changed files — 0 errors (pre-existing warnings only)
- `nx build kppdf-web` LAST — exit 0

## Constraints honoured

- `liveRows` stay ephemeral — no backend/schema/Mongo change
- no Chrome C* rework, no warehouse, no desktop, no foreign WIP staged
