# TZ-NX-TEXT-CAT-PARENT: BE дерево категорий текстов (parentId)

**РОЛЬ АГЕНТА:** Executor (backend) — claude  
**ЗАВИСИМОСТИ:** нет (wave 01)  
**LAYER:** 2 · **SIZE:** L  
**PAGES:** `/dictionaries/text-block-categories` (API); `/studio/:id` (consumer later)  
**PAGE_DOCS:** `text-block-categories.page.md` ; `texts.page.md` (note)

**CONFLICT KEYS:**  
`backend/src/modules/text-block-category/**` ;  
`backend/src/modules/text-block/text-block.service.ts` ;  
`backend/src/modules/text-block/dto/**` ;  
`backend/src/common/seed/text-block-categories.seed.ts` (если нужно) ;  
`docs/pages/text-block-categories.page.md` ;  
`docs/agent-checklists/WAVE-NX-TEXT-LIBRARY-HIERARCHY.md` ;  
`docs/agent-checklists/_NOW.md`

### Preflight Check Output
- **Context read:** `docs/audits/2026-09-11-text-library-category-subcategory-audit.md`; `text-block-category.schema.ts` (flat); `text-block.schema.ts` (`categoryId`); WAVE checklist
- **Key Constraints:** depth ≤ 1; reuse TextBlockCategory; no new collection; TextBlock.categoryId must reference **leaf** (subcategory) on create/update
- **Planned Deliverable:** `parentId` + validation + list query `parentId` / roots; service assert leaf on TextBlock assign
- **Validation Path:** backend unit/e2e text-block(-category); FIC C if API shape documented

**Проверено:** подкатегория = `TextBlockCategory` с `parentId` → корневая категория. PO: leaf обязателен.

---

## ИСХОДНОЕ

Плоский `TextBlockCategory`. `TextBlock.categoryId` → любая категория.

## ЧТО ДЕЛАТЬ

1. Schema: `parentId?: ObjectId` ref self, index; validate: parent exists, parent.`parentId` must be null (no depth 2).
2. DTO create/update: optional `parentId`; reject if parent is itself a subcategory.
3. Service:
   - list: support `parentId` query (`null`/omit = roots only **или** all — выбрать: default list returns all with parentId populated; filter `?parentId=` for children; `?rootsOnly=true` optional).
   - delete: 409 if has children OR text-blocks still reference (existing-in-use).
   - cannot set `isDefault` / system default on a subcategory (default stays root «Общее»).
4. TextBlockService create/update: `assertAssignable` — category must be **leaf** (has parentId). If client omits categoryId → resolveDefault remains root «Общее» **only if** we also auto-pick/create? **No** — for new rule: if omit, still resolveDefault root BUT then create must fail with 400 RU «Укажите подкатегорию» **OR** keep default only for legacy and require leaf for explicit NX forms.  
   **Решение TZ:** create/update с явным `categoryId` → must be leaf; без `categoryId` → 400 с понятным RU (больше не молча «Общее»), **кроме** migration/seed paths. Update seed docs. Existing blocks pointing at root: leave readable; next edit must move to leaf (no mass wipe).
5. Units: depth reject; leaf assert; list children.
6. Update `text-block-categories.page.md` + WAVE row 01.

## НЕ

- NX UI (TZ 02/03)
- live BlockSource
- org-scope TextBlock
- legacy frontend rewrite

## AC

1. POST category with parentId of subcategory → 400.
2. POST text-block with root categoryId → 400 RU.
3. POST text-block with leaf categoryId → 201.
4. Gates backend tsc/test/lint PASS.

## Gates

```text
cd backend && pnpm exec tsc -p tsconfig.build.json --noEmit
cd backend && pnpm test -- text-block
cd backend && pnpm lint
```

Archive `tasks/_archive/2026-09/`.

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-09-11
closed_by: Claude
verification:
  - acceptance criteria: PASS
  - typecheck: PASS
  - tests: PASS
  - lint: PASS
  - checklist: ADDED (docs/agent-checklists/TZ-NX-TEXT-CAT-PARENT.md)
  - progress.md: N/A (redirect file — see docs/agent-checklists/_NOW.md)
  - status synchronization: PASS
