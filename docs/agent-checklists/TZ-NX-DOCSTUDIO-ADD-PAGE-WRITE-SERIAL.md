# TZ-NX-DOCSTUDIO-ADD-PAGE-WRITE-SERIAL checklist

> Status: **DONE**
> Marker: `tasks/_active/TZ-NX-DOCSTUDIO-ADD-PAGE-WRITE-SERIAL.md` (removed after archive)
> Wave: `docs/agent-checklists/WAVE-2026-09-13-STUDIO-OPS.md` (1.2)

## Claim slot

- agent_id: claude
- claimed_at: 2026-09-13T10:20:00Z
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (unattended CLI, no team-room MCP)

## Preflight

- [x] `tasks/_active/` empty before claim (TZ 1.1 archived first) — no conflicting claims
- [x] TZ + audit (`docs/audits/2026-09-13-docstudio-add-page-dead.md`) read
- [x] Claim slot filled; marker in `tasks/_active/`

### Preflight Check Output
- **Context read:** TZ text, `docs/audits/2026-09-13-docstudio-add-page-dead.md`, `studio-editor.page.ts` (`addPage`, `setOrientation`/`setBackground*`/`togglePageNumbering`, `catalogWriteChain`, `hydrateTablesSerially`, `refreshLiveDataSetsOnLoad`, `refreshCatalogTablesOfKind`, `conflict()`, the four blind `revision+1` sites), `studio-document.controller.ts`/`.service.ts` (`addBlock`/`updateBlockLayouts` response shapes)
- **Key Constraints:** frontend-only conflict keys (no BE change unless a real BE bug found — none was); not parallel with TABLE-NECESSITY-CLEANUP on `studio-editor.page.ts`
- **Planned Deliverable:** one document write queue (`catalogWriteChain`, kept name) covering `addPage`/orientation/background/page-numbering + the on-load hydrate path it was missing; blind `revision+1` → follow-up GET; conflict() toast-once
- **Validation Path:** new `studio-editor-write-serial.spec.ts` + full FE suite + live Playwright evidence + `nx build kppdf-web` last

## Evidence (ШАГ 0)

См. `docs/agent-checklists/evidence/TZ-NX-DOCSTUDIO-ADD-PAGE-WRITE-SERIAL.txt`

## Acceptance (из TZ)

- [x] 1. Evidence Network: add page после hydrate → **200**, `manualPageCount` +1, список растёт, toast успех — подтверждено живым Playwright-прогоном (3 клика → 3×200, revision 140→142, manualPageCount 5→7)
- [x] 2. Spam-клик «+ Страница» ×3 при live tables → 3 страницы, без silent no-op — подтверждено тем же живым прогоном + unit-тестом (revisions [1,2,3])
- [x] 3. Нет слепого `revision + 1` на путях create table/text/image + layout save — все 4 сайта переведены на follow-up GET, unit-тест подтверждает
- [x] 4. Specs зелёные; `nx build kppdf-web` last — см. Gates

## Integrity slot (до READY / archive)

- [x] Тип изменения: bugfix (write serialization + optimistic-concurrency correctness), не новая архитектура
- [x] FIC: N/A (no new page/permission/module)
- [x] page.md: `docs/pages/document-studio.page.md` — короткая заметка (см. ниже)
- [x] DOMAIN-MAP: N/A
- [x] Чужой WIP не в коммите; conflict keys соблюдены (только `studio-editor.page.ts` + specs; не трогал `studio-pages-panel.component.ts` — его wiring уже был корректен, баг был выше по цепи)
- [x] Канон: BE `manualPageCount`/schema не тронуты (не найдено реального BE-бага в ШАГ 0)

## Gates (факт)

- `cd frontend-nx && pnpm exec tsc -p apps/kppdf-web/tsconfig.app.json --noEmit` → exit 0
- `cd frontend-nx && pnpm exec jest studio-editor-write-serial.spec.ts studio-editor-hydrate-serial.spec.ts studio-editor-catalog-insert.spec.ts studio-editor-stale-liverows.spec.ts studio-editor-catalog-queue.spec.ts studio-editor-live-rows.spec.ts studio-editor-live-qty.spec.ts studio-editor-column-rehydrate.spec.ts --silent` → 8 suites / 24 tests PASS
- `cd frontend-nx && pnpm test` (full) → 124 suites / 856 passed + 7 skipped (863 total) PASS
- `cd frontend-nx && pnpm exec eslint apps/kppdf-web/src/app/pages/studio/studio-editor.page.ts apps/kppdf-web/src/app/pages/studio/studio-editor-write-serial.spec.ts apps/kppdf-web/src/app/pages/studio/studio-editor-catalog-insert.spec.ts` → 0 errors, 7 pre-existing-pattern warnings
- `pnpm architecture:check` (repo root) → PASS
- `cd frontend-nx && pnpm exec nx build kppdf-web` (last) → exit 0
- Live Playwright (local dev, real backend): 3× «+ Страница» → 3× PATCH 200, revision/manualPageCount strictly +1 each — see evidence/

## Executor report

**Root cause confirmed exactly as audit ranked it (#1):** `addPage` and its siblings
(`setOrientation`, `setBackgroundIndex`, `setBackgroundOpacity`,
`togglePageNumbering`) read `document().revision` and fired `documents.update`
directly, outside the existing `catalogWriteChain` queue — which itself only
covered vitrina/putDataSet writes, not even the on-load hydrate
(`refreshLiveDataSetsOnLoad` called `hydrateTablesSerially` directly, bypassing
the chain entirely). Two writes racing the same stale revision → 409 → repeated
409 while the conflict dialog was already open → true silent no-op (audit's #2).

**Fix:**
1. `enqueueDocumentWrite()` — every one of the 5 ACCEPT-minimum mutations now
   queues onto `catalogWriteChain` (kept that name — documented its broadened
   scope instead of renaming every call site) and reads `this.document()` fresh
   only once it actually runs.
2. `refreshLiveDataSetsOnLoad` — was a plain `async` function calling
   `hydrateTablesSerially` directly; now synchronously reassigns
   `catalogWriteChain` itself (matching `refreshCatalogTablesOfKind`'s existing
   pattern) so anything enqueued right after document load — even in the same
   tick — correctly waits behind it. This was the actual gap that made the
   "minimum 5" chain insufficient on its own; caught by a failing unit test
   before being fixed, not assumed.
3. `refreshDocumentRevisionAfterBlockWrite()` — the 4 blind `revision + 1` sites
   (create table/text/image, layout save) now await a follow-up `getById`
   instead, since `blocksService.create`/`updateLayouts` bump the document's
   revision server-side but never return it. Awaited *before* the caller's own
   promise resolves, so a write that follows synchronously (e.g.
   `setBlockCatalogSource` right after `createTableBlock`) reads the confirmed
   revision, not a stale guess.
4. `conflict()` — a repeat conflict while the dialog is already open now toasts
   once ("не записано — уже открыт диалог") instead of silently returning.

**Regression caught and fixed during this same TZ (not shipped broken):**
`studio-editor-catalog-insert.spec.ts`'s `documentsService` test double never
declared `getById` — harmless before this TZ (nothing called it), but
`createTableBlock`'s new follow-up-GET now does, so its promise rejected inside
the mock and silently dropped the rest of `insertCatalogTable`'s flow. Fixed the
fixture (added `getById` mock + a few more flush ticks for the added async hop)
rather than weakening the production fix.

**Live-verified, not just unit-tested:** ran the actual fix against a real
backend + real browser (Playwright, local dev) on the same document used in
TZ-NX-DOCSTUDIO-TABLE-PHOTO-BROKEN-IMG's evidence — 3 rapid «+ Страница» clicks
produced exactly 3 successful PATCHes with strictly increasing revision/
manualPageCount, zero 409s, zero console errors.

**Not touched:** `studio-pages-panel.component.ts` (wiring was already correct —
bug was in the editor's write-queueing, not the panel), BE `manualPageCount`
schema/DTO (no real BE bug found), Necessity-table IA, photo resolver (TZ 1.1,
already DONE), insert-table CTA.

## Closeout

- [x] archive + удалить `_active`
- [x] Status = DONE
- closed_at: 2026-09-13T11:10:00Z
