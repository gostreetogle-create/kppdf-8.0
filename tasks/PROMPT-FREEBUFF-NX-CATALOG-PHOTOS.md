# PROMPT — Freebuff: WAVE-NX-CATALOG-PHOTOS (большой continuous)

DocStudio C1–C4 + S46/S45 DONE. `_active` пуст. Стартуй фото.

Скопируй целиком:

```
Ты Freebuff executor kppdf-8.0. GEMINI.md + docs/how-to-connect-ai.md + kppdf-executor-loop.
Не спрашивай «продолжать?». UNATTENDED до конца волны P3.

WAVE: docs/agent-checklists/WAVE-NX-CATALOG-PHOTOS.md
Аудит: docs/audits/2026-09-05-catalog-photos-nx-audit.md
Канон PO: несколько фото + ★ главное; file / drag / Ctrl+V; деталь = материал; рамка pan в P3.

═══ ОЧЕРЕДЬ (порядок) ═══
1) tasks/_ready/nx-photos/TZ-NX-PHOTO-P0-DROPZONE-LIB.md     — SIZE L, shared PiPhotoDropzone + Photos API NX
2) tasks/_ready/nx-photos/TZ-NX-PHOTO-P2-PRODUCT-MAIN.md      — SIZE S, ★ mainPhotoId на изделии (можно сразу после P0)
3) tasks/_ready/nx-photos/TZ-NX-PHOTO-P1-FORMS-WIRE.md        — SIZE L, формы материал/модуль/изделие
4) tasks/_ready/nx-photos/TZ-NX-PHOTO-P3-FRAME-UI.md          — SIZE L, рамка position → Photo.frame

Эталон UI: legacy frontend/.../photo-dropzone.component.ts (+ PhotosService).
BE upload/frame уже есть — не изобретай второй write-path.

═══ ЦИКЛ ═══
На каждый TZ: Claim (_active + checklist) → code → gates из TZ → archive + lock → focused commit → push → следующий.
После P3: WAVE → DONE; _NOW Freebuff IDLE; Executor report — 4 SHA.

Baseline перед P0: cd frontend-nx && pnpm exec nx build kppdf-web

НЕ: warehouse rewrite; supply OPS; DocStudio; desktop; dual-site legacy sync; dropDatabase; чужой WIP; паузы «right track?».
```

Файл: `tasks/PROMPT-FREEBUFF-NX-CATALOG-PHOTOS.md`
