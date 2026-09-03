# TZ-NX-DOCSTUDIO-S13-TYPOGRAPHY-PDF: D1 — шрифт блока в Preview/PDF

**РОЛЬ АГЕНТА:** Executor (backend render + verify FE)  
**LAYER:** 3  
**PAGES:** document-studio  
**PAGE_DOCS:** `docs/architecture/nx-doc-studio.md` D1  
**ЗАВИСИМОСТИ:** S12 DONE (`25e649a5`)  
**CONFLICT KEYS:** `document-render.service.ts`; `studio-render.adapter.ts`; `document-render.block-style.spec.ts`

## ИСХОДНОЕ

Блок `style.fontSizePt` частично в render. `body { font-family: Times New Roman }` default. PO: выбранный в свойствах шрифт (Arial/Calibri/Times) должен совпадать в Preview/PDF.

## ЧТО ДЕЛАТЬ

1. Audit studio text blocks: `style.fontFamily` → HTML inline/wrapper в `renderHtml` path для studio.
2. Sanitize rule сохраняется: inline font-family в content вырезается; block.style — SoT.
3. Spec: block Arial 14pt → preview HTML contains Arial + 14pt.
4. Regression: bold/italic/underline + `{{tokens}}` intact.

## КРИТЕРИИ ПРИЁМКИ

1. Смена fontFamily в свойствах → Preview меняется.
2. `pnpm test -- document-render.block-style` exit 0.
3. `nx build kppdf-web` exit 0 last.

## Финализация

Archive → `tasks/_archive/2026-09/TZ-NX-DOCSTUDIO-S13-TYPOGRAPHY-PDF.done.md`
