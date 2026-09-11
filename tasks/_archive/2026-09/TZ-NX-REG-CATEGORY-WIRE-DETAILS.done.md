# TZ-NX-REG-CATEGORY-WIRE-DETAILS: детали — обязательная категория (select)

**РОЛЬ АГЕНТА:** Executor (frontend-nx) — claude  
**ЗАВИСИМОСТИ:** `TZ-NX-REG-CATEGORIES-CRUD` DONE  
**LAYER:** 3 · **SIZE:** L  
**PAGES:** `/registries/details` (+ materials form shared)  
**PAGE_DOCS:** `registries.page.md`

**CONFLICT KEYS:**  
`frontend-nx/apps/kppdf-web/src/app/pages/registries/dialogs/material-form-dialog.component.ts` ;  
`frontend-nx/apps/kppdf-web/src/app/pages/registries/data/details.registry.ts` ;  
`frontend-nx/apps/kppdf-web/src/app/pages/registries/data/materials-http-data-source.ts` (колонка/фильтр имени категории если есть) ;  
`docs/pages/registries.page.md` ;  
`docs/agent-checklists/WAVE-NX-REGISTRY-CATEGORIES.md` ;  
`docs/agent-checklists/_NOW.md`

IMPLICIT CONFLICT: nx build kppdf-web

### Preflight
- Form сейчас: ObjectId text. Details create must require Category type=`material`.
- materialKind остаётся (part/fastener/…); не заменять категорией.

## ЧТО ДЕЛАТЬ

1. `MaterialFormDialog`: заменить ObjectId input на `<select>` / overflow-select категорий `type=material` (load via PiCategoriesService).
2. Для режима детали (`allowKindSelect` / entityLabel деталь): `Validators.required` на categoryId.
3. Для сырья (materials registry create): тот же select type=`material`, **без** `Validators.required` (PO 2026-09-11: у сырья не обязательно; поле всё равно видно — можно выбрать).
4. Список/колонка «Категория» в details (+ materials если колонка есть) — **имя**, не ObjectId.
5. Фильтр categoryId — живые категории.
6. WAVE row 03.

## НЕ

- BE schema material (уже есть); product/module wire; делать category required на сырье

## AC

1. Создать деталь без категории → UI block / не POST.
2. Создать сырьё без категории → OK; с категорией → сохраняет categoryId.
3. Select = type=material из реестра Категории.
4. Имя категории в таблице деталей.
5. nx build PASS.

---

**ARCHIVE_MARKER:** DONE 2026-09-11T14:45:00Z — see docs/agent-checklists/TZ-NX-REG-CATEGORY-WIRE-DETAILS.md for SHA
