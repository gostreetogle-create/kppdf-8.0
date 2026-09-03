# TZ-NX-DOCSTUDIO-S14-FLOATING-TYPO-TOOLBAR: плавающая панель шрифта

**РОЛЬ АГЕНТА:** Executor (frontend-nx)  
**LAYER:** 3  
**PAGES:** document-studio  
**PAGE_DOCS:** `docs/architecture/nx-doc-studio.md` §5  
**ЗАВИСИМОСТИ:** S13 typography DONE  
**CONFLICT KEYS:** `studio-blocks-canvas*`; `studio-editor.page.ts`; new `studio-floating-typo-toolbar*`

## ИСХОДНОЕ

Типографика только в правой панели «Свойства». PO law: floating toolbar над выделенным текстом, `stopPropagation` на клик.

## ЧТО ДЕЛАТЬ

1. При select text block (not locked): mini toolbar над блоком (bold/italic/underline + font size step или family dropdown compact).
2. Позиция от `layout` block rect; не двигает лист.
3. Clicks inside toolbar не сворачивают side panel (`stopPropagation`).
4. Дублирует существующие patch paths (`applyBlockContent` / style PATCH), не второй write-path.

## КРИТЕРИИ ПРИЁМКИ

1. Select text → toolbar visible; click bold → preview/content updates.
2. Click toolbar не закрывает flyout панель.
3. `nx build kppdf-web` exit 0 last.

## Финализация

Archive → `tasks/_archive/2026-09/TZ-NX-DOCSTUDIO-S14-FLOATING-TYPO-TOOLBAR.done.md`
