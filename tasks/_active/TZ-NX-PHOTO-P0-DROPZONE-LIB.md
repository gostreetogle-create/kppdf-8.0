# TASK: TZ-NX-PHOTO-P0-DROPZONE-LIB

- **task_id:** TZ-NX-PHOTO-P0-DROPZONE-LIB
- **agent_id:** freebuff
- **claimed_at:** 2026-09-07T06:17:27+03:00
- **status:** IN_PROGRESS
- **TZ:** tasks/_ready/nx-photos/TZ-NX-PHOTO-P0-DROPZONE-LIB.md
- **WAVE:** WAVE-NX-CATALOG-PHOTOS

## Claim notes
- Baseline `nx build kppdf-web` зелёный (06:17, cache hit 2/5).
- WIP check: `docker-compose.yml`, `start.mjs`, `frontend/src/app/core/build-info.ts` — PO/ops WIP, не трогаю. `_NOW`/`STREAM-QUEUE`/`WAVE-NX-CATALOG-PHOTOS` — bookkeeping этой волны, едет в P0-коммит.
- План: ШАГ 1 PhotosService+types (data-access `lib/photos/`) → ШАГ 2 PiPhotoDropzone (paper-and-ink `lib/photo/`, secondary entry `@kppdf/ui/photo` в tsconfig.base.json) → ШАГ 3 barrels → ШАГ 4 specs (paste/★/disabled) → ШАГ 5 docs (materials.page.md 1 строка, WAVE) → gates (nx test paper-and-ink photo, nx test data-access photos, nx build kppdf-web LAST) → archive.
- Эталон: legacy `photo-dropzone.component.ts` (presentational) + legacy `photos.service.ts` (silentPost multipart field `file`; uploadWithProgress → P1/P3 опционально — в NX service включаю `upload` + `updateFrame`, progress-helper переношу в P1 при необходимости).
- Product.mainPhotoId отсутствует до P2 — dropzone main-контракт (`mainPhotoId` input + `mainChanged` output) не зависит от схемы.
