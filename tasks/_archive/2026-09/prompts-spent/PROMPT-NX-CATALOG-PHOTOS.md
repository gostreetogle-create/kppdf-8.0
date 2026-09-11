# PROMPT-NX-CATALOG-PHOTOS

**Не стартовать**, пока в `tasks/_active/` есть чужой claim на `kppdf-web`.  
Когда PO скажет «делаем фото» — скопируй блок ниже.

---

Ты executor kppdf-8.0. Читай `GEMINI.md`, `docs/how-to-connect-ai.md`,  
`docs/agent-checklists/WAVE-NX-CATALOG-PHOTOS.md`,  
`docs/audits/2026-09-05-catalog-photos-nx-audit.md`.

## Очередь
1. `tasks/_ready/nx-photos/TZ-NX-PHOTO-P0-DROPZONE-LIB.md`  
2. `tasks/_ready/nx-photos/TZ-NX-PHOTO-P2-PRODUCT-MAIN.md` (можно сразу после P0 или вторым агентом на backend, пока P0 на NX libs)  
3. `tasks/_ready/nx-photos/TZ-NX-PHOTO-P1-FORMS-WIRE.md`  
4. `tasks/_ready/nx-photos/TZ-NX-PHOTO-P3-FRAME-UI.md`

## Канон
Несколько фото + ★ главное; file/drag/Ctrl+V; рамка в P3. Деталь = материал.  
Эталон UI: legacy `frontend/.../photo-dropzone.component.ts`.  
Не трогай warehouse, supply pages, DocStudio S45, legacy dual sync.

## Цикл
Claim → code → gates из TZ → archive `_archive/2026-09/` → next.  
После P3: WAVE → DONE, `_NOW` park clear.

## Stop
Чужой `kppdf-web` claim; wipe/deploy; scope вне CONFLICT KEYS.
