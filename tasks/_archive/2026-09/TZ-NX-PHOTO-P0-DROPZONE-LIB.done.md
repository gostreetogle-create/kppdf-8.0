# TZ-NX-PHOTO-P0-DROPZONE-LIB — DONE

- **agent_id:** freebuff
- **archived_at:** 2026-09-07T06:17:27+03:00 (session)
- **implementation_sha:** 7c9d1071e4f95a23afe42b132dfc463645fc8505
- **TZ:** tasks/_ready/nx-photos/TZ-NX-PHOTO-P0-DROPZONE-LIB.md

## Что сделано
- **ШАГ 1 — PhotosService + types (data-access):** `lib/photos/photos.types.ts` (`Photo`, `PhotoFrame` fit/posX/posY, `PhotoRef`) + `lib/photos/pi-photos.service.ts` (`PiPhotosService.upload` multipart field `file` / `get` / `remove` / `updateFrame` → `PATCH /photos/:id/frame`, silent-http стиль) + barrel.
- **ШАГ 2 — PiPhotoDropzone (paper-and-ink):** `lib/photo/pi-photo-dropzone.component.ts`, standalone OnPush, presentational (API не вызывает, write у parent — B-PHOTO). Inputs: `photos`/`uploading`/`progressPercent`/`errorMessage`/`mainPhotoId`. Outputs: `filesSelected(File[])` / `removePhoto(id)` / `mainChanged(id|null)` / `invalidFileType`. UI: drop-target focusable, file input `accept=image/* multiple`, drag, Ctrl+V при hover/focus (document paste), strip previews, ★ toggle на главном (повторный клик снимает), удаление. RU hint: «Файл · перетащить · Ctrl+V (кликните зону)».
- **ШАГ 3 — Export:** secondary entry `@kppdf/ui/photo` (tsconfig.base.json) + `@kppdf/data-access` export `./lib/photos`.
- **ШАГ 4 — Tests:** `pi-photo-dropzone.component.spec.ts` (8 spec: paste/не-image/★/uploading блокирует всё/вне фокуса молчит/picker non-image) + `pi-photos.service.spec.ts` (4 spec: multipart `file`, get/remove/frame PATCH).
- **ШАГ 5 — Docs:** `materials.page.md` строка NX dropzone SoT; WAVE P0 → DONE.

## Gates (все зелёные)
```
nx test paper-and-ink --testPathPattern=photo --skip-nx-cache → 33 suites / 350 tests PASS
nx test data-access --testPathPattern=photos --skip-nx-cache  → 24 suites / 120 tests PASS
tsc paper-and-ink lib / data-access lib → 0
nx build kppdf-web (последним) → SUCCESS
```

## Изменённые файлы
CONFLICT KEYS + barrel + tsconfig.base.json (secondary entry) + docs.

## НЕ тронуто
Form dialogs (P1) · Product.mainPhotoId (P2) · Frame UI (P3) · legacy `frontend/` · warehouse/supply/DocStudio.

## known_limitation
0 routed consumers until P1 — allowed with deferred note (PoA в P1).
