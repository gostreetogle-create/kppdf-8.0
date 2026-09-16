# TZ-NX-CATALOG-CATEGORY-INLINE-CREATE: категория в форме модуля/изделия/детали — select + «+»

> **SIZE:** S · **PACK:** single (vertical: reuse CategoryFormDialog)  
> **РОЛЬ:** Freebuff executor  
> **LAYER:** 3  
> **ЗАВИСИМОСТИ:** нет

**CONFLICT KEYS:**  
`frontend-nx/apps/kppdf-web/src/app/pages/registries/dialogs/module-form-dialog.component.ts; frontend-nx/apps/kppdf-web/src/app/pages/registries/dialogs/module-form-dialog.component.spec.ts; frontend-nx/apps/kppdf-web/src/app/pages/registries/dialogs/product-form-dialog.component.ts; frontend-nx/apps/kppdf-web/src/app/pages/registries/dialogs/product-form-dialog.component.spec.ts; frontend-nx/apps/kppdf-web/src/app/pages/registries/dialogs/material-form-dialog.component.ts; frontend-nx/apps/kppdf-web/src/app/pages/registries/dialogs/material-form-dialog.component.spec.ts; frontend-nx/apps/kppdf-web/src/app/pages/registries/dialogs/category-form-dialog.component.ts; frontend-nx/apps/kppdf-web/src/app/pages/registries/dialogs/category-form-dialog.component.spec.ts`

**PAGES:** `/registries` (modules/products/materials); studio vitrina «Изменить» (те же dialogs)  
**PAGE_DOCS:** `docs/pages/registries.page.md`; `docs/pages/document-studio.page.md`

IMPLICIT CONFLICT: frontend-nx/apps/kppdf-web — nx build kppdf-web

---

## Domain preflight

- **Канон:** `Category` с `type: module | product | material` — единственная категоризация каталога (WAVE-NX-REGISTRY-CATEGORIES DONE). Module/Product: `categoryId` **required**. Material: required для детали, optional для сырья (не ломать).
- **Проверено:** module/product/material forms = голый `<select>` без create; `CategoryFormDialog` + host только из реестра «Категории»; эталон inline-create: `supply-request-form-dialog.openCreateMaterial` → nested dialog → pick; accent `+`: `registry-create-button` / `registry-icon-btn-accent`. Diagnose ([Diagnose module photo save](6f2db6ea-0113-4e01-b95e-898be25a2841)): фото upload сразу; `photoIds` только на Save; studio host OK; silent invalid = known backlog после product PO-SWEEP-01.
- **PO:** из формы модуля неясно, куда добавить категорию; хочет select + плюс «создать, если нет» на месте (PO-CANON: один контекст, без ухода в другой раздел «только ради +»).
- **Necessity:** да — иначе Save «молчит» / оператор тупит на пустом select.

## ИСХОДНОЕ

1. Категории модулей создаются только в реестре «Категории» (`type=module`).
2. В `module-form-dialog` (и product/material) поля категории — native select, без CTA.
3. При invalid Save module/material — silent (`markAllAsTouched` only); product уже показывает текст (эталон feedback). Form-field errors opt-in via `[error]` — у module не проставлены.
4. Второй частый invalid: пустая строка «Виды работ» (`workTypeId` required) — тоже silent; в alert должны попадать и обязательные поля work-type, если invalid.

## ЧТО ДЕЛАТЬ

**ШАГ 1 — CategoryFormDialog: lock type для nested create.**  
Добавить в `CategoryFormDialogData` опционально `lockType?: CategoryType`. Если задан: `type` = lockType, select типа **disabled** (или скрыт + скрытый control), создать можно только этот type. Spec: lockType=`module` → option type не меняется, POST payload.type=`module`.

**ШАГ 2 — Select + «+» в трёх catalog forms.**  
Рядом с select «Категория» (flex row): select flex-1 + accent icon-btn `+` (`aria-label="Создать категорию"`, `data-test="*-category-create"`).  
Клик → `dialog.open(CategoryFormDialogComponent, { mode:'create', category:null, categories: <fresh list>, lockType: <module|product|material> })`.  
On close с `Category`:  
- дописать в локальный signal списка категорий (или reload `list({type})`);  
- `form.controls.categoryId.setValue(created._id)`;  
- `markAsDirty`.  
Для material: lockType всегда `material` (как сейчас list type=material).

**ШАГ 3 — Invalid Save feedback (тот же симптом PO).**  
Module + material: как product — при invalid → `errorMessage` «Заполните обязательные поля: …» + focus/scroll к первому invalid (вкл. `#mod-category` / material analog). Не менять required-правила. Incomplete work-type rows остаются required (не silent).

**ШАГ 4 — Specs + gates.**  
- Module: empty cats → `+` → mock dialog returns Category → select содержит option и value=id.  
- Invalid Save без категории → visible alert с «Категория»; `modulesService.update` **не** вызван.  
- Module: upload photo (mock `PiPhotosService.upload`) → valid form → Save → payload содержит `photoIds`/`mainPhotoId` (как material/product specs).  
- Product/material: тот же create-path (минимум 1 spec каждый).  
- `nx build kppdf-web` последним.

## НЕ ИЗМЕНЯТЬ

- BE Category schema/DTO (кроме если уже хватает API create — **не** трогать BE без нужды).  
- TextBlockCategory; состав модуля; photo upload API; registries category list page redesign; wipe/deploy.  
- Не заменять select на typeahead в этой TZ (PO: select + плюс; поиск 1000+ не нужен).  
- Не «чинить» VersionError/`findOneAndUpdate` на module update (out of scope; проявится уже с errorMessage, не silent).

## ACCEPT

1. В форме модуля (и product/material): у категории есть `+`; создание без ухода в реестр; новая категория сразу выбрана.  
2. Nested create с `lockType=module` не даёт сохранить как product/material.  
3. Пустая категория + Save → видимый alert (не «ноль реакций»).  
4. Studio «Изменить» модуль — тот же dialog, поведение то же.  
5. Module photo→Save spec: payload с `photoIds`.  
6. Specs + `cd frontend-nx && pnpm exec nx build kppdf-web` exit 0.

## known_limitation

Справочник «Категории» в реестрах остаётся SoT для rename/иерархии; эта TZ только write-through create из формы. Подкатегории (parent) — доступны в CategoryFormDialog как сейчас, не обязаны в AC демо. Не strip’ать пустые work-type rows автоматически — только показать в invalid-тексте.
