# TZ-NX-MODULE-LIST-POPULATE-PHOTOS: витрина «Модули» — фото не приходят с findAll

> **SIZE:** S · **PACK:** successor studio-ops WAVE3  
> **РОЛЬ:** Freebuff / Claude  
> **LAYER:** 3  
> **ИСТОЧНИК:** evidence `docs/agent-checklists/evidence/TZ-NX-DOCSTUDIO-VITRINA-PHOTO-BROKEN-IMG.txt` (после 3.1)

**CONFLICT KEYS:**  
`backend/src/modules/product-module/product-module.service.ts; backend/src/modules/product-module/product-module.service.spec.ts`  
(+ при необходимости `blankMissingUploadUrls` reuse из `document-render.utils.ts` — тот же helper, что product/material после 3.1)

**PAGES:** `/studio/:id` → Данные → Товары → вкладка Модули; `/registries` modules list если тот же findAll  
**PAGE_DOCS:** `docs/pages/document-studio.page.md`

---

## Domain preflight

- **Проверено:** `ProductModuleService.findAll` populate’ит workTypes/category/materials, **не** `photoIds` / `mainPhotoId`. Вкладка «Модули» в витрине всегда placeholder, даже если у модуля есть фото на диске. Это missing populate + existence-blank, не broken-img orphan path (тот уже закрыт для product/material).
- **Necessity:** да — иначе оператор думает, что у модулей нет фото / витрина сломана.

## ЧТО ДЕЛАТЬ

1. `findAll` (и `findById` если list-карточки его не используют): `.populate('photoIds')` + `.populate('mainPhotoId')` по образцу `material.service` / `product.service`.
2. Прогнать `blankMissingUploadUrls` на populated photos (тот же helper, что WAVE3.1) — orphan → пустой URL, не 404.
3. Spec: findAll возвращает populated photo docs; missing file → blanked storageUrl.
4. Живой smoke: модуль с реальным фото → витрина «Модули» показывает img; без файла → empty media, не broken icon.

## НЕ

Массовая чистка Mongo Photo; FE showcase rewrite; wipe.

## ACCEPT

1. Модуль с существующим uploads-файлом → миниатюра в витрине.  
2. Orphan photoId → placeholder, 0×404 на вкладке.  
3. Specs + BE tsc/jest zone.
