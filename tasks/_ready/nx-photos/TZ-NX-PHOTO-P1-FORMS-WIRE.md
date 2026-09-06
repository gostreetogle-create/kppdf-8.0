# TZ-NX-PHOTO-P1-FORMS-WIRE: фото в формах изделие / модуль / материал

**РОЛЬ АГЕНТА:** Executor (frontend-nx)  
**ЗАВИСИМОСТИ:** `TZ-NX-PHOTO-P0-DROPZONE-LIB` DONE  
**LAYER:** 3  
**SIZE:** L  
**PACK:** WAVE-NX-CATALOG-PHOTOS  
**STATUS:** PARK

**PAGES:** `/registries` (products / modules / materials keys)  
**PAGE_DOCS:** `docs/pages/products.page.md` ; `docs/pages/modules.page.md` ; `docs/pages/materials.page.md` ; `docs/pages/registries.page.md`

**CONFLICT KEYS:**  
`frontend-nx/apps/kppdf-web/src/app/pages/registries/dialogs/product-form-dialog.component.ts` ;  
`frontend-nx/apps/kppdf-web/src/app/pages/registries/dialogs/product-form-dialog.component.spec.ts` ;  
`frontend-nx/apps/kppdf-web/src/app/pages/registries/dialogs/module-form-dialog.component.ts` ;  
`frontend-nx/apps/kppdf-web/src/app/pages/registries/dialogs/module-form-dialog.component.spec.ts` ;  
`frontend-nx/apps/kppdf-web/src/app/pages/registries/dialogs/material-form-dialog.component.ts` ;  
`frontend-nx/apps/kppdf-web/src/app/pages/registries/dialogs/material-form-dialog.component.spec.ts` ;  
`frontend-nx/libs/data-access/src/lib/catalog/product.types.ts` ;  
`frontend-nx/libs/data-access/src/lib/catalog/product-module.types.ts` ;  
`frontend-nx/libs/data-access/src/lib/catalog/material.types.ts`

IMPLICIT CONFLICT: nx build kppdf-web

---

### Preflight Check Output
- **Context read:** audit 2026-09-05; P0 dropzone; legacy product/module/material form dialogs with dropzone; NX forms без photo
- **Key Constraints:** один паттерн на 3 формы; деталь = materialKind; upload через PhotosService затем PATCH entity photoIds/mainPhotoId
- **Planned Deliverable:** секция «Фото» в create/edit трёх диалогов
- **Validation Path:** form specs + nx build; FIC forms

---

## Domain preflight
- Изделие / модуль / материал (вкл. деталь) — несколько `photoIds`, одно `mainPhotoId`.
- Product main: если P2 ещё не DONE — временно main = `photoIds[0]` + TODO в known_limitation **или** жди P2 (предпочтение: **P2 до или в той же сессии до merge P1**).

**Сбои:**
1. PO не находит «добавить фото» на NX.  
2. Загрузил 3 фото — неясно какое на витрине/Ганте.  
3. Ctrl+V вне фокуса dropzone «молчит» — hint должен сказать про фокус зоны.

---

## ИСХОДНОЕ
NX `*-form-dialog` для product/module/material: нет photo UI, payload без photoIds (проверить create/update).

---

## ЧТО ДЕЛАТЬ

### ШАГ 1 — Секция UI
В каждом из трёх диалогов: `app-pi-form-section` «Фото» + `PiPhotoDropzone`.
Empty: «Файл · перетащить · Ctrl+V (кликните зону)».

### ШАГ 2 — Write-path (одинаковый)
1. `filesSelected` → `PhotosService.upload` (последовательно или с лимитом параллели ≤3).  
2. Append `_id` в локальный `photoIds`; если main пуст — set first.  
3. `mainChanged` → local `mainPhotoId`.  
4. `removePhoto` → убрать id; если был main — новый main = first remaining или null; optional `PhotosService.remove`.  
5. На Save entity: передать `photoIds` + `mainPhotoId` в create/update DTO.

### ШАГ 3 — Load edit
Hydrate photos list (GET photo by id или URL из уже связанных данных — как legacy; минимум storageUrl для preview).

### ШАГ 4 — Tests
- Upload mock → save payload contains photoIds + mainPhotoId.  
- Set main + remove main reassigns.  
- Material с materialKind part — тот же блок (не отдельная форма).

### ШАГ 5 — Docs + FIC
page.md NX: «фото в форме реестра»; PAGE-TZ-INDEX; COUPLING-MAP строка photoIds/mainPhotoId.

---

## ИЗМЕНЯТЬ
CONFLICT KEYS + docs выше.

## НЕ ИЗМЕНЯТЬ
Frame positioner (P3); legacy FE sync; warehouse; отдельный Part CRUD.

**known_limitation:** list/grid thumbs frame meta = P3; без P2 Product.mainPhotoId — не архивировать P1 с «полным» AC для изделия (блокер или сделать P2 first).

---

## КРИТЕРИИ ПРИЁМКИ
1. В NX edit изделия, модуля, материала видно ≥1 способ добавить фото + ★ главное.  
2. Save пишет photoIds/mainPhotoId; F5 reopen показывает превью.  
3. Gates:
```bash
cd frontend-nx && pnpm exec nx test kppdf-web --testPathPattern="product-form-dialog|module-form-dialog|material-form-dialog" --skip-nx-cache
cd frontend-nx && pnpm exec nx build kppdf-web
```

### Build-integrity
Baseline build до claim; build последним; один kppdf-web TZ за раз.
