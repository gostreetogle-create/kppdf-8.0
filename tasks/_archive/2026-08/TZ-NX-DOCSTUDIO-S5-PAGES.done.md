# TZ-NX-DOCSTUDIO-S5-PAGES — DONE (2026-08-30)

## Outcome
Ribbon shows page count; add page and orientation toggle via `PiStudioDocumentsService.update` PATCH.

## Changes
- `studio-document.types.ts` — `manualPageCount` on document + update payload
- `studio-editor.page.ts` — page badge, `+ Страница`, orientation toggle, `pageCount` computed

## Gates
- `nx build kppdf-web` green

## Remaining
Multi-page canvas navigation, per-page block placement — future slice.
