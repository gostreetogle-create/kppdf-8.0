# TZ-NX-DOCSTUDIO-S48-TABLE-PHOTO-CELLS: фото в ячейке таблицы

**РОЛЬ АГЕНТА:** Executor (NX studio + shared render if needed) — claude  
**ЗАВИСИМОСТИ:** S47 COLUMN-MAP DONE  
**LAYER:** 3 · **SIZE:** L  
**PAGES:** `/studio/:id`  
**PAGE_DOCS:** `docs/pages/document-studio.page.md`

**CONFLICT KEYS:**  
`frontend-nx/apps/kppdf-web/src/app/pages/studio/studio-blocks-canvas.component.ts` ;  
`frontend-nx/apps/kppdf-web/src/app/pages/studio/studio-blocks-canvas.component.spec.ts` ;  
`backend/src/modules/studio-document/studio-data-resolver.ts` (photo cell value shape if needed) ;  
`backend/src/modules/studio-document/studio-output.service.ts` ;  
`docs/pages/document-studio.page.md` ;  
`docs/agent-checklists/WAVE-DOCSTUDIO-S47-S48.md` ;  
`docs/agent-checklists/_NOW.md`

IMPLICIT CONFLICT: nx build kppdf-web

### Preflight Check Output
- **Context read:** S47 DONE; legacy `table-template.service.ts` formatCell photo HTML; PiEmptyTile / catalog photo patterns on NX
- **Key Constraints:** A4 geometry law; print-like canvas; empty = honest «Нет фото» / hatch, not digit qty
- **Planned Deliverable:** img (or empty) in photo-typed columns; PDF/preview aligned
- **Validation Path:** canvas specs; nx build; WAVE DONE

---

## ЧТО ДЕЛАТЬ

1. Detect photo column by `key`/`type` aliases (`photo`, `photoIds`, …).
2. Canvas: render `<img>` when URL present; else empty tile / «Нет фото» — never show raw qty.
3. Studio PDF/preview HTML: reuse or mirror legacy photo cell behaviour without rewriting Create КП.
4. Specs + docs; WAVE S48 + overall DONE; `_NOW` Claude IDLE.

## НЕ ИЗМЕНЯТЬ
Resolver alias work already in S47 (only photo URL quality if missing); Chrome IA; shipping.

## КРИТЕРИИ ПРИЁМКИ
1. After S47 map, Фото column shows image or empty state — not `1` from quantity.
2. Preview/PDF does not regress text columns.
3. Specs + `nx build kppdf-web` PASS; WAVE checklist complete.
