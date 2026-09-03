# TZ-NX-DOCSTUDIO-S11-CONFLICT-DIALOG: 409 UX

**РОЛЬ АГЕНТА:** Executor (frontend-nx)  
**LAYER:** 3  
**PAGES:** document-studio  
**ЗАВИСИМОСТИ:** —  
**CONFLICT KEYS:** `studio-editor.page.ts`; `@kppdf/ui/dialog`

## ИСХОДНОЕ

`conflict()` — toast + silent reload doc/blocks (`studio-editor.page.ts:1784`). Оператор не понимает что потерял правки.

## ЧТО ДЕЛАТЬ

1. При 409/revision mismatch: `AlertDialogComponent` — «Документ изменён elsewhere» · **Перезагрузить** (reload server) · **Отмена** (keep local view, no overwrite until reload).
2. Debounce: один dialog за burst, не spam на каждый parallel PATCH fail.
3. Spec smoke: mock 409 → dialog shown.

## НЕ ИЗМЕНЯТЬ

- Full three-way merge (PARK ADR)
- Backend revision schema

## КРИТЕРИИ ПРИЁМКИ

1. 409 → dialog, не только toast.
2. Reload подтягивает server revision.
3. `nx test kppdf-web --testPathPattern=studio` + build exit 0.

## Финализация

Archive → `tasks/_archive/2026-09/TZ-NX-DOCSTUDIO-S11-CONFLICT-DIALOG.done.md`
