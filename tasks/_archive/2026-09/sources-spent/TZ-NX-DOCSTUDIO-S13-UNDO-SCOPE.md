# TZ-NX-DOCSTUDIO-S13-UNDO-SCOPE: Ctrl+Z локально (не merge)

**РОЛЬ АГЕНТА:** Executor (frontend-nx)  
**LAYER:** 3  
**PAGES:** document-studio  
**PAGE_DOCS:** `docs/pages/document-studio.page.md` §7 PARK partial  
**ЗАВИСИМОСТИ:** S11 dblclick focus DONE  
**CONFLICT KEYS:** `studio-text-properties*`; `studio-table-editor*`; `studio-editor.page.ts`; `@kppdf/ui/rich-text`

## Domain preflight

PARK «three-way merge» — **не** scope. PO canon: undo где безопасно. Scope: **только текущая сессия редактора**, один документ, без cross-tab.

## ИСХОДНОЕ

TipTap/rich-text может иметь internal undo; глобального Ctrl+Z на студии нет. Table inline edit — без undo.

## ЧТО ДЕЛАТЬ

1. When rich-text focused: Ctrl+Z / Ctrl+Y → delegate to `PiRichTextEditor` undo/redo API (add if missing).
2. Table active cell edit: local stack (max 20 steps) per block for cell changes.
3. Host listener on studio viewport; не перехватывать когда focus outside editor.
4. Status hint «Отменено» optional toast once.
5. Spec: type text → Ctrl+Z reverts.

## НЕ ИЗМЕНЯТЬ

- Revision conflict merge / three-way UI
- Backend history

## КРИТЕРИИ ПРИЁМКИ

1. Ctrl+Z in text properties reverts last typing.
2. Ctrl+Z on canvas selection-only does nothing harmful.
3. `nx test kppdf-web --testPathPattern=studio` + build exit 0.

## Финализация

Archive → `tasks/_archive/2026-09/TZ-NX-DOCSTUDIO-S13-UNDO-SCOPE.done.md`
