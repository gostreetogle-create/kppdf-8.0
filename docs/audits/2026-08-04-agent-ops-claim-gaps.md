# Agent ops audit — claim / closeout gaps

**Date:** 2026-08-04  
**Mode:** Process audit (docs/skills/prompts) · no product code  
**Trigger:** PO — агенты «не всегда» заполняют `claimed_at`; нужны дыры в каноне, не в людях.

## Verdict

Дыры **реальные**: протокол CLAIM жил в **разовых промптах Cursor** и части checklist’ов волны CATALOG/DICT, но **не был обязательным каноном** в `GEMINI.md` / `AI-AGENT-GUIDE.md`. Team Room `claim` ≠ checklist Claim slot. Итог: кто получил короткий промпт без CLAIM-блока — мог честно пропустить `agent_id` / `claimed_at`.

## Gaps (P0–P2)

| Sev | Gap | Effect |
|-----|-----|--------|
| **P0** | `GEMINI.md` говорит «создай checklist», но **не** требует Status=CLAIMED, Claim slot, `_active` copy | агент пишет код без брони |
| **P0** | `AI-AGENT-GUIDE` / `kppdf-project` — нет единого Claim→Ready→PASS→Archive | расхождение CATALOG vs kit TZF |
| **P0** | Cursor handoff-промпты иногда содержат CLAIM, иногда нет | «лотерея дисциплины» |
| **P1** | Team Room claim не синхронизирован с checklist Claim slot | «занято в room / пусто в checklist» |
| **P1** | Нет шаблона checklist с обязательными полями timestamps | `claimed_at` то ISO, то дата, то пусто |
| **P2** | Нет velocity board (осознанно) | не блокер процесса |
| **P2** | Два контура: root `tasks/` vs OrchestratorKit | путаница `_active` путей |

## Evidence (факт)

- `claimed_at` встречается в свежих CATALOG-317 / DICT-303 / CATALOG-304 checklist — **после** того как Cursor стал писать Claim slot вручную.
- `GEMINI.md` §цикл: checklist без claim protocol (до фикса этой сессии).
- `OrchestratorKit/TEAM-ROOM.md`: claim/heartbeat/complete — без требования зеркала в `docs/agent-checklists/`.

## Remediation (done in same session)

1. `GEMINI.md` — обязательный Claim protocol + timestamps.
2. `docs/AI-AGENT-GUIDE.md` — секция «Бронь задачи (CLAIM)».
3. `.agents/skills/kppdf-project/SKILL.md` — шаг claim в порядке исполнителя.
4. `docs/agent-checklists/_TEMPLATE.md` — канон полей.
5. `.agents/skills/tz-authoring/SKILL.md` — handoff-промпт обязан содержать CLAIM-блок.
6. `docs/how-to-connect-ai.md` — одна строка на claim ritual (если файл есть).

## Rule for Cursor (ongoing)

Каждый промпт исполнителю: блок **CLAIM первым** + ссылка на `_TEMPLATE.md`. Без этого промпт неполный.
