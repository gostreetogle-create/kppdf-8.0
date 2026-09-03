# TZ-NX-DOCSTUDIO-S13-PER-PAGE-BACKGROUND: фон по страницам

**РОЛЬ АГЕНТА:** Executor (backend + frontend-nx)  
**LAYER:** 3  
**PAGES:** document-studio  
**ЗАВИСИМОСТИ:** S12-PAGE-BACKGROUND DONE  
**CONFLICT KEYS:** `studio-document.schema.ts`; DTOs; pages rail UI; `studio-multipage.utils.ts`

## ИСХОДНОЕ

S12: document-level `backgroundImage[]` + `defaultBackgroundIndex`. Multipage render уже строит `backgroundPageIndices` из plan — сейчас один default на все страницы.

## ЧТО ДЕЛАТЬ

1. Schema: `backgroundPageIndices?: number[]` (index into `backgroundImage[]`, -1 = none).
2. PATCH merge; length ≥ pageCount.
3. UI pages rail: per current page pick background from list.
4. `planStudioMultipage` / preview uses per-page index.
5. Spec multipage: page1 bg A, page2 bg B.

## КРИТЕРИИ ПРИЁМКИ

1. 2 страницы, разный фон → preview показывает оба.
2. `pnpm test -- studio-multipage` exit 0.
3. `nx build kppdf-web` exit 0 last.

## Финализация

Archive → `tasks/_archive/2026-09/TZ-NX-DOCSTUDIO-S13-PER-PAGE-BACKGROUND.done.md`
