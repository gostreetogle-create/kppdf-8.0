# TZ-NX-DOCSTUDIO-S34-FORMULA-DEDUP: один control «Формула»

**РОЛЬ АГЕНТА:** Executor (frontend-nx)  
**LAYER:** 3  
**PAGES:** document-studio  
**PAGE_DOCS:** `docs/pages/document-studio.page.md` §3.5  
**ЗАВИСИМОСТИ:** S33  
**CONFLICT KEYS:** `frontend-nx/.../studio-text-properties.component.ts`  
**IMPLICIT CONFLICT:** `nx build kppdf-web`

## ИСХОДНОЕ

Два `<select>` «Формула» с **одинаковым** `data-test="studio-text-formula-select"` (FORMULA_OPTIONS + hardcoded tokens).

## ЧТО ДЕЛАТЬ

1. Оставить **один** select: опции = сумма / НДС / итого (+ % если уже было).  
2. Уникальный `data-test`.  
3. Удалить мёртвый второй control и дублирующий state.

## КРИТЕРИИ ПРИЁМКИ

1. В свойствах текста ровно один «Формула».  
2. Вставка токена в контент работает.  
3. `nx build kppdf-web` PASS.

## Финализация

Archive → `tasks/_archive/2026-09/TZ-NX-DOCSTUDIO-S34-FORMULA-DEDUP.done.md`
