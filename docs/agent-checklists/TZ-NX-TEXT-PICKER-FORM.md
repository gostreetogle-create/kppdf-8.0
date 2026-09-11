# TZ-NX-TEXT-PICKER-FORM checklist

> Status: **DONE**
> Archive: `tasks/_archive/2026-09/TZ-NX-TEXT-PICKER-FORM.done.md`
> Commit/push: по `docs/GIT-POLICY.md`
> **WAVE COMPLETE** — `WAVE-NX-TEXT-LIBRARY-HIERARCHY` (01/02/03 all DONE)

## Claim slot (ОБЯЗАТЕЛЬНО до кода)

- agent_id: claude
- claimed_at: 2026-09-11T08:16:31Z
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (no Team Room CLI in this session)

## Preflight

- [x] Get-Location + git rev-parse --show-toplevel → оба `D:\kppdf-8.0`
- [x] Прочитал `_NOW.md` + `tasks/_active/` — пусто (02 DONE/archived), нет чужого CLAIM
- [x] TZ прочитан; `studio-text-properties.component.ts` (flat category filter), `text-block-form-dialog.component.ts` (flat category select + required slug), `doc-studio-payloads.ts` (`textBlockPayload`), `text-blocks.registry.ts` + `text-blocks-http-data-source.ts` (raw `categoryId` column), `studio-editor.page.ts` `openSaveTextBlockDialog`/`applyLibraryText` (confirmed save-to-library reuses the same form dialog — fixing the dialog fixes AC #3 automatically), `doc-studio-registry-actions.ts` (`DocStudioDialogDeps.categories` already threaded)
- [x] Claim slot заполнен; Status = CLAIMED / IN PROGRESS
- [x] `tasks/_active/TZ-NX-TEXT-PICKER-FORM.md` на месте

## Acceptance

- [x] No subcategory → cannot save — `Validators.required` on `categoryId`; regression test added (was previously broken by a `.disable()`-based approach I caught and fixed — see report)
- [x] Picker names scoped to subcategory — `studio-text-properties` `filterSubId` drives `textBlocksService.list({ categoryId })`
- [x] Insert pastes + toast — unchanged `applyLibraryText` flow, untouched
- [x] Gates + WAVE COMPLETE

## Integrity slot (до READY / archive)

- [x] Тип изменения: page/component (form + picker cascade) + data-source enrichment
- [x] FIC: N/A — behavior change on existing flows, no new page/permission/module/MCP
- [x] page.md обновлён: `document-studio.page.md` (studio picker cascade note), `registries.page.md` (dialog fields + resolved category-name column)
- [x] Audit closeout: `docs/audits/2026-09-11-text-library-category-subcategory-audit.md` §6 (WAVE COMPLETE)
- [x] DOMAIN-MAP: N/A
- [x] SECTION-READINESS: N/A
- [x] Чужой WIP не в коммите; conflict keys соблюдены
- [x] Coupling map: N/A
- [x] Канон: docs/DOCS-INTEGRITY.md

## Build integrity

- [x] Baseline до кода: `nx build kppdf-web` → PASS
- [x] Закрытие: `nx build kppdf-web` → PASS exit 0 (last command)

## Gates (факт)

- `cd frontend-nx && pnpm exec tsc -p apps/kppdf-web/tsconfig.app.json --noEmit` → **PASS** exit 0
- `cd frontend-nx && pnpm test` → **PASS** 109 suites / 747 passed (rewrote `text-block-form-dialog.component.spec.ts` and `doc-studio-payloads.spec.ts` for the new contract; added `text-blocks-http-data-source.spec.ts`, 3 new tests)
- `cd frontend-nx && pnpm lint` → **PASS** — same pre-existing `271 problems (38 errors, 233 warnings)` baseline, verified twice via `git stash` (once misled by running bare `eslint <file>` instead of the real `nx`-aware `pnpm lint`, caught and re-verified with the authoritative command — see report)
- `pnpm architecture:check` → **PASS** (1475 files; baseline 17; resolved since baseline: 2)
- `cd frontend-nx && pnpm exec nx build kppdf-web` → **PASS** exit 0

## Executor report

- **`studio-text-properties.component.ts`**: flat "Категория" filter → root+subcategory cascade (`filterRootId`/`filterSubId`, `roots`/`subs` signals). Text-block list only filters when a subcategory is chosen; "Все категории"/"Все подкатегории" show everything unfiltered (same as the old flat behavior) rather than requiring both picks — a deliberate, minimally-disruptive choice, not literally forced by the AC wording.
- **`text-block-form-dialog.component.ts`**: flat "Категория" select → root+subcategory cascade; removed the `slug` field entirely (server auto-generates via `TextBlockService.create()`'s existing `slugify` fallback — already true before this TZ, just never exploited client-side). Edit mode resolves the existing leaf's root via `categoryService.getById(leafId).parentId` to pre-select both dropdowns.
- **Caught and fixed a real correctness bug before it shipped**: my first pass disabled the `categoryId` FormControl via `.disable()`/`.enable()` (matching Angular's own suggested pattern for avoiding a "disabled attribute with reactive form directive" console warning) while a root wasn't yet chosen. That's wrong: Angular excludes **disabled** controls from the parent `FormGroup`'s validity rollup, so `Validators.required` on a disabled `categoryId` silently stopped blocking submission — an empty-category `TextBlock` could be created, defeating AC #1 outright. Caught by re-running the "no subcategory → cannot save" test in isolation (a combined run had shown a misleading pass). Fixed by keeping the control always-enabled (so validation stays real) and using `[attr.disabled]` — an attribute binding, not Angular's `[disabled]` *property* binding — purely for the DOM-level visual gate, which doesn't trigger the reactive-forms conflict warning.
- **`doc-studio-payloads.ts`** `textBlockPayload()`: dropped the `slug` parameter/output entirely; `TextBlockPayload` type (`text-block.types.ts`) had `slug` made optional to match.
- **`text-blocks-http-data-source.ts`** / **`text-blocks.registry.ts`**: the registry's "Категория" column showed the raw `categoryId` ObjectId (audit-flagged smell). The data source now also fetches the full category list per query, builds an id→category map, and resolves each row to `"Root › Sub"` (or just the leaf name, or `—` for missing/dead ids) — a new `categoryName` field on the row, not a raw id. `createDocStudioDialogDeps`/`DocStudioDialogDeps.categories` was already threaded through from an earlier TZ, so this only needed the data-source itself.
- Save-to-library (`studio-editor.page.ts` `openSaveTextBlockDialog`) needed **no changes** — it already opens the same `TextBlockFormDialogComponent` fixed above, so AC #3 ("Save-to-library dialog: require subcategory") falls out automatically.
- Updated existing specs for the new contract (`text-block-form-dialog.component.spec.ts`, `doc-studio-payloads.spec.ts`); added `text-blocks-http-data-source.spec.ts` (categoryName resolution + fallback + search-still-works). `studio-text-properties.component.spec.ts` needed no changes (its generic category-service mock is arg-agnostic).
- Docs: `document-studio.page.md` (studio picker cascade), `registries.page.md` (dialog fields, resolved category column), audit §6 closeout, WAVE row 03 → DONE + WAVE COMPLETE marker.
- No live-browser/Playwright check (still unavailable in this environment; dev server from prior waves has since gone down). Build + the (now-verified-correct) regression tests cover every AC scenario directly.

## Closeout (после PASS)

- [x] archive + progress + удалить `_active`
- [x] Status = DONE
- closed_at: 2026-09-11T08:55:00Z
