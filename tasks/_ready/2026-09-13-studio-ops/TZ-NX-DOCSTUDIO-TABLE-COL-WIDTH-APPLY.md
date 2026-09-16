# TZ-NX-DOCSTUDIO-TABLE-COL-WIDTH-APPLY: цифры ширины колонок реально влияют на таблицу

> **SIZE:** S · **PACK:** `tasks/_ready/2026-09-13-studio-ops/`  
> **РОЛЬ:** Freebuff (после TABLE-PHOTO-BROKEN-IMG — общий `studio-data-resolver`)  
> **LAYER:** 3
> **ЗАВИСИМОСТИ:** не параллелить с `TZ-NX-DOCSTUDIO-TABLE-PHOTO-BROKEN-IMG`

**CONFLICT KEYS:**  
`backend/src/modules/studio-document/studio-data-resolver.ts; backend/src/modules/studio-document/studio-data-resolver.spec.ts; frontend-nx/apps/kppdf-web/src/app/pages/studio/studio-blocks-canvas.component.ts; frontend-nx/apps/kppdf-web/src/app/pages/studio/studio-blocks-canvas.component.spec.ts; frontend-nx/apps/kppdf-web/src/app/pages/studio/studio-table-properties.component.ts; frontend-nx/apps/kppdf-web/src/app/pages/studio/studio-table-defaults.ts`

**PAGES:** `/studio/:id`  
**PAGE_DOCS:** `docs/pages/document-studio.page.md`

IMPLICIT CONFLICT: frontend-nx/apps/kppdf-web — nx build kppdf-web

---

## Domain preflight

- **Проверено:** `studio-table-properties` сохраняет `col.width` (1–100) в `tableTemplateColumns`. BE `renderStudioTableHtml` L192–196: `width = Math.round(100 / columns.length)` — **игнорирует** `col.width`. Canvas `<th>` — без `[style.width]`. Цифры в UI — мёртвый control.
- **Смысл поля:** ширина колонки в **%** от таблицы (сумма желательно ~100; если нет — нормализовать пропорционально).
- **Necessity:** PO крутит цифры — ноль эффекта; доверие к «Структура колонок» падает.

## ЧТО ДЕЛАТЬ

1. Helper `columnWidthPercents(columns): number[]` — берёт `col.width` (clamp 1–100), если сумма 0 → equal split; иначе scale к 100 (округление, последний добивает остаток).
2. BE `renderStudioTableHtml`: `th`/`td` style `width:${pct}%` из helper (не equal split). Spec: колонки width 60/40 → th 60%/40%.
3. Canvas: `[style.width.%]="colWidthPct(block, i)"` на `th` (и при желании `td`). Spec: меняет DOM width.
4. Properties UI: label/hint у поля — «Ширина, %» (eyebrow или `aria-label` + короткий hint под блоком «сумма ≈ 100%»). Не новый layout.
5. Gates: BE jest resolver + FE canvas/props scoped + `nx build kppdf-web`.

## НЕ ИЗМЕНЯТЬ

Photo pipeline; category forms; drag-resize колонок на A4 (out of scope — только % из свойств); wipe/deploy.

## ACCEPT

1. Изменить width 20→50 у «Наименование» → на холсте и в Просмотре колонка заметно шире.  
2. Equal default без width → как сейчас visually ok.  
3. Specs + build green.  
4. page.md одна строка: width = % доли таблицы.
