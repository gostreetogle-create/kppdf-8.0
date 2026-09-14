# TZ-NX-TEXT-BLOCK-CATEGORY-INLINE-CREATE: Категория/подкатегория + «+» в форме текста

**РОЛЬ АГЕНТА:** Executor FE — freebuff  
**ЗАВИСИМОСТИ:** Нет (диалог категорий и API уже есть)  
**LAYER:** 3 · **SIZE:** S  
**PAGES:** диалог «Создать/Редактировать текст» (студия save-to-library + реестр Тексты)  
**PAGE_DOCS:** `docs/pages/text-block-categories.page.md` · `docs/pages/document-studio.page.md`

**CONFLICT KEYS:**  
`frontend-nx/apps/kppdf-web/src/app/doc-studio/dialogs/text-block-form-dialog.component.ts` ;  
`frontend-nx/apps/kppdf-web/src/app/doc-studio/dialogs/text-block-form-dialog.component.spec.ts` ;  
`frontend-nx/apps/kppdf-web/src/app/pages/dictionaries/text-block-category-form-dialog.component.ts` (только если нужен мелкий data-test / без redesign) ;  
`docs/pages/text-block-categories.page.md` ;  
`docs/pages/document-studio.page.md` ;  
`docs/audits/2026-09-13-text-block-category-inline-create.md`

IMPLICIT CONFLICT: `nx build kppdf-web`

### Preflight

Проверено: audit; `app-pi-select-add-row`; `TextBlockCategoryFormDialogComponent` (`parentId`); `text-block-form-dialog` голые select; каталог-эталон nested `onDialogCloseOnce`.  
PO «один UI-кит select+плюс» → **только** `app-pi-select-add-row`, не новый виджет и не `pi-registry-create-button` в этом диалоге.

### Symptom

Нельзя создать категорию/подкатегорию из формы текста → список пустой / непонятно куда идти.

### ЧТО ДЕЛАТЬ

1. Обернуть **Категория** и **Подкатегория** каждый в `<app-pi-select-add-row>` (select = projected content; native `<select class="pi-input">` ок, как сейчас — не обязательно менять на `app-pi-select`).
2. **+ Категория:** `PiDialogService.open(TextBlockCategoryFormDialogComponent, { mode:'create', parentId: null })` → `onDialogCloseOnce` → дописать в `roots()`, выставить `rootId`, сбросить/перезагрузить `subs`, `form.markAsDirty()`.
3. **+ Подкатегория:** disabled если нет `rootId()`; open с `parentId: rootId()`, `parentName`; после create → reload/append `subs()`, `categoryId.setValue(created._id)`, dirty.
4. Titles/aria/data-test: `text-root-category-add`, `text-sub-category-add` (или эквивалент).
5. Specs: наличие has both add buttons; sub add disabled without root; mock dialog close → root/sub selected.
6. page.md: одна строка — inline create из формы текста через kit select-add-row; реестр категорий остаётся.

### НЕ

- Новый CSS «плюс» / дубль кнопки  
- Менять BE schema TextBlockCategory  
- TEXT-LIBRARY-INSERT-ON-ADD (отдельный TZ; этот только форма create/edit текста)  
- Переписывать каталожные module/product forms на select-add-row в этом TZ (отдельный debt, если PO захочет унификацию)  
- Deploy / wipe

### AC

1. Live: «Создать текст» → + у категории → создать корень → выбран; + у подкатегории → создать лист → выбран → Save текста ок.  
2. Без ухода в `/registries/text-block-categories` для happy path.  
3. Визуально ряд = kit (`pi-select-add-row` / `pi-select-add-btn`), не произвольный flex.  
4. Gates: dialog specs + `nx build kppdf-web` PASS last.

### Claim

```
agent_id: claude
claimed_at: 2026-09-14T07:18:25Z
branch: main
baseline_sha: 1dc0c7f2
```

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-09-14
closed_by: Claude
verification:
  - acceptance criteria: PASS (all 4, including live smoke — see checklist Gates section)
  - typecheck: PASS
  - tests: PASS
  - lint: PASS (0 new errors vs pre-existing baseline of 38, verified via git-stash A/B)
  - checklist: ADDED (docs/agent-checklists/TZ-NX-TEXT-BLOCK-CATEGORY-INLINE-CREATE.md)
  - progress.md: N/A (redirected to docs/agent-checklists/_NOW.md per repo convention)
  - status synchronization: PASS
  - bonus: fixed 2 real pre-existing bugs found live (tags.join crash in openSaveTextBlockDialog;
    root category select-not-visually-selected race) — see checklist Executor report
