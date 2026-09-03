# TZ-NX-DOCSTUDIO-S18-SAVE-AS-MENU: Сохранить и «Сохранить как…»

**РОЛЬ:** Executor (frontend-nx + backend)  
**LAYER:** 3 · **PAGES:** document-studio  
**ЗАВИСИМОСТИ:** S16 DONE  
**CONFLICT KEYS:** `studio-editor.page.ts`; `studio-template-panel.component.ts`; `studio-save-as-template-dialog.component.ts`; `studio-document.service.ts`

## PO rule

- **Сохранить** — документ (`studio_document`), autosave уже есть; явная кнопка = toast «Сохранено» без новой сущности.
- **Сохранить как…** → пункт **«Шаблон»** (позже другие — не сейчас).
- Шаблон: если имя **уже есть** в org → диалог **перезаписать?** Иначе создать новый.
- Шаблон **не** хранит значения переменных (`catalogSelections`, client, quotationId…) — только макет и структурные привязки (источник таблицы, токены-заглушки).

## ЧТО ДЕЛАТЬ

1. Ribbon: кнопка **«Сохранить»** + split **«Сохранить как…»** с пунктом «Шаблон».
2. Убрать дубли: отдельную кнопку «Шаблон» в ribbon (остаётся в правом rail «Шаблон»).
3. Диалог шаблона: имя + docType; убрать галочку `keepDataBindings` (поведение фиксированное: structural only).
4. Backend `overwriteTemplateByName` или match by id if user picks existing from list.
5. `saveAsTemplate`: не копировать instance `context` в template document.

## КРИТЕРИИ ПРИЁМКИ

1. Save as template с существующим именем → confirm overwrite.
2. From-template → context пуст, макет на месте.
3. `nx build kppdf-web` exit 0 last.

## Archive

`tasks/_archive/2026-09/TZ-NX-DOCSTUDIO-S18-SAVE-AS-MENU.done.md`
