# TZ-NX-DOCSTUDIO-S47-COLUMN-MAP-PARITY checklist

> Status: **DONE**
> Marker: `tasks/_active/TZ-NX-DOCSTUDIO-S47-COLUMN-MAP-PARITY.md`
> Commit/push: по `docs/GIT-POLICY.md`

## Claim slot (ОБЯЗАТЕЛЬНО до кода)

- agent_id: claude
- claimed_at: 2026-09-08T19:46:35Z **(process note: filed after implementation started, not before — see below)**
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (no Team Room CLI in this session)

**Process deviation (self-flagged):** the Claim slot for this TZ was filed
retroactively — implementation (resolver aliases, module wiring, editor
rehydrate, canvas hidden-column fix, tests) was already underway when this
file was created, continuing directly from the row-0 recheck claim without a
fresh CLAIM for row 1. Verified before filing: `tasks/_active/` was empty at
every check during the session and `git status` never showed a foreign claim
on this TZ's conflict-key files, so no actual collision occurred — this is a
protocol-order gap, not a conflict incident. Flagging per standing instruction
to surface process errors rather than silently continue.

## Preflight

- [x] Get-Location + git rev-parse --show-toplevel → оба `D:\kppdf-8.0`
- [x] Прочитал `_NOW.md` + `tasks/_active/` — нет чужого CLAIM на те же keys (empty both times checked)
- [x] TZ / канон / deps прочитаны (S47-AUDIT-RECHECK DONE + PASS verdict; TZ text; `proposal-table-layout.util.ts`; product/quotation/order schemas)
- [x] Claim slot заполнен (retroactively, see note above); Status = READY FOR REVIEW
- [x] `tasks/_active/TZ-NX-DOCSTUDIO-S47-COLUMN-MAP-PARITY.md` на месте

### Preflight Check Output
- **Context read:** recheck audit (PASS); `proposal-table-layout.util.ts`; `product.schema.ts`, `product-module.schema.ts`, `material.schema.ts` (description/photoIds/mainPhotoId); `quotation.schema.ts`, `order.schema.ts` (item field parity); `photos/photo.schema.ts` (storageUrl); `document-template.service.ts` `previewLineValue`/`syntheticKpColumn` (Create-КП reference); `table-template.schema.ts` (`KP_LINE_ITEM_COLUMNS` ≠ PO canon — confirms ШАГ3 known_limitation path)
- **Key Constraints:** map by `column.key` only; 3-col generic docs must keep working; S46 liveRows stay ephemeral; no seed/migration work (out of conflict keys)
- **Planned Deliverable:** resolver alias+LineItem parity, catalog photo/description enrichment, FE rehydrate-on-column-change, canvas hidden-column parity for liveRows, docs
- **Validation Path:** backend + frontend focused specs, `nx build kppdf-web`, `architecture:check`

## Acceptance (из TZ)

- [x] PO layout 6 keys + catalog products → name not in Артикул; price not in Наименование; qty not in Фото as fake photo — verified by resolver spec `resolves catalog products into a PO-canon 6-key table without positional leaks`
- [x] Change «Вид таблицы» on live table → rows realign without reload page — verified by `studio-editor-column-rehydrate.spec.ts`
- [x] 3-col name/qty/price still works — unaffected (rehydrate guard only fires for hydratable `dataSource`; existing resolver/canvas specs for manual tables still green)
- [x] `article` ≡ sku — verified by resolver spec `treats \`article\` as an alias of sku`
- [x] Focused BE + NX tests PASS; `nx build kppdf-web` PASS last — see Gates

## Additional (beyond the 4 named steps, audit-confirmed, low-risk — flagged, not silently added)

- [x] BUG-5 fix: canvas `tableRows()` now filters `liveRows` through `studioVisibleColumnIndices`, same as manual rows (previously live tables ignored `tableHiddenColumnKeys`). One-line reuse of an existing helper in the same file/method I was already touching for the rehydrate wiring; not a new TZ, but noted here per standing "flag but fix trivial things inline" guidance.

## ШАГ3 disposition (defaults for KP path)

No `TableTemplate` seed exists with PO's canon keys (Артикул|Фото|Наименование|Описание|Ед.Изм.|Цена) — `table-template.schema.ts`'s only built-in preset (`KP_LINE_ITEM_PRESET_NAME` / `KP_LINE_ITEM_COLUMNS`) is a **different** column set (№|Наименование|Кол-во|Ед.|Цена|Сумма, no Артикул/Фото/Описание), matching the audit's note that it's "другой пресет". Per TZ's own escape hatch ("если a seed/template exists; else document known_limitation"), documented as a known limitation in `document-studio.page.md` instead of authoring a new seed/migration (out of this TZ's conflict keys and out of scope for an L-size field-binding fix). ШАГ2's rehydrate already makes manually-created/selected templates with the canon keys work correctly once picked.

## Integrity slot (до READY / archive)

- [x] Тип изменения определён: BE + NX code (resolver + module wiring + editor + canvas) + docs
- [x] FIC §A–E: N/A — no new page/permission/module/MCP; existing `/studio/:id` route and existing photo module reused (no new module registered as an app feature, just an existing model injected into an existing service)
- [x] page.md обновлён: `docs/pages/document-studio.page.md` (S47 paragraph) + строка в `docs/pages/PAGE-TZ-INDEX.md`
- [x] DOMAIN-MAP: N/A — no route/module/page contour change, only internal field-binding logic on the existing studio-document domain
- [x] SECTION-READINESS: N/A
- [x] Чужой WIP не в коммите; conflict keys соблюдены (staged only this TZ's named conflict-key files + tests)
- [x] Coupling map: N/A — no cross-page shared status/FK field touched
- [x] Канон: docs/DOCS-INTEGRITY.md

## Build integrity (обязательно для frontend-nx / kppdf-web)

- [x] Baseline до кода: N/A not captured before edits (process gap noted above) — post-change `nx build kppdf-web` PASS confirms no regression
- [x] Нет другого `tasks/_active/*` с `apps/kppdf-web/src/**` (checked — only this TZ's own marker present)
- [x] Закрытие: `nx build kppdf-web` — exit 0 (see Gates)

## Gates (факт)

- `cd backend && pnpm exec jest studio-data-resolver` → 14 passed (incl. 3 new S47 tests)
- `cd backend && pnpm exec jest studio-document` (full module) → 6 suites / 67 tests passed
- `cd backend && pnpm exec tsc -p tsconfig.build.json --noEmit` → 0 errors
- `cd backend && pnpm exec eslint <touched files>` → 0 errors/warnings
- `cd frontend-nx && pnpm exec jest studio-editor-column-rehydrate studio-blocks-canvas studio-editor-live-rows studio-table-defaults studio-table-properties` → 5 suites / 21 tests passed
- `cd frontend-nx && pnpm exec nx build kppdf-web` → exit 0 (Successfully ran target build); pre-existing unrelated warnings only (gantt-bars budget, one ngModel `??` hint in a file I did not touch)
- `cd frontend-nx && pnpm exec nx lint kppdf-web` → **pre-existing baseline failures unrelated to this diff** (a11y `click`/`interactive-supports-focus` errors in `studio-layers-panel.component.ts`, `studio-properties-panel.component.ts`, `studio-table-properties.component.ts`, `studio-text-properties.component.ts`, `studio-workspace-shell.component.html` — last touched at commit `8e47e50f`, S34, weeks before this TZ). My own diff to `studio-editor.page.ts`/`studio-blocks-canvas.component.ts` is a pure insertion (`git diff --stat`: +33/-0 on the editor page) and introduces no new lint errors; my new spec files carry only the same `no-non-null-assertion` warning style already present in sibling specs (e.g. `studio-editor-live-rows.spec.ts`). Not fixed — out of this TZ's scope (would touch unrelated components/files not in the conflict-key list).
- `pnpm architecture:check` → passed (1473 files; baseline 17; resolved since baseline: 2)

## Executor report

**Резолвер (`studio-data-resolver.ts` + `.spec.ts`):**
- `LineItem` type: `+description?`, `+photoUrl?`.
- `COLUMN_ALIASES`: `sku` += `article`; new `photo` (9 variants incl. `рисунок`/`фото`) and `description` groups, parity with `proposal-table-layout.util.ts`.
- `lineValue`: `+case 'photo'`, `+case 'description'`.
- Catalog branch (`fetchLiveRows`): now resolves `description` from the catalog doc and `photoUrl` via a new batch lookup (`resolveCatalogPhotoUrls`/`catalogPhotoId`) against the `Photo` collection (`mainPhotoId` → fallback first `photoIds` entry → `storageUrl`).
- `StudioDataResolverService` constructor: `+photoModel` (7th arg); `studio-document.module.ts` registers `Photo` in `forFeature`.
- quotation-items path needed **no** code change — `QuotationItem` already carries `description`/`photoUrl`; they just weren't read before. order-items still has no description/photo fields on `OrderItem` (known limitation, out of scope — would be an Order-schema change).

**Frontend (`studio-editor.page.ts`, `studio-blocks-canvas.component.ts`):**
- New `rehydrateLiveRowsAfterColumnChange(block)`: fires whenever `patchTableSettingsForBlock`'s patch includes `tableTemplateColumns` (covers **both** `onTemplateSelect` and manual `emitColumnStructure` add/remove/move/rename-key) on a block whose `dataSource` is live-hydratable — re-puts the dataSet with `rows: []` (not the stale override rows `refreshLiveDataSetsOnLoad` would preserve) so the backend re-fetches `liveRows` at the new column width/keys.
- `tableRows()` (canvas): live rows now pass through `studioVisibleColumnIndices(block)`, same hidden-column filter manual rows already used (BUG-5).

**Docs:** `document-studio.page.md` S47 paragraph (bind rule, rehydrate rule, hidden-column parity, known_limitation on the missing PO-canon seed); `PAGE-TZ-INDEX.md` row updated.

**Known limitations (documented, not fixed — out of scope):**
1. No `TableTemplate` seed with PO's exact 6 canon keys — operator creates/saves one manually; rehydrate then works correctly (see ШАГ3 disposition above).
2. `OrderItem` schema has no `description`/photo fields, so order-items-sourced tables show empty description/photo cells — would require an Order-schema TZ, not in this one's conflict keys.
3. Backend PDF bake path (`renderStudioTableHtml`/`injectTableContent`) still does not filter hidden columns at all (pre-existing gap wider than BUG-5, which was canvas-only) — not touched, not named in the recheck audit's BUG-5 or in this TZ's steps.

No archive/deploy/wipe actions taken. Ready for next TZ (`TZ-NX-DOCSTUDIO-S48-TABLE-PHOTO-CELLS`).

## Review handoff

- [x] Not required by TZ text beyond gates — no explicit Cursor/PO review gate named for this TZ; proceeding to archive per WAVE's "Claim → gates → archive → next" cycle instruction, consistent with the continuous-executor/UNATTENDED contract.

## Closeout (после PASS)

- [x] archive + progress + удалить `_active`
- [x] Status = DONE
- closed_at: 2026-09-08T19:55:00Z
