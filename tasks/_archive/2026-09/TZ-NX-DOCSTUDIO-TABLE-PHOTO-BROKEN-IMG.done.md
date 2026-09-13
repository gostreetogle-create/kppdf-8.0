# TZ-NX-DOCSTUDIO-TABLE-PHOTO-BROKEN-IMG: битая иконка фото в таблице (холст/просмотр)

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-09-13
closed_by: claude
verification:
  - acceptance criteria: PASS (5/5)
  - typecheck: PASS (BE tsc + FE tsc)
  - tests: PASS (BE 135 suites/1330 tests; FE 123 suites/852+7skip/859 tests)
  - lint: PASS (0 errors, scoped files)
  - architecture:check: PASS
  - nx build kppdf-web: PASS (last gate)
  - checklist: `docs/agent-checklists/TZ-NX-DOCSTUDIO-TABLE-PHOTO-BROKEN-IMG.md` + evidence/
  - progress.md: N/A (WAVE checklist tracks this wave)
  - status synchronization: PASS (WAVE-2026-09-13-STUDIO-OPS.md updated)

## Root cause / finding

Live evidence (Mongo + disk + direct HTTP + Playwright against local dev) showed
the PO-reported row (SKU 356/name 021) is **not currently broken** — the photo file
genuinely exists and serves 200. The much bigger, currently-live broken-icon problem
(22 of 23 images on the same page) lives in a **different** component
(`pi-studio-data-vitrina`/`app-pi-showcase-card`, the catalog picker), out of this
TZ's conflict keys — filed as `tasks/_ready/TZ-NX-DOCSTUDIO-VITRINA-PHOTO-BROKEN-IMG.md`
instead of silently expanding scope.

## Fix (in scope)

1. `resolveUploadsRoot()` shared helper (`document-render.utils.ts`) — unifies
   `studio-data-resolver.ts`'s file-existence check and the PDF inliner's upload
   root resolution with the actual multer write path (`UPLOAD_DIR` env), fixing a
   latent (currently coincidental, not yet triggered) inconsistency.
2. Canvas `(error)` fallback (`studio-blocks-canvas.component.ts`) — a photo `<img>`
   that fails to load client-side now degrades to the same «Нет фото» state as an
   empty cell, never a permanent raw broken-image icon.

Step 3 (nginx/absolute-URL branch) explicitly not taken — evidence ruled it out
(no 404/401 due to auth on the canvas's own photo path).

## Files changed

- `backend/src/modules/document-render/document-render.utils.ts`
- `backend/src/modules/studio-document/studio-data-resolver.ts` (+ `.spec.ts`)
- `frontend-nx/apps/kppdf-web/src/app/pages/studio/studio-blocks-canvas.component.ts` (+ `.spec.ts`)
- `docs/pages/document-studio.page.md` (short addendum)
- `docs/agent-checklists/TZ-NX-DOCSTUDIO-TABLE-PHOTO-BROKEN-IMG.md` + `evidence/TZ-NX-DOCSTUDIO-TABLE-PHOTO-BROKEN-IMG.txt` (new)
- `tasks/_ready/TZ-NX-DOCSTUDIO-VITRINA-PHOTO-BROKEN-IMG.md` (new successor)
