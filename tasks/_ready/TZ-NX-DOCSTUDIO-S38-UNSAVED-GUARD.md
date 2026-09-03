# TZ-NX-DOCSTUDIO-S38-UNSAVED-GUARD: уход без потери правок

**РОЛЬ АГЕНТА:** Executor (frontend-nx)  
**LAYER:** 3  
**PAGES:** document-studio  
**PAGE_DOCS:** `docs/pages/document-studio.page.md` §1  
**ЗАВИСИМОСТИ:** S30 (честный Save)  
**CONFLICT KEYS:** `frontend-nx/.../studio-editor.page.ts`; `studio.routes.ts`; optional reuse `dirty-dialog.guard.ts` pattern  
**IMPLICIT CONFLICT:** `nx build kppdf-web`

## Domain preflight

PO-CANON: dirty-close на показе важнее «фич на вырост». Сейчас `studio.routes` — без `CanDeactivate`; «К списку» / смена URL / F5 уводят молча. Layouts debounce 400ms — легко потерять сдвиг блоков.

## ИСХОДНОЕ

- `layoutsDirty` + `flushLayouts` есть.  
- Нет route guard. Нет confirm на «К списку».

## ЧТО ДЕЛАТЬ

1. `isStudioDirty()` = `layoutsDirty` **или** save in-flight **или** явный dirty после локальных block edits ещё не подтверждённых сервером (минимально: layoutsDirty + optional flag если patchBlock* pending).  
2. `CanDeactivate` на `:id` → dialog «Уйти без сохранения?» Остаться / Уйти / **Сохранить и уйти** (вызвать тот же путь что S30 Save, затем navigate).  
3. «К списку» и любые `router.navigate` из editor — через тот же confirm.  
4. `beforeunload` когда dirty (стандартный browser tip).  
5. Reuse Pi AlertDialog / pattern из `dirty-dialog.guard.ts` (адаптировать тексты под «документ», не паспорт).

## НЕ ИЗМЕНЯТЬ

- Conflict 409 dialog semantics  
- Finalize

## КРИТЕРИИ ПРИЁМКИ

1. Сдвинул блок → сразу «К списку» → confirm, не silent leave.  
2. «Сохранить и уйти» пишет layouts (network) и уходит.  
3. Чистый документ — уход без dialog.  
4. `nx build kppdf-web` PASS.

## Финализация

Archive → `tasks/_archive/2026-09/TZ-NX-DOCSTUDIO-S38-UNSAVED-GUARD.done.md`
