# TZ-NX-DOCSTUDIO-S7-RAILS-TEMPLATE — rail «Шаблон» + save-as-template

**РОЛЬ:** executor · **ЗАВИСИМОСТИ:** S7-RAILS-DATA DONE  
**IMPLICIT CONFLICT:** `nx build kppdf-web`  
**CONFLICT KEYS:** `studio-editor.page.ts`; `studio-save-as-template-dialog.component.ts`; `studio-workspace-chrome.ts`

## ЧТО ДЕЛАТЬ

1. Rail **«Шаблон»** слева (после «Данные»).
2. Кнопка ribbon «Шаблон» → тот же flow что панель (name + keep bindings + docTypeId если нужен API).
3. Использовать `StudioSaveAsTemplateDialogComponent` / `POST …/save-as-template`.
4. Убрать дубли prompt() если остались в editor.

## КРИТЕРИИ

- [ ] Save-as-template из панели и ribbon — один UX
- [ ] Toast успех/ошибка
- [ ] build green
