# TZ-DOC-443: «+» категории в «Настройка шаблона» (без ухода в справочник)

PAGES: `/doc-constructor/templates` ; `/doc-constructor/builder/:id`
PAGE_DOCS: templates.page.md ; builder.page.md ; document-template-categories.page.md

РОЛЬ АГЕНТА: Frontend UI Engineer  
ЗАВИСИМОСТИ: желательно TZ-SUPPLY-443 DONE (живой `.pi-select-add-btn` в styles.css); иначе тащить те же стили сюда нельзя — **сначала 443 supply или общий CSS шаг**  
LAYER: 3

### Preflight Check Output
- **Context read:** `template-setup-dialog.component.ts` (select без +; empty → navigate `/doc-template-categories` + close); `DocumentTemplateCategoryFormDialogComponent`; `PiSelectAddRow`; DOC-338 systemOnly filter; BE `findAll` = org∪system; Claude MCP analysis 2026-08-25
- **Key Constraints:** PO-CANON one-context; reuse form dialog; не создавать isSystem из UI
- **Planned Deliverable:** select-add-row + nested create; drop client systemOnly filter; inspector parity
- **Validation Path:** template-setup + inspector specs; tsc

CONFLICT KEYS:
`frontend/src/app/pages/doc-constructor/builder/template-setup-dialog.component.ts`;
`frontend/src/app/pages/doc-constructor/builder/template-setup-dialog.component.spec.ts`;
`frontend/src/app/pages/doc-constructor/builder/builder-inspector.component.ts`;
`frontend/src/app/pages/doc-constructor/builder/builder-inspector.component.spec.ts`;
`docs/pages/templates.page.md`;
`docs/pages/document-template-categories.page.md`

## Domain preflight

- **Проверено:** PO скрин «Настройка шаблона» — красный `+` у «Категория шаблона».
- **Проверено:** FE filter `!organizationId` (DOC-338) скрывает org-категории, которые создаёт POST → без снятия фильтра «+» бесполезен.
- **Проверено:** BE `assertAssignable` принимает system ∪ own-org; list API уже scoped.
- **Loose wording:** «категория шаблона» = `DocumentTemplateCategory`, не дерево `/categories`.

## ЧТО ДЕЛАТЬ

### ШАГ 1 — Scope списка

В `template-setup-dialog` и `builder-inspector` `loadCategories()`: убрать `.filter((c) => !c.organizationId)`; брать `res.data` as-is (`activeOnly: true`). Default = `isDefault` else first.

### ШАГ 2 — Inline «+»

Create-mode category field:

- Обернуть `<select>` в `app-pi-select-add-row` (`addTitle`/`aria` = «Создать категорию шаблона», `data-test="template-setup-category-add"`).
- Click → `PiDialogService.open(DocumentTemplateCategoryFormDialogComponent, { data: null, width: 'md', parentDestroyRef })`.
- Close с категорией → append в `categories()` + `categoryId.set(new._id)` (не полный reload обязателен; cache invalidate уже в service create).
- Empty state: **не** закрывать setup и не navigate. Показать select-add-row / + даже при 0 категорий; copy «Нет категорий — создайте +». Ссылку «Открыть справочник» можно оставить secondary ghost под полем (не primary path).

### ШАГ 3 — Builder inspector

Тот же select-add-row + open form dialog + auto-select на поле «Категория шаблона» (`data-test="insp-template-category-add"`).

### ШАГ 4 — Тесты

- Setup: + присутствует; mock open dialog → close category → selected.
- Empty list: Create не disabled только из-за empty после возможности создать (после + и select — canConfirm).
- Inspector: emit categoryId после add.
- Не ломать duplicate mode (категория скрыта).

## НЕ ИЗМЕНЯТЬ

- Backend category schema / isSystem seed
- pageSize / orientation chips в setup (другой TZ-KP-443)
- PiDialog service internals

## КРИТЕРИИ ПРИЁМКИ

1. Create шаблона: зелёный `+` в ряду с select; create category без ухода со страницы; новая категория сразу выбрана; «Создать» работает.
2. Org-категория видна в списке (не только «Общее»).
3. Inspector: тот же паттерн.
4. `cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit`
5. `cd frontend && pnpm exec jest src/app/pages/doc-constructor/builder/template-setup-dialog.component.spec.ts src/app/pages/doc-constructor/builder/builder-inspector.component.spec.ts --no-coverage --runInBand`

## Archive

`tasks/_archive/2026-08/` + checklist + PAGE-TZ-INDEX.

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-26T19:37:10+03:00
closed_by: claude (Buffy / Freebuff executor)
verification:
  - acceptance criteria: PASS
  - typecheck: PASS (`frontend/tsconfig.app.json --noEmit`)
  - tests: PASS (4 focused suites, 63 tests)
  - targeted ESLint: PASS on all changed frontend files
  - targeted Prettier: PASS on all changed frontend files
  - diff-check: PASS on changed DOC-443 files
  - full frontend lint: residual 208 pre-existing errors + 17 warnings outside this TZ; token checker residual 35 pre-existing CSS violations
  - architecture check: 0 new DOC-443 violations; 2 pre-existing materials/products violations remain
  - checklist: `docs/agent-checklists/TZ-DOC-443.md` marked DONE
  - page docs and coupling map: updated in the same TZ
  - browser smoke: not run; DOM behavior covered by focused Jest
  - deploy: NO

## Changed surface

- `template-setup-dialog.component.ts/.spec.ts`
- `builder-inspector.component.ts/.spec.ts`
- shared category form dialog plus legacy dictionary re-export
- `docs/pages/templates.page.md`, `builder.page.md`, `document-template-categories.page.md`, `PAGE-TZ-INDEX.md`
- `docs/COUPLING-MAP.md`
