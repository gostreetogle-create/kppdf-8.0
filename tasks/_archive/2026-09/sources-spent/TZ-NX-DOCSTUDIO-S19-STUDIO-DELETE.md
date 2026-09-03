# TZ-NX-DOCSTUDIO-S19-STUDIO-DELETE: удаление документов и шаблонов

**РОЛЬ:** Executor (frontend-nx)  
**LAYER:** 3 · **PAGES:** document-studio, registries  
**ЗАВИСИМОСТИ:** — (можно после S16)  
**CONFLICT KEYS:** `studio-list.page.ts`; `studio-template-picker-dialog.component.ts`

## ИСХОДНОЕ

- `/studio` list: delete есть (`studio-list.page.ts:158`) — проверить confirm + toast.
- Picker «Из шаблона»: **нет удаления** — шаблоны копятся.
- Backend: `DELETE document-templates/:id` exists (`document-template.service.ts:2044`).

## ЧТО ДЕЛАТЬ

1. Template picker: swipe/delete icon или context menu → `AlertDialog` destructive → `DELETE template`.
2. `/studio` list: destructive confirm если нет; показать ошибку если template in use.
3. Опционально: в реестре шаблонов (если есть карточка) — тот же delete.
4. `data-test` на delete actions.

## КРИТЕРИИ ПРИЁМКИ

1. Удалённый шаблон не появляется в picker.
2. Удалённый studio doc исчезает из списка.
3. `nx build kppdf-web` exit 0 last.

## Archive

`tasks/_archive/2026-09/TZ-NX-DOCSTUDIO-S19-STUDIO-DELETE.done.md`
