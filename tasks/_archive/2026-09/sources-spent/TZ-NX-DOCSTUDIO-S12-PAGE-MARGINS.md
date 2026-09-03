# TZ-NX-DOCSTUDIO-S12-PAGE-MARGINS: поля страницы D2

**РОЛЬ АГЕНТА:** Executor (backend + frontend-nx + render)  
**LAYER:** 3–4  
**PAGES:** document-studio  
**PAGE_DOCS:** `docs/architecture/nx-doc-studio.md` D2  
**ЗАВИСИМОСТИ:** S12-PAGE-BACKGROUND optional parallel  
**CONFLICT KEYS:** `studio-document.schema.ts`; DTOs; `document-render.service.ts`; `studio-output.service.ts`; pages rail UI

## ИСХОДНОЕ

Render: hardcoded `.doc-content{padding:20px}` (`document-render.service.ts`). `pageMargins` нет на `studio_documents`.

## ЧТО ДЕЛАТЬ

### Backend
1. `pageMargins: { top, right, bottom, left }` на `StudioDocument` (mm or px — match template convention).
2. PATCH/update DTO + validation (0–50mm).
3. Copy from `DocumentTemplate` on `from-template` if template has margins.

### Render
4. `renderStudioDocument` / `renderHtml` — padding из `doc.pageMargins`, не константа 20px.
5. Spec: margins 10mm → HTML contains expected padding.

### UI
6. Rail «Страницы»: 4 compact inputs (top/right/bottom/left) или linked preset «узкие/стандарт/широкие».

## КРИТЕРИИ ПРИЁМКИ

1. PATCH margins → preview PDF padding меняется.
2. Screen vs preview padding согласованы (same source).
3. Backend test + `nx build kppdf-web` exit 0 last.

## Финализация

Archive → `tasks/_archive/2026-09/TZ-NX-DOCSTUDIO-S12-PAGE-MARGINS.done.md`
