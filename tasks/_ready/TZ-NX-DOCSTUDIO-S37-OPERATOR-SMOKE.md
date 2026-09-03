# TZ-NX-DOCSTUDIO-S37-OPERATOR-SMOKE: приёмка глазом + evidence

**РОЛЬ АГЕНТА:** Executor (read-only smoke + short evidence md)  
**LAYER:** 1  
**PAGES:** document-studio  
**ЗАВИСИМОСТИ:** S36  
**CONFLICT KEYS:** `docs/audits/2026-09-0X-docstudio-finish-smoke.md` (создать); `_NOW.md`; `QUEUE-LIVE.md`

## ЧТО ДЕЛАТЬ

Пройти и записать PASS/FAIL:

1. Новое КП → Данные → витрина 2 изделия → строки на листе.  
2. Клиент + `{{counterparty.name}}` → Просмотр → подстановка.  
3. Сохранить → network ok; F5 имя/строки на месте.  
4. PDF скачивается.  
5. `/proposals` видит КП / «В студии».  
6. Rename + formula one control.

При FAIL — не archive DONE; завести hotfix TZ в `_ready`.

## КРИТЕРИИ ПРИЁМКИ

1. Evidence file со скрин/notes и HEAD SHA.  
2. WAVE FINISH closed в checklist.

## Финализация

Archive → `tasks/_archive/2026-09/TZ-NX-DOCSTUDIO-S37-OPERATOR-SMOKE.done.md`
