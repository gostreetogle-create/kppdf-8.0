# TZ-NX-PHOTO-P0-DROPZONE-LIB: shared PiPhotoDropzone + Photos API на NX

**РОЛЬ АГЕНТА:** Executor (frontend-nx)  
**ЗАВИСИМОСТИ:** нет  
**LAYER:** 3  
**SIZE:** L  
**PACK:** WAVE-NX-CATALOG-PHOTOS · `tasks/PROMPT-NX-CATALOG-PHOTOS.md`  
**STATUS:** PARK — не claim, пока idle `kppdf-web` (склад/supply FE)

**PAGES:** N/A (shared lib; consumer = P1)  
**PAGE_DOCS:** `docs/pages/materials.page.md` (одна строка «NX dropzone SoT → P1»)

**CONFLICT KEYS:**  
`frontend-nx/libs/ui/paper-and-ink/src/lib/photo/pi-photo-dropzone.component.ts` ;  
`frontend-nx/libs/ui/paper-and-ink/src/lib/photo/pi-photo-dropzone.component.spec.ts` ;  
`frontend-nx/libs/ui/paper-and-ink/src/index.ts` ;  
`frontend-nx/libs/data-access/src/lib/photos/photos.types.ts` ;  
`frontend-nx/libs/data-access/src/lib/photos/photos.service.ts` ;  
`frontend-nx/libs/data-access/src/index.ts` (или public-api barrel проекта)

IMPLICIT CONFLICT: frontend-nx/apps/kppdf-web — nx build kppdf-web

---

### Preflight Check Output
- **Context read:** `docs/audits/2026-09-05-catalog-photos-nx-audit.md`; legacy `frontend/src/app/shared/ui/photo/photo-dropzone.component.ts`; `frontend/.../photos.service.ts`; BE `POST /api/photos/upload`, `PATCH /api/photos/:id/frame`; WAVE-PHOTO-FRAME-POSITION
- **Key Constraints:** presentational dropzone (upload owns parent); RU; Paper & Ink; Proof of adoption deferred → P1
- **Planned Deliverable:** NX PhotosService + PiPhotoDropzone (file/drag/paste/multi/main ★)
- **Validation Path:** lib jest + nx build kppdf-web

**Проверено:** NX registries forms без photo; legacy dropzone presentational (outputs files/delete; parent uploads).

---

## Domain preflight
| Говорят | Канон |
|---------|--------|
| Фото | `Photo` via `/api/photos` |
| Главное | `mainPhotoId` на сущности (не на Photo) |
| Деталь | `Material` + `materialKind` |

**Сбои оператора:** некуда вставить Ctrl+V; несколько файлов без прогресса; непонятно какое главное.

---

## ИСХОДНОЕ СОСТОЯНИЕ
1. Legacy dropzone: hint «Файл с диска · перетащить · Ctrl+V»; `data-test=photo-dropzone`; outputs upload/delete; **нет** set-main внутри (main radio у material form).
2. NX: нет `libs/**/photo/**`, нет PhotosService.
3. BE upload field name = `file`; frame API готов (P3).

---

## ЧТО ДЕЛАТЬ

### ШАГ 1 — Types + PhotosService (data-access)
- `Photo`, `PhotoFrame` (`fit`, `posX`, `posY` 0..100) — зеркало legacy/BE.
- Methods: `upload(file)` (multipart field `file`, progress optional), `get(id)`, `remove(id)`, `updateFrame(id, frame)` (для P3).
- SilentResult / тот же HTTP стиль, что другие NX services.

### ШАГ 2 — PiPhotoDropzone (paper-and-ink)
Порт поведения legacy + **главное ★** в самом компоненте:
- Inputs: `photos` (list with `_id`, `storageUrl`, thumb if any), `mainPhotoId`, `uploading`, `progressPercent`, `errorMessage`.
- Outputs: `filesSelected` (File[]), `removePhoto` (id), `mainChanged` (id | null).
- UI: drop target focusable; file input `accept=image/*` multiple; drag; Ctrl+V when hover/focus; strip previews; ★ или точка на главном; удаление с confirm не обязателен (parent).
- RU hint как legacy.
- **Не** вызывать API из dropzone (parent owns write) — как B-PHOTO legacy.

### ШАГ 3 — Export
- Export component + types from paper-and-ink / data-access barrels.

### ШАГ 4 — Tests
- Paste with image clipboard item emits filesSelected.
- Click ★ emits mainChanged.
- Disabled/uploading blocks picker.

### ШАГ 5 — Docs
- Audit/WAVE: P0 DONE note; materials.page.md one line NX SoT path.
- **Proof of adoption:** consumer deferred → **P1** (явный known_limitation). Запрещено считать DONE без этой строки.

---

## ИЗМЕНЯТЬ
Файлы CONFLICT KEYS (+ минимальный barrel).

## НЕ ИЗМЕНЯТЬ
- Form dialogs (P1)  
- Product.mainPhotoId schema (P2)  
- Frame pan UI (P3)  
- Legacy `frontend/` dual sync  
- Warehouse / supply / DocStudio  

**known_limitation:** 0 routed consumers until P1 — allowed only with deferred note.

---

## КРИТЕРИИ ПРИЁМКИ
1. `PiPhotoDropzone` + `PhotosService` в NX, RU, file/drag/paste/multi/★.
2. Specs PASS на paste + mainChanged.
3. Gates:
```bash
cd frontend-nx && pnpm exec nx test paper-and-ink --testPathPattern=photo --skip-nx-cache
cd frontend-nx && pnpm exec nx test data-access --testPathPattern=photos --skip-nx-cache
cd frontend-nx && pnpm exec nx build kppdf-web
```
4. Archive `tasks/_archive/2026-09/` + WAVE checklist.

### Build-integrity
Baseline `nx build kppdf-web` до claim; тот же build — последним; не параллелить другой TZ на `kppdf-web/src/**`.
