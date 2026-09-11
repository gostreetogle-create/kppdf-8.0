# TZ-NX-TEXT-PICKER-FORM: save/insert cat → subcat → название

**РОЛЬ АГЕНТА:** Executor (frontend-nx) — claude  
**ЗАВИСИМОСТИ:** `TZ-NX-TEXT-CAT-NX-CRUD` DONE  
**LAYER:** 3 · **SIZE:** L  
**PAGES:** `/studio/:id` ; `/registries/text-blocks`  
**PAGE_DOCS:** `document-studio.page.md` ; `texts.page.md` ; `registries.page.md`

**CONFLICT KEYS:**  
`frontend-nx/apps/kppdf-web/src/app/doc-studio/dialogs/text-block-form-dialog.component.ts` ;  
`frontend-nx/apps/kppdf-web/src/app/pages/studio/studio-text-properties.component.ts` ;  
`frontend-nx/apps/kppdf-web/src/app/pages/registries/data/text-blocks.registry.ts` ;  
`frontend-nx/apps/kppdf-web/src/app/doc-studio/shared/doc-studio-payloads.ts` ;  
`docs/pages/document-studio.page.md` ;  
`docs/audits/2026-09-11-text-library-category-subcategory-audit.md` (closeout) ;  
`docs/agent-checklists/WAVE-NX-TEXT-LIBRARY-HIERARCHY.md` ;  
`docs/agent-checklists/_NOW.md`

IMPLICIT CONFLICT: nx build kppdf-web

### Preflight Check Output
- **Context read:** audit; `studio-text-properties` picker; form dialog; WAVE 03
- **Key Constraints:** categoryId = leaf; snapshot insert unchanged; no live BlockSource
- **Planned Deliverable:** cascade UI create+insert; registry shows names
- **Validation Path:** FIC G + nx build last

## ЧТО ДЕЛАТЬ

1. Form create/edit: Категория (roots) → Подкатегория → Название → тело; slug auto; `categoryId` = leaf.
2. Studio properties: same cascade; library select = names in subcategory; insert = snapshot HTML.
3. Save-to-library dialog: require subcategory.
4. Registry: show category/subcategory **name**, not ObjectId.
5. Audit closeout + WAVE COMPLETE.

## НЕ

- live BlockSource; BE depth; A4 geometry

## AC

1. No subcategory → cannot save.
2. Picker names scoped to subcategory.
3. Insert pastes + toast.
4. Gates + WAVE COMPLETE.

## BUILD INTEGRITY

`docs/TZ-NX-BUILD-INTEGRITY.md` §5.

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-09-11
closed_by: Claude
verification:
  - acceptance criteria: PASS
  - typecheck: PASS
  - tests: PASS
  - lint: PASS
  - checklist: ADDED (docs/agent-checklists/TZ-NX-TEXT-PICKER-FORM.md)
  - progress.md: N/A (redirect file — see docs/agent-checklists/_NOW.md)
  - status synchronization: PASS
