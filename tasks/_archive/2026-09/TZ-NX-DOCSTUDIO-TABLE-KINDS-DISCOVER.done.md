# TZ-NX-DOCSTUDIO-TABLE-KINDS-DISCOVER: где правятся виды таблиц

**РОЛЬ АГЕНТА:** Executor (frontend-nx) — claude  
**ЗАВИСИМОСТИ:** `TZ-NX-DOCSTUDIO-PROPS-PANEL-WIDTH` DONE  
**LAYER:** 3 · **SIZE:** S  
**PAGES:** `/studio/:id` ; `/registries/table-templates`  
**PAGE_DOCS:** `document-studio.page.md` ; `registries.page.md`

**CONFLICT KEYS:**  
`frontend-nx/apps/kppdf-web/src/app/pages/studio/studio-table-properties.component.ts` ;  
`backend/src/modules/**/table-template*` seed (optional) ;  
`docs/pages/document-studio.page.md` ;  
`docs/agent-checklists/WAVE-NX-DOCSTUDIO-TABLE-PROPS.md` ;  
`docs/agent-checklists/_NOW.md`

IMPLICIT CONFLICT: nx build kppdf-web

## ЧТО ДЕЛАТЬ

1. В блоке «Вид таблицы» — явная ссылка/кнопка: **«Реестры → Виды таблиц»** (`/registries/table-templates`).
2. Короткий RU hint: создать/править/удалить виды только там; «Сохранить как вид» — копия в реестр.
3. Optional: seed/ensure один активный вид «Продукты» с колонками sku|photo|name|description|unit|price|qty если PO-canon отсутствует (не дублировать мусорные «Продукты»×N — upsert by stable key/slug).
4. WAVE row 05 COMPLETE.

## НЕ

- Redesign template form

## AC

1. Из props один клик → реестр видов.
2. Docs обновлены.
3. Gates PASS.

---

**ARCHIVE_MARKER:** DONE 2026-09-11T21:50:00Z — SHA `ee243aca` (main, pushed)
