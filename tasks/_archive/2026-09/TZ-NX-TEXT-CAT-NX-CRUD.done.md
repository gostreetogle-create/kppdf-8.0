# TZ-NX-TEXT-CAT-NX-CRUD: NX справочник категорий + подкатегорий

**РОЛЬ АГЕНТА:** Executor (frontend-nx) — claude  
**ЗАВИСИМОСТИ:** `TZ-NX-TEXT-CAT-PARENT` DONE  
**LAYER:** 3 · **SIZE:** L  
**PAGES:** `/dictionaries/text-block-categories`  
**PAGE_DOCS:** `text-block-categories.page.md`

**CONFLICT KEYS:**  
`frontend-nx/apps/kppdf-web/src/app/app.routes.ts` ;  
`frontend-nx/apps/kppdf-web/src/app/layout/nav-categories.ts` (verify path) ;  
`frontend-nx/apps/kppdf-web/src/app/pages/**/text-block-categor*` (new page) ;  
`frontend-nx/libs/data-access/src/lib/doc-studio/pi-text-block-categories.service.ts` ;  
`frontend-nx/libs/data-access/src/lib/doc-studio/text-block.types.ts` ;  
`docs/pages/text-block-categories.page.md` ;  
`docs/FEATURE-INTEGRATION-CHECKLIST.md` (route/page) ;  
`docs/agent-checklists/WAVE-NX-TEXT-LIBRARY-HIERARCHY.md` ;  
`docs/agent-checklists/_NOW.md`

IMPLICIT CONFLICT: nx build kppdf-web

### Preflight Check Output
- **Context read:** audit 2026-09-11 (dead NX nav); `text-block-categories.page.md`; WAVE
- **Key Constraints:** After BE parentId. Reuse PiDialog. FIC A.
- **Planned Deliverable:** NX CRUD roots+children; service mutate API
- **Validation Path:** FIC A + nx build last

## ЧТО ДЕЛАТЬ

1. Extend `PiTextBlockCategoriesService`: create/update/remove + list `parentId`.
2. NX page: roots; children under selected; create root / subcategory; edit/delete + AlertDialog.
3. Wire route (fix dead `/dictionaries/text-block-categories`); FIC A/B as needed.
4. page.md NX note; WAVE row 02.

## НЕ

- studio picker (03)
- BE schema beyond consuming 01

## AC

1. `/dictionaries/text-block-categories` on NX — not 404.
2. Create subcategory under root; UI blocks depth>1.
3. `nx build kppdf-web` PASS last.

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
  - checklist: ADDED (docs/agent-checklists/TZ-NX-TEXT-CAT-NX-CRUD.md)
  - progress.md: N/A (redirect file — see docs/agent-checklists/_NOW.md)
  - status synchronization: PASS
