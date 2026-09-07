# WAVE-NX-CATALOG-PHOTOS — фото каталога на NX

**Статус:** **DONE** — P0→P3 закрыты (P3 Claude closeout, Freebuff free-session cutoff mid-gates).  
**Audit:** `docs/audits/2026-09-05-catalog-photos-nx-audit.md`  
**Промпт:** `tasks/PROMPT-FREEBUFF-NX-CATALOG-PHOTOS.md`  
**Эталон:** legacy `photo-dropzone` + TZ-UI-PHOTO-343 · frame API TZ-PHOTO-304 DONE  

## Цепочка

| # | SIZE | ID | Path | Deps | Status |
|---|------|-----|------|------|--------|
| P0 | L | TZ-NX-PHOTO-P0-DROPZONE-LIB | `tasks/_ready/nx-photos/TZ-NX-PHOTO-P0-DROPZONE-LIB.md` | — | **DONE** |
| P2 | S | TZ-NX-PHOTO-P2-PRODUCT-MAIN | `tasks/_ready/nx-photos/TZ-NX-PHOTO-P2-PRODUCT-MAIN.md` | — (∥ P0 OK) | **DONE** |
| P1 | L | TZ-NX-PHOTO-P1-FORMS-WIRE | `tasks/_ready/nx-photos/TZ-NX-PHOTO-P1-FORMS-WIRE.md` | P0 + P2 | **DONE** |
| P3 | L | TZ-NX-PHOTO-P3-FRAME-UI | `tasks/_ready/nx-photos/TZ-NX-PHOTO-P3-FRAME-UI.md` | P0 (+ P1 желательно) | **DONE** — Claude closeout, см. `tasks/_archive/2026-09/TZ-NX-PHOTO-P3-FRAME-UI.done.md` |

**Порядок исполнения:** P0 ∥ P2 → P1 → P3. **WAVE DONE.**

## known_limitation (P3)

DocStudio/Gantt thumbnails за пределами production rail не покрыты — нужен отдельный sweep, если PO решит их подключить.

## Канон продукта
- N фото на изделие / модуль / материал (деталь = materialKind).  
- Одно главное ★ = `mainPhotoId`.  
- Ввод: файл Windows + drag + Ctrl+V.  
- Рамка: pan/position → `Photo.frame` (не circle, не sharp crop v1).

## НЕ в волне
Dual-site legacy sync · warehouse · DocStudio S45 · отдельный Part entity.
