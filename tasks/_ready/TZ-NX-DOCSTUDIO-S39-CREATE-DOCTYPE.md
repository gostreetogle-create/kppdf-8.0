# TZ-NX-DOCSTUDIO-S39-CREATE-DOCTYPE: тип при создании любого документа

**РОЛЬ АГЕНТА:** Executor (frontend-nx)  
**LAYER:** 3  
**PAGES:** document-studio  
**PAGE_DOCS:** `docs/pages/document-studio.page.md` §1  
**ЗАВИСИМОСТИ:** S33 (Новое КП уже shortcut)  
**CONFLICT KEYS:** `frontend-nx/.../studio-list.page.ts`; small dialog component under studio/  
**IMPLICIT CONFLICT:** `nx build kppdf-web`

## Domain preflight

Студия = **любые** A4 (КП, договор, счёт, акт — seed DocTypes).  
«Создать документ» сейчас без `docTypeId` → оператор забывает тип → Save-as-template и токены/КП-lifecycle ломаются по смыслу. S33 закрывает только КП.

## ИСХОДНОЕ

`create({ name, orientation, pageSize })` без типа. Типы: `PiDocTypesService` / seed proposal, contract, invoice, …

## ЧТО ДЕЛАТЬ

1. «Создать документ» → dialog: имя (default как сейчас) + **обязательный** select типа из live DocTypes.  
2. Create API с `docTypeId`.  
3. «Новое КП» (S33) остаётся одним кликом без dialog (уже proposal).  
4. «Из шаблона» не трогать (тип наследуется от шаблона).  
5. `data-test="studio-create-doctype-dialog"`.

## КРИТЕРИИ ПРИЁМКИ

1. Нельзя создать blank без типа.  
2. Создал «Договор» → в панели Шаблон выбран договор.  
3. `nx build kppdf-web` PASS.

## Финализация

Archive → `tasks/_archive/2026-09/TZ-NX-DOCSTUDIO-S39-CREATE-DOCTYPE.done.md`
