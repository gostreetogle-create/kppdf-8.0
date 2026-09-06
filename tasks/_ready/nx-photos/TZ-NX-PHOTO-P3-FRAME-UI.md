# TZ-NX-PHOTO-P3-FRAME-UI: подогнать фото в рамку (pan/position)

**РОЛЬ АГЕНТА:** Executor (frontend-nx)  
**ЗАВИСИМОСТИ:** P0 DONE; BE `PATCH /api/photos/:id/frame` (TZ-PHOTO-304 DONE)  
**LAYER:** 3  
**SIZE:** L  
**PACK:** WAVE-NX-CATALOG-PHOTOS  
**STATUS:** PARK

**PAGES:** forms с dropzone (после P1) + list thumbs где уже есть img  
**PAGE_DOCS:** `docs/pages/materials.page.md` ; products/modules page.md

**CONFLICT KEYS:**  
`frontend-nx/libs/ui/paper-and-ink/src/lib/photo/pi-photo-dropzone.component.ts` ;  
`frontend-nx/libs/ui/paper-and-ink/src/lib/photo/pi-photo-frame-editor.component.ts` (create) ;  
`frontend-nx/libs/ui/paper-and-ink/src/lib/photo/pi-photo-frame-editor.component.spec.ts` ;  
consumers thumbs: registries list formatters / card img helpers that show catalog photos (только файлы, где уже есть `<img>` photo — не раздувать scope) ;  
`docs/audits/2026-09-05-catalog-photos-nx-audit.md` (P3 DONE note)

IMPLICIT CONFLICT: nx build kppdf-web

---

### Preflight Check Output
- **Context read:** `WAVE-PHOTO-FRAME-POSITION.md`; PhotoFrame fit/posX/posY; PhotosService.updateFrame
- **Key Constraints:** rect frame not circle; default contain/center; one write-path via Photo.frame
- **Planned Deliverable:** frame editor in dropzone + thumbs apply CSS object-fit/position
- **Validation Path:** jest + nx build

---

## Канон (не пересматривать)
1. Default: `contain` + center (50/50).  
2. Optional cover + pan (posX/posY).  
3. Persist only via `PATCH /photos/:id/frame`.  
4. Не server sharp crop v1.

**Сбои:** фото обрезает лицо/артикул на превью; после F5 позиция сбрасывается.

---

## ЧТО ДЕЛАТЬ

### ШАГ 1 — Frame editor UI
Кнопка на превью в dropzone «Рамка» → dialog/panel: viewport + drag pan (+ optional zoom later = out of scope if not in BE). Save → `updateFrame`.

### ШАГ 2 — Apply on thumbs
Где NX уже рендерит catalog photo URL — CSS:
`object-fit: frame.fit`; `object-position: posX% posY%`; fallback contain/center.

### ШАГ 3 — Tests
- Save calls updateFrame with merged partial.  
- Thumb helper applies position.

### ШАГ 4 — Docs
WAVE-PHOTO + catalog audit: P3 DONE; page.md одна строка.

---

## НЕ ИЗМЕНЯТЬ
Circle avatar; second cropper outside dropzone; BE frame schema shape; warehouse.

**known_limitation:** DocStudio/Gantt thumbs могут остаться без frame до отдельного sweep — перечислить в archive если не успели; минимум = forms dropzone preview + ≥1 list consumer.

---

## КРИТЕРИИ ПРИЁМКИ
1. После загрузки можно сдвинуть кадр; F5 сохраняет.  
2. ≥1 list/card consumer читает frame.  
3. Gates:
```bash
cd frontend-nx && pnpm exec nx test paper-and-ink --testPathPattern=photo --skip-nx-cache
cd frontend-nx && pnpm exec nx build kppdf-web
```

### Build-integrity
Как P0/P1.
