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

## Claim slot
- agent_id: cursor
- claimed_at: 2026-09-04T07:02:00Z
- branch: main
- status: claimed

### Preflight Check Output
- **Context read:** `tasks/_ready/TZ-NX-DOCSTUDIO-S37-OPERATOR-SMOKE.md`, `docs/architecture/nx-doc-studio-operator-bar.md`, `docs/agent-checklists/WAVE-DOCSTUDIO-FINISH-S27.md`, `.agents/skills/kppdf-executor-loop/SKILL.md`
- **Key Constraints:** smoke-only evidence; no product patches; conflict keys = audit + `_NOW` + `QUEUE-LIVE`
- **Planned Deliverable:** browser AC 1–6 on `:4201` → evidence md → WAVE close → archive
- **Validation Path:** FIC N/A (docs); Integrity = evidence PASS/FAIL + HEAD `4fd4052c`
