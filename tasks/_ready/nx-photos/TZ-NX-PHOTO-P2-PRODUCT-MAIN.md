# TZ-NX-PHOTO-P2-PRODUCT-MAIN: Product.mainPhotoId в BE + types

**РОЛЬ АГЕНТА:** Executor (backend + thin NX types)  
**ЗАВИСИМОСТИ:** нет (можно до/∥ P0; **обязателен до закрытия P1** для изделия)  
**LAYER:** 4  
**SIZE:** S  
**PACK:** WAVE-NX-CATALOG-PHOTOS  
**STATUS:** PARK

**PAGES:** N/A  
**PAGE_DOCS:** `docs/pages/products.page.md` (одна строка)

**CONFLICT KEYS:**  
`backend/src/modules/product/product.schema.ts` ;  
`backend/src/modules/product/dto/create-product.dto.ts` (и update DTO если отдельно) ;  
`backend/src/modules/product/product.service.ts` ;  
`backend/src/modules/product/product.service.spec.ts` (или controller spec) ;  
`frontend-nx/libs/data-access/src/lib/catalog/product.types.ts` ;  
`docs/COUPLING-MAP.md` (строка) ;  
`docs/pages/products.page.md`

---

### Preflight Check Output
- **Context read:** `product.schema.ts` (photoIds only); Module/Material уже имеют mainPhotoId; audit 2026-09-05
- **Key Constraints:** dual-read; main ∈ photoIds или null; без wipe
- **Planned Deliverable:** schema + DTO + service validate + NX types
- **Validation Path:** backend tsc + product tests

---

## ИСХОДНОЕ
Product: `photoIds[]`, **нет** `mainPhotoId`. Module/Material: оба поля. Витрина/Гант берут «первое» фото.

**Сбои:** нельзя явно выбрать обложку изделия; расхождение с модулем/материалом.

---

## ЧТО ДЕЛАТЬ

### ШАГ 1 — Schema
`@Prop({ type: ObjectId, ref: 'Photo' }) mainPhotoId?: ObjectId` (optional, sparse ok).

### ШАГ 2 — DTO / service
- Accept `mainPhotoId` на create/update.  
- Validate: если set — должен быть в `photoIds` (после normalize).  
- Если `photoIds.length > 0` и main отсутствует — **не** обязательно автоставить в BE (FE P1 ставит); optional heal: set to photoIds[0] on save — допустимо, задокументировать.

### ШАГ 3 — NX types
`Product.mainPhotoId?: string | null` + write payload.

### ШАГ 4 — Docs
COUPLING-MAP: catalog cover = mainPhotoId ?? photoIds[0].  
products.page.md одна строка.

---

## НЕ ИЗМЕНЯТЬ
UI dropzone; Module/Material schema; wipe; Photo.frame.

**known_limitation:** N/A process failures beyond validation 400 RU.

---

## КРИТЕРИИ ПРИЁМКИ
1. PATCH product с mainPhotoId not in photoIds → 400 RU.  
2. Valid main сохраняется и отдаётся в GET.  
3. Gates:
```bash
cd backend && pnpm exec tsc -p tsconfig.build.json --noEmit
cd backend && pnpm test -- product
```

### Build-integrity
NX types only — `nx build kppdf-web` если тронут types, иначе backend gates достаточно; не claim параллельно с P1 на тех же product.types без координации.
