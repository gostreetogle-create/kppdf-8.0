# TZ-NX-DOCSTUDIO-S37B-COUNTERPARTY-TOKEN-PREVIEW

**РОЛЬ АГЕНТА:** Executor (frontend-nx)  
**LAYER:** 3  
**PAGES:** document-studio  
**ЗАВИСИМОСТИ:** S37 smoke FAIL AC2  
**CONFLICT KEYS:** `frontend-nx/.../studio-editor.page.ts` (ERP insert / preview path only if needed); text props / field picker components used by studio

## ИСХОДНОЕ

S37 operator smoke (`docs/audits/2026-09-04-docstudio-finish-smoke.md`):  
AC2 FAIL — выбран клиент в «Данные», но не доказана вставка `{{counterparty.name}}` через «Поле ERP» и подстановка в **Просмотр**.

## ЧТО ДЕЛАТЬ

1. Воспроизвести: Новый/открытый КП → Клиент выбран → текст → «Поле ERP» → `counterparty.name` → Просмотр показывает имя клиента (не сырой токен).  
2. Если UI picker ломается (overlay/focus) — починить минимально.  
3. Spec или smoke note в checklist.  
4. `nx build kppdf-web` LAST.

## НЕ ИЗМЕНЯТЬ

- PDF pipeline, Save, vitrina selection (уже PASS в S37).

## КРИТЕРИИ ПРИЁМКИ

1. Preview подставляет имя выбранного клиента из `{{counterparty.name}}`.  
2. Gates PASS.  

## Финализация

Archive → `tasks/_archive/2026-09/TZ-NX-DOCSTUDIO-S37B-COUNTERPARTY-TOKEN-PREVIEW.done.md`  
После DONE — повторный mini-smoke AC2 и закрытие WAVE S37.
