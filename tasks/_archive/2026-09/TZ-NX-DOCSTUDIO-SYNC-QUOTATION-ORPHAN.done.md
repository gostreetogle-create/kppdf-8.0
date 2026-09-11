# TZ-NX-DOCSTUDIO-SYNC-QUOTATION-ORPHAN: 404 `POST …/sync-quotation`

**РОЛЬ АГЕНТА:** Executor (backend + тонкий FE) — claude  
**ЗАВИСИМОСТИ:** после FE Lucide+picker **или** параллельно только если `_active` не держит те же BE keys  
**LAYER:** 2–3 · **SIZE:** S  
**PAGES:** `/studio/:id` (КП)  
**PAGE_DOCS:** `document-studio.page.md`

**CONFLICT KEYS:**  
`backend/src/modules/studio-document/studio-quotation-lifecycle.service.ts` ;  
`backend/src/modules/studio-document/studio-quotation-lifecycle.service.spec.ts` ;  
`backend/src/modules/studio-document/studio-document.controller.ts` (только если нужен контракт) ;  
`frontend-nx/apps/kppdf-web/src/app/pages/studio/studio-editor.page.ts` (soft toast / re-ensure) ;  
`docs/pages/document-studio.page.md` ;  
`docs/agent-checklists/_NOW.md`

IMPLICIT CONFLICT: frontend-nx/apps/kppdf-web — nx build kppdf-web  
(+ backend tsc/test)

### Preflight Check Output
- **Context read:** console PO `POST /api/studio-documents/6aa381f9…/sync-quotation` → 404; `studio-quotation-lifecycle.service.ts` `syncQuotationItems` → `quotationService.findById` throws `NotFoundException`; `assertQuotationOrg` тоже 404; FE `syncKpQuotationItems` toast на любой fail; `docs/PO-CANON.md` (demo DB ≠ prod inheritance)
- **Key Constraints:** Не wipe. Soft-heal мёртвой связи. Не менять money/status machine КП.
- **Planned Deliverable:** мёртвый `linkedQuotationId` → clear + ensure (для KP) или честный soft-fail без спама 404; регресс-тест
- **Validation Path:** backend unit + focused FE; FIC G

**Проверено:** endpoint существует (`@Post(':id/sync-quotation')`). 404 = документ найден, а **linked Quotation** нет / чужой org (OrgScope-style).

---

## ИСХОДНОЕ СОСТОЯНИЕ

1. Оператор открывает studio-doc; FE зовёт `syncQuotation` когда есть `quotationId` в контексте.
2. В локальной Mongo часто: `linkedQuotationId` → удалённая/чужая Quotation → `findById` / `assertQuotationOrg` → **404**.
3. UX: красный toast + шум в Network; витрина/save продолжают жить, но КП-sync сломан.

## ЧТО ДЕЛАТЬ

1. **BE** в `syncQuotationItems` (или тонкой обёртке, которую зовёт controller):
   - если `linkedQuotationId` задан, но quotation missing **или** org mismatch:
     - сбросить `doc.linkedQuotationId` + `context.quotationId` (если совпадает), `save`;
     - для KP (`isKpDocument`) вызвать `ensureLinkedQuotation` и затем обычный sync;
     - для non-KP — return `null` (не 404).
   - не палить чужой org отдельным текстом (оставить NotFound semantics наружу только если ensure тоже невозможен).
2. Unit: кейс «doc с мёртвым linkedQuotationId → ensure+sync / null, не throw».
3. **FE** `syncKpQuotationItems`: если после BE soft-heal ok — обновить `document` из ответа; если всё же fail — один toast, без retry-шторма.
4. Короткая note в `document-studio.page.md` (orphan link heal).

## НЕ ИЗМЕНЯТЬ

- Quotation status machine / convert
- uploads orphan files (отдельный data-clean, только по команде PO)
- Preview iframe sandbox warnings

## КРИТЕРИИ ПРИЁМКИ

1. Spec: dead `linkedQuotationId` → sync **не** отдаёт необработанный 404 «Quotation X not found» оператору как hard crash; KP получает живую draft quotation + items sync.
2. Повторный `POST …/sync-quotation` на том же doc → 200 (или честный business error, не orphan 404).
3. Gates: backend tsc/test + nx build PASS.

## BUILD INTEGRITY / Gates

```text
cd backend && pnpm exec tsc -p tsconfig.build.json --noEmit
cd backend && pnpm test -- studio-quotation-lifecycle
cd frontend-nx && pnpm exec nx build kppdf-web   # если трогали FE — последним
```

Параллель: не стартовать, пока FE Lucide/picker TZ держит `_active` на `kppdf-web` (sequential).

## Финализация

Archive `tasks/_archive/2026-09/` + commit/push.

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-09-11
closed_by: Claude
verification:
  - acceptance criteria: PASS
  - typecheck: PASS
  - tests: PASS
  - lint: PASS (1 self-introduced error fixed; pre-existing baseline warnings/38-error debt elsewhere untouched)
  - checklist: ADDED (docs/agent-checklists/TZ-NX-DOCSTUDIO-SYNC-QUOTATION-ORPHAN.md)
  - progress.md: N/A (redirect file — see docs/agent-checklists/_NOW.md)
  - status synchronization: PASS
