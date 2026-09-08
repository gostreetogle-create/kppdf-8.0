# TZ-NX-DOCSTUDIO-S47-COLUMN-MAP-PARITY: ключи колонок ↔ ERP поля

**РОЛЬ АГЕНТА:** Executor (BE + NX studio) — claude  
**ЗАВИСИМОСТИ:** `TZ-NX-DOCSTUDIO-S47-AUDIT-RECHECK` DONE + recheck verdict **PASS**  
**LAYER:** 3 · **SIZE:** L  
**PAGES:** `/studio/:id`  
**PAGE_DOCS:** `docs/pages/document-studio.page.md`

**CONFLICT KEYS:**  
`backend/src/modules/studio-document/studio-data-resolver.ts` ;  
`backend/src/modules/studio-document/studio-data-resolver.spec.ts` ;  
`frontend-nx/apps/kppdf-web/src/app/pages/studio/studio-editor.page.ts` ;  
`frontend-nx/apps/kppdf-web/src/app/pages/studio/studio-table-defaults.ts` ;  
`frontend-nx/apps/kppdf-web/src/app/pages/studio/studio-table-properties.component.ts` (только emit/wiring re-hydrate если нужно) ;  
`docs/pages/document-studio.page.md` ;  
`docs/agent-checklists/WAVE-DOCSTUDIO-S47-S48.md`

IMPLICIT CONFLICT: nx build kppdf-web

### Preflight Check Output
- **Context read:** Cursor audit + **Claude recheck PASS**; `proposal-table-layout.util.ts`; product schema photo/description
- **Key Constraints:** map by **column.key**, never by index; keep 3-col templates working; S46 liveRows ephemeral
- **Planned Deliverable:** alias parity + rich LineItem + re-hydrate on column structure change
- **Validation Path:** resolver specs 6-col; editor re-hydrate test; nx build

**Проверено:** BUG-1/2/3 в аудитах; эталон Create КП aliases.

---

## ЧТО ДЕЛАТЬ

### ШАГ 1 — Resolver alias + LineItem
- Expand `COLUMN_ALIASES` / `lineValue` to parity with Create КП: `article`, `photo` (URL or marker for S48), `description`, `productName`, `unitPrice`, `index` as needed.
- Catalog/order/quotation → LineItem: fill `description`, photo URL from `mainPhotoId`/`photoIds` when available.
- Specs: template keys `[sku|article, photo, productName|name, description, unit, unitPrice|price]` → cells in correct slots; no positional leak of name into sku col.

### ШАГ 2 — Re-hydrate on template / column change
- When live `dataSource` and `tableTemplateColumns` (or template id) change → `putDataSet` again so `liveRows` width/keys match headers.
- Do **not** wipe ephemeral incorrectly (S46 merge remains).

### ШАГ 3 — Defaults for КП path
- Prefer applying КП 6-col template (or matching keys) when inserting catalog table on КП-type docs **if** a seed/template exists; else document known_limitation + ensure Properties template pick re-hydrates (ШАГ 2).
- Keep `STUDIO_DEFAULT_TABLE_COLUMNS` 3-col for generic docs **but** hydrate must follow whatever columns are on the block.

### ШАГ 4 — Docs
- `document-studio.page.md`: column bind = key match; re-hydrate rule; point to audit.

## НЕ ИЗМЕНЯТЬ
Canvas photo thumbnails (S48); Chrome rails; `/desk`; `document-template.service` mega-refactor; S45 select UX.

## КРИТЕРИИ ПРИЁМКИ
1. PO layout 6 keys + catalog products → name not in Артикул; price not in Наименование; qty not in Фото as fake photo.
2. Change «Вид таблицы» on live table → rows realign without reload page.
3. 3-col name/qty/price still works.
4. `article` ≡ sku.
5. Focused BE + NX tests PASS; `nx build kppdf-web` PASS last.
