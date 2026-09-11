# TZ-NX-DOCSTUDIO-TABLE-PHOTO-SMOKE checklist

> Status: **DONE**
> Archive: `tasks/_archive/2026-09/TZ-NX-DOCSTUDIO-TABLE-PHOTO-SMOKE.done.md`
> Commit/push: `7d904839` (pushed to origin/main)

## Claim slot

- agent_id: claude
- claimed_at: 2026-09-11T20:25:00Z
- workspace: D:\kppdf-8.0

## Preflight

- [x] Canvas (`studio-blocks-canvas.component.ts`) already correctly renders `<img>` **или** «Нет фото» empty-state for a photo column — confirmed by READING the code before assuming a bug (`isPhotoColumnAt` + `cell` truthy check), not by re-implementing.
- [x] **Live DB audit** (the TZ's own item 2, actually queried Mongo — `mongoose.connect('mongodb://localhost:27017/kppdf?...')`, `db.collection('table_templates').find(...)`): real seeded «Продукты» templates (3 duplicates found) key their photo column **`photoIds`**, not the shorter `photo` used in most test fixtures. Verified `photoIds`.toLowerCase() = `'photoids'` **is** already in `PHOTO_COLUMN_KEY_ALIASES`/BE `COLUMN_ALIASES.photo` — no key-mismatch bug exists for the real production template. This is a **confirmed-OK finding**, not a fix.
- [x] **Real bug found via the same DB audit, going one step further**: cross-checked all 304 `photos` collection documents' `storageUrl` against the actual files on disk in `backend/uploads/` — **237 of 304 (78%) are orphaned references** (Photo doc exists in Mongo, file does not exist on disk). Rendered raw, this is a browser broken-image icon on canvas/preview/PDF — indistinguishable from a real code bug to the operator, and very plausibly what the PO's screenshot actually showed (not "genuinely no photo assigned", which already renders correctly as «Нет фото»).
- [x] Checked whether a JS `onerror`-based client-side fallback would help the **preview iframe** specifically — no: `studio-editor.page.ts`'s preview `<iframe sandbox="allow-same-origin" [srcdoc]="html">` has **no `allow-scripts`**, so any inline `onerror` JS in the BE-rendered preview HTML would never execute. Confirmed `document-render.utils.ts`'s existing `inlineLocalUploadsForPdf` PDF-export helper has the *exact* same gap (silently keeps a broken URL on a missing file, no fallback).
- [x] Decided the one fix that covers **all three surfaces at once** (canvas/preview/PDF) without touching any of them individually: verify file-existence **at the source** — `studio-data-resolver.ts`'s `resolveCatalogPhotoUrls` — so a stale reference resolves to `''` there and the *already-correct* empty-state code paths in the canvas/BE-render fire naturally.

## Acceptance

- [x] Изделие **с** фото и file-на-диске → thumbnail (canvas) / `<img>` (PDF/preview HTML).
- [x] Изделие **без** фото (genuinely no `mainPhotoId`/`photoIds`) → «Нет фото», не blank — confirmed already correct, pre-existing.
- [x] Изделие с **orphaned** photo ref (Photo doc exists, file missing on disk) → now also «Нет фото», не broken-image icon (this TZ's actual fix).
- [x] Live-rows editor (Свойства): empty photo cell shows «Загрузите фото в карточке изделия» hint, not a bare «—».
- [x] Specs S48+ расширены; Gates PASS.

## Integrity slot

- [x] Тип изменения: 1 новая defensive-verification функция в `studio-data-resolver.ts` (file-exists check, same traversal-safe path resolution already established in `document-render.utils.ts`) + 1 новая UI-ветка (photo hint) в live-rows editor. **Не** новая photo storage architecture, **не** переделка upload pipeline — явно запрошенное ограничение TZ соблюдено.
- [x] FIC: N/A
- [x] page.md: не нашёл отдельного упоминания этого сценария в `document-studio.page.md` — секция §3.6 уже перечисляет фото-механику под «Строки таблицы»/qty правкой этой же волны; добавил короткую заметку там же, не завёл отдельную секцию.
- [x] Чужой WIP не в коммите; conflict keys соблюдены (`studio-data-resolver.ts`, `studio-blocks-canvas.component.ts`(только spec), `studio-table-defaults.ts`, `studio-blocks-canvas.component.spec.ts`)
- [x] Канон: не тронул upload/photos module целиком (`photos.service.ts`, multer config) — только studio table render path

## Gates (факт)

- `cd backend && pnpm exec tsc -p tsconfig.build.json --noEmit` → PASS
- `cd backend && pnpm exec jest --silent studio-data-resolver` → PASS 22/22 (+2 новых: orphaned-file→empty, path-traversal rejected)
- `cd backend && pnpm exec jest --silent` (full) → PASS 132/132 suites, 1306 tests
- `cd backend && pnpm lint` → 202/0, unchanged baseline; 0 findings in `studio-data-resolver.ts`/.spec.ts
- `cd frontend-nx && pnpm exec tsc -p apps/kppdf-web/tsconfig.app.json --noEmit` → PASS
- `cd frontend-nx && pnpm exec jest studio-table-properties.component.spec.ts studio-blocks-canvas.component.spec.ts --silent` → PASS 11/11 + 8/8 (+2 новых теста: photo hint в live-rows editor, `photoIds` real-world key на canvas)
- `cd frontend-nx && pnpm test` (full) → PASS 115 suites / 804 passed + 7 pre-existing skipped (811 total)
- `cd frontend-nx && pnpm exec nx lint kppdf-web` → 286/38 (было 282/38 после TZ-03) — **0 новых errors**; +4 warnings, все `@typescript-eslint/no-non-null-assertion` в новых spec-строках (established convention)
- `cd frontend-nx && pnpm exec nx build kppdf-web` → PASS (те же 2 pre-existing warnings)
- `pnpm architecture:check` (repo root) → PASS

## Executor report

- **Real, concrete "smoke" finding, not a guess**: connected directly to the actual local dev Mongo (`mongodb://localhost:27017/kppdf`) and queried `table_templates` — confirmed the real «Продукты» templates key their photo column `photoIds`, and confirmed (case-insensitively) it's already covered by the existing alias list. This audit item is a **verified-OK**, not a bug — documented as such rather than "fixing" something that wasn't broken.
- **Bigger real bug found one layer deeper**: cross-checked all 304 `photos` DB documents against the actual `backend/uploads/` directory — **237 (78%) reference files that don't exist on disk**. This is almost certainly the actual mechanism behind the PO's "фото пустая" screenshot (a genuinely-no-photo product already rendered the correct empty-state before this TZ; only a stale/orphaned reference rendered wrong — a raw broken-`<img>`).
- **Chose the fix location deliberately after ruling out a client-side one**: an `onerror`-based JS fallback would be the obvious first instinct, but the preview iframe (`sandbox="allow-same-origin"`, no `allow-scripts`) never executes inline JS, so that fix would silently do nothing for the most-used preview surface. Fixed once, server-side, at the point all three render surfaces (canvas liveRows, BE preview HTML, PDF export) ultimately consume the same `photoUrl` value — `resolveCatalogPhotoUrls` now verifies the file actually exists (same traversal-safe path resolution already established in `document-render.utils.ts`'s PDF inliner) before returning a URL; a missing file resolves to `''`, which the *already-correct* empty-state paths handle correctly on their own.
- **Explicitly did not touch the upload pipeline** (`photos.service.ts`, multer config, `image-upload.options.ts`) — per the TZ's own instruction not to rebuild catalog upload from scratch; this is a read-only existence check in the studio table's own render path, nothing upstream changed.
- Added the PO-requested "Загрузите фото в карточке изделия" hint for an empty photo cell in the live-rows properties editor (previously a bare «—», indistinguishable from any other empty cell).
- No live browser click-through this session (no windowed environment). Recommend PO: open a document with a «Продукты» catalog table bound to real selections, confirm photos with an existing uploaded file show a thumbnail, and — since 78% of this local DB's photo refs are currently orphaned — expect most existing catalog rows to show «Нет фото» until photos are re-uploaded; that's the correct rendering now, not a new bug.

## Closeout

- [x] archive + удалить `_active`
- [x] Status = DONE
- closed_at: 2026-09-11T21:15:00Z
