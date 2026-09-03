# TZ-NX-DOCSTUDIO-S14-CONFLICT-DETAIL: детализация 409 диалога

**РОЛЬ АГЕНТА:** Executor (frontend-nx)  
**LAYER:** 3  
**PAGES:** document-studio  
**ЗАВИСИМОСТИ:** S11 conflict dialog DONE  
**CONFLICT KEYS:** `studio-editor.page.ts`

## ИСХОДНОЕ

S11: reload/cancel dialog. Оператор не видит **что** потеряет при reload.

## ЧТО ДЕЛАТЬ

1. При 409: dialog body — revision server vs local, список «несохранённые изменения: N блоков / контекст / layouts» (best-effort counters).
2. Кнопки: «Перезагрузить с сервера» · «Остаться» (cancel).
3. Не three-way merge editor — только informed reload (PARK остаётся).

## КРИТЕРИИ ПРИЁМКИ

1. 409 mock → dialog shows revision info.
2. Reload still works; cancel keeps local view.
3. Studio spec smoke + build exit 0.

## Финализация

Archive → `tasks/_archive/2026-09/TZ-NX-DOCSTUDIO-S14-CONFLICT-DETAIL.done.md`
