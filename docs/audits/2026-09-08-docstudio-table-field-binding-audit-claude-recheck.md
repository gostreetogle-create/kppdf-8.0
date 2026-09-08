# Audit recheck: DocStudio table field binding (Claude, 2026-09-08)

> TZ: `tasks/_ready/doc-studio/TZ-NX-DOCSTUDIO-S47-AUDIT-RECHECK.md` (docs-only, no product code touched)
> Base commit checked: `00d06c64` (main, `git fetch`/`merge` clean, up to date)

### Preflight Check Output
- **Context read:** `docs/audits/2026-09-08-docstudio-table-field-binding-audit.md`; `backend/src/modules/studio-document/studio-data-resolver.ts` (full file); `frontend-nx/apps/kppdf-web/src/app/pages/studio/studio-table-defaults.ts` (full file); `frontend-nx/apps/kppdf-web/src/app/pages/studio/studio-blocks-canvas.component.ts` L100-156, L310-340; `frontend-nx/apps/kppdf-web/src/app/pages/studio/studio-editor.page.ts` L1440-1570, L2220-2280; `frontend-nx/apps/kppdf-web/src/app/pages/studio/studio-table-properties.component.ts` L630-760; `frontend/src/app/pages/commercial/proposals/proposal-table-layout.util.ts` L1-60; `backend/src/modules/table-template/table-template.service.ts` (grep formatCell/photo, L380-620); `git log --oneline -5` on studio paths
- **Key Constraints:** zero product code; verdict per bug is CONFIRM/REJECT/AMEND with path:line, not a re-narration of the original audit
- **Planned Deliverable:** this file + WAVE row 0 update
- **Validation Path:** file exists with explicit per-bug verdict + overall PASS/BLOCK; `git status --short` shows only docs changes from this task

## Per-bug verdict

### BUG-1 PRIMARY — stale positional rows under changed columns — **CONFIRM**

`studio-table-properties.component.ts:677-683` `onTemplateSelect` emits `buildTableSettingsFromTemplate(template)` (new columns + the *template's own* sample rows) via `settingsChange`, which reaches `studio-editor.page.ts:1531` `patchTableSettings` → `patchTableSettingsForBlock` (`studio-editor.page.ts:1549-1568`). That method only merges the patch into `block.settings` and calls `blocksService.update` — it never touches `settings.liveRows` and never calls `putDataSet`. Canvas rendering in `studio-blocks-canvas.component.ts:322-328` (`tableRows()`) prefers `block.settings['liveRows']` over the freshly patched `tableTemplateSampleRows` whenever `liveRows` is a non-empty array. So switching "Вид таблицы" while a live/catalog source is active leaves the old `liveRows` (built for the old column count via `mapLineItemsToRows` in `studio-data-resolver.ts:98-105`) rendered under the new header row — exactly the "3 cells under 6 headers" symptom. Confirmed root cause and confirmed it survives S45/S46 (those TZs touched drag/click/Properties routing, not this settings-patch path).

### BUG-2 — incomplete alias map in NX studio resolver — **CONFIRM**

`backend/src/modules/studio-document/studio-data-resolver.ts:48-55` `COLUMN_ALIASES` only covers `name/qty/price/sum/unit/sku`. No `photo`, no `description`, no `article` (Latin). The `lineValue()` switch (`:74-96`) has no `case 'photo'` / `case 'description'` at all, and `LineItem` type (`:32-39`) does not declare `description` or a photo field, so even a matched alias would return `''`. Reference `frontend/src/app/pages/commercial/proposals/proposal-table-layout.util.ts:4-22` (`COLUMN_KEY_ALIASES`) already carries `photo` (9 variants incl. `рисунок`/`фото`) and `productSku: ['sku','article','артикул','productsku']` — parity gap confirmed against the legacy Create-КП reference the audit names.

### BUG-3 — thin LineItem from catalog path — **CONFIRM**

`studio-data-resolver.ts:404-411` (catalog branch of `fetchLiveRows`) builds only `{ productName: name, productSku: sku, unit, quantity: 1, unitPrice: price, total: price }` from `Product`/`ProductModule`/`Material` docs — no `description`, no photo URL, even though those fields exist on the source schemas. This is a direct consequence of BUG-2's `LineItem` type shape (no field to carry them) plus BUG-2's alias gap (no key to read them back with).

### BUG-4 — photo cell renders as plain text — **CONFIRM**

Both render paths are plain-text only: `studio-blocks-canvas.component.ts:137-141` (`@for (cell of row) { <td>{{ cell || ' ' }}</td> }`) and backend PDF path `studio-data-resolver.ts:137-142` (`renderStudioTableHtml`, `escapeHtmlValue(value)` into `<td>`). Legacy `backend/src/modules/table-template/table-template.service.ts` already has a working thumbnail pipeline (`formatCell` L441-490, `renderPhotoCell`-style helper L595-620: `<img src=... style="...object-fit...">`, `<span class="pi-photo-empty">Нет фото</span>` placeholder at L466/475/599/602) that is not wired into either NX studio render path. Confirmed gap, confirmed the legacy code S48 should draw from exists and works.

### BUG-5 — liveRows bypass hidden-column filter — **CONFIRM**

`studio-blocks-canvas.component.ts:322-328`: when `liveRows` is an array, `tableRows()` returns it directly (only stringifying cells), never passing through `studioVisibleTableRows()` (`studio-table-defaults.ts:86-94`), which is the only function that applies `studioTableHiddenColumnKeys` filtering. Manual-source tables (no `liveRows`) go through `studioVisibleTableRows()` and correctly hide columns; live/catalog-source tables do not. Confirmed asymmetry.

## Overall verdict

**PASS — proceed S47**

All five root causes in the Cursor audit are confirmed against the current `main` HEAD (`00d06c64`) with no REJECT or AMEND deltas. `TZ-NX-DOCSTUDIO-S47-COLUMN-MAP-PARITY` (alias parity + LineItem fields + re-hydrate on template/column change, keyed by `column.key` not index) and `TZ-NX-DOCSTUDIO-S48-TABLE-PHOTO-CELLS` (thumbnail rendering ported from `table-template.service.ts`) may proceed as scoped. No changes needed to either TZ's acceptance criteria based on this recheck.

One implementation note for S47 (not a TZ delta, just a pointer for the fix): `emitColumnStructure` (`studio-table-properties.component.ts:738-747`) already does the correct key-based remap via `remapRowsForColumnChange` for manual add/remove/move/rename-key column edits — `onTemplateSelect` (:677-683) is the one path that bypasses it. S47 should also make sure `liveRows` gets cleared or re-fetched (via `putDataSet`) whenever columns change, not just manual `tableTemplateSampleRows`, since BUG-1's actual trigger is stale `liveRows` outliving a column-count change.
