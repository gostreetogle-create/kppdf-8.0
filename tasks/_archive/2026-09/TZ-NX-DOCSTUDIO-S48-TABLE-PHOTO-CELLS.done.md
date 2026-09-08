# TZ-NX-DOCSTUDIO-S48-TABLE-PHOTO-CELLS: фото в ячейке таблицы

**РОЛЬ АГЕНТА:** Executor (NX studio + shared render) — claude
**LAYER:** 3 · **SIZE:** L
**PAGES:** `/studio/:id`
**PAGE_DOCS:** `docs/pages/document-studio.page.md`
**CONFLICT KEYS:** `studio-blocks-canvas.component.ts`; `.spec.ts`; `studio-data-resolver.ts`; `studio-table-defaults.ts`; `docs/pages/document-studio.page.md`; `docs/agent-checklists/WAVE-DOCSTUDIO-S47-S48.md`; `docs/agent-checklists/_NOW.md`

## Claim slot

- agent_id: claude
- claimed_at: 2026-09-08T19:49:11Z (filed before reading/editing this TZ's product code)
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable

## Что сделано

**Detection:** key-based `isPhotoColumnKey` (backend, `studio-data-resolver.ts`, reuses S47's `COLUMN_ALIASES.photo`) and `isStudioPhotoColumnKey` (frontend, new export in `studio-table-defaults.ts`) — same 9-alias list in both, matching this repo's existing per-layer alias-copy convention. No new `type: 'photo'` column-type variant added (not needed for any acceptance scenario).

**Canvas:** `isPhotoColumnAt(block, columnIndex)`; template branches per-cell — `<img [src]="cell">` when non-empty, `.table-preview__photo-empty` "Нет фото" span when empty. New CSS using existing OKLCH tokens.

**Backend:** `renderStudioTableHtml` branches per-column via `isPhotoColumnKey`; new `renderPhotoCellHtml` — `<img>`/`<span class="pi-photo-empty">Нет фото</span>`, mirroring legacy `table-template.service.ts` `formatCell`'s photo branch without touching Create-КП code.

**Security fix folded in (not a new TZ):** added a local `escapeAttrValue()` in the resolver — the shared `escapeHtmlValue`'s quote-escape regex (`/\\\"/g`) never matches a bare `"`, which was safe for text-node cells but would have let a manually-typed photo-cell value break out of the new `src="…"` attribute. Locked with a spec (`"><script>` cannot inject a literal tag). Did not touch the shared `escapeHtmlValue` itself (broad blast radius, out of scope).

**Docs:** `document-studio.page.md` S48 paragraph; `PAGE-TZ-INDEX.md` row; `WAVE-DOCSTUDIO-S47-S48.md` row 2 → DONE, WAVE marked DONE overall.

**Known limitation (unchanged from S47):** backend PDF bake path still doesn't filter `tableHiddenColumnKeys` at all — wider pre-existing gap, not named in either audit or this TZ's steps, not touched.

## Gates

- `backend`: jest (resolver + document.service + output.service) 57/57, `tsc --noEmit` 0 errors, eslint 0 errors on touched files
- `frontend-nx`: jest (full `pages/studio` dir) 109/109, `nx build kppdf-web` exit 0
- `pnpm architecture:check`: passed (1473 files; baseline 17)

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-09-08
closed_by: claude
verification:
  - acceptance criteria: PASS (all 3 TZ acceptance criteria verified by dedicated tests)
  - typecheck: PASS (backend tsc 0 errors; frontend nx build 0 errors)
  - tests: PASS (backend 57/57 targeted; frontend 109/109 full studio dir)
  - lint: PASS on touched backend files; frontend baseline unchanged from S47 (no new errors introduced)
  - checklist: ADDED (`docs/agent-checklists/TZ-NX-DOCSTUDIO-S48-TABLE-PHOTO-CELLS.md`)
  - progress.md: REDIRECT (не ведётся; статус — `_NOW.md` / WAVE file)
  - status synchronization: PASS (`docs/agent-checklists/WAVE-DOCSTUDIO-S47-S48.md` row 2 → DONE; WAVE DONE overall)
