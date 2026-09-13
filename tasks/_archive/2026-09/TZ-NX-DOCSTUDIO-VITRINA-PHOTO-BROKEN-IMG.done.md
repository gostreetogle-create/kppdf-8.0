# TZ-NX-DOCSTUDIO-VITRINA-PHOTO-BROKEN-IMG: битые иконки фото в витрине каталога (пикер, не холст)

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-09-13
closed_by: claude
verification:
  - acceptance criteria: PASS (3/3)
  - typecheck: PASS (BE tsc + FE tsc)
  - tests: PASS (BE 135 suites/1342 tests, was 1330 +12 new; FE 125 suites/885+7skip/892, no regression, no FE code changed)
  - lint: PASS (0 errors, scoped files)
  - architecture:check: PASS
  - nx build kppdf-web: PASS (last gate)
  - live browser evidence: PASS (before: 21/22 broken img + 34 404s; after: 0/0 across all 4 vitrina tabs)
  - checklist: `docs/agent-checklists/TZ-NX-DOCSTUDIO-VITRINA-PHOTO-BROKEN-IMG.md` + evidence/
  - status synchronization: PASS (WAVE-2026-09-13-STUDIO-OPS.md updated)

## Root cause / finding

Confirmed exactly as predicted by the predecessor TZ: `product.service.ts`/
`material.service.ts` `findAll()` populate `photoIds`/`mainPhotoId` with no
disk-existence check at all (client-side-only resolution in
`studio-data-vitrina.component.ts`'s `photoUrl()`), unlike the table canvas/resolver
path already fixed by `TZ-NX-DOCSTUDIO-TABLE-PHOTO-BROKEN-IMG`.

Live diagnostic before writing the fix: the TZ's own suggested client-side fallback
(an `(error)` handler on the `<img>`) turned out to already exist in
`pi-showcase-card.component.ts` for the exact `size="sm"` variant the vitrina uses.
Forcing every image into view via Playwright (defeating native `loading="lazy"`)
proved this existing mechanism works correctly — the apparent failure was a
lazy-load/scroll-timing artifact, not a code defect. Not re-implemented; the backend
fix below removes the underlying broken URL before it ever reaches the client, making
the timing dependency moot for shipping.

## Fix (in scope)

1. `document-render.utils.ts` — extracted the private `localUploadFileExists` (was
   duplicated on `StudioDataResolverService`) into a public export, plus a new
   `blankMissingUploadUrls` batch helper (per-request URL dedup, mirrors
   `resolveCatalogPhotoUrls`'s pattern).
2. `product.service.ts` `findAll()` — applies the check to populated `photoIds`.
3. `material.service.ts` `findAll()` — applies the check to populated `photoIds` AND
   `mainPhotoId` (material list populates both).
4. `studio-data-resolver.ts` — now imports the shared helper instead of its own copy.

No FE code changed — `pi-showcase-card.component.ts`'s existing onerror fallback
already functions correctly (live-verified), re-implementing it would have been
duplication.

## Out-of-scope finding (documented, not fixed)

`product-module.service.ts findAll()` doesn't populate `photoIds`/`mainPhotoId` at
all — "Модули" tab always shows the empty placeholder regardless of whether a module
has a photo. Different bug class (missing feature, not a broken-icon regression) —
left for a separate TZ.

## Files changed

- `backend/src/modules/document-render/document-render.utils.ts` (+ `.spec.ts`)
- `backend/src/modules/studio-document/studio-data-resolver.ts`
- `backend/src/modules/product/product.service.ts` (+ `.spec.ts`)
- `backend/src/modules/material/material.service.ts` (+ `.spec.ts`)
- `docs/pages/document-studio.page.md` (new paragraph after the S45/PHOTO-BROKEN-IMG one)
- `docs/agent-checklists/TZ-NX-DOCSTUDIO-VITRINA-PHOTO-BROKEN-IMG.md` + `evidence/TZ-NX-DOCSTUDIO-VITRINA-PHOTO-BROKEN-IMG.txt` (new)
