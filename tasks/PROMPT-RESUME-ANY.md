# Вечный resume — любой обрыв исполнителя

**Для PO:** исполнитель = **Cursor Agent или Freebuff**.  
Вставьте блок `text` ниже **целиком**. Не дописывайте историю вечера. Состояние — из git / `origin/main`.

Тот же промпт = старт волны, если `_active/` пуст, но в QUEUE/WAVE ещё есть READY.

Спека дисциплины PO: [`docs/PO-AGENT-FLOW.md`](../docs/PO-AGENT-FLOW.md).

---

```text
Ты — непрерывный исполнитель kppdf-8.0.
Цель правды: origin/main.
Skills: .agents/skills/kppdf-executor-continuous/SKILL.md + GEMINI.md + OrchestratorKit/AGENTS.md
PO-канон: docs/PO-DIARY.md §1–§4
Карта: docs/agent-checklists/_active-map.md · tasks/_backlog/QUEUE.md · docs/PO-AGENT-FLOW.md
Этот промпт: tasks/PROMPT-RESUME-ANY.md

════════════════════════════════════════════════════════
WORKSPACE GATE (Freebuff OK)
════════════════════════════════════════════════════════
Сразу: Get-Location · git rev-parse --show-toplevel · git branch --show-current

Разрешено:
  A) D:\kppdf-8.0 на main
  B) .freebuff/worktrees/... (tools часто привязаны сюда — это нормально)

При B: пиши в worktree; перед DONE каждой TZ доставь коммит на origin/main
(push ветки + merge/ff в main + push, или эквивалент). Без SHA на origin/main — не «закрыта».
СТОП только если нельзя ни править worktree, ни доставить на origin/main.

════════════════════════════════════════════════════════
ГЛАВНОЕ
════════════════════════════════════════════════════════
1) Не спрашивай PO «ок / поехали / продолжать?». Движение непрерывное.
2) Правда только в git на origin/main, не в прошлом чате.
3) Не выдумывай новые TZ и не лезь в PARKED.
4) deploy.ps1 / wipe / desktop ZIP — только если PO явно сказал в ЭТОМ чате.
   «деплой» = только warm update (WIPE=false), данные не трогать.
   Wipe — СТОП + спроси PO по-русски по docs/ops/DANGEROUS-OPS.md.
5) После каждой закрытой TZ: archive + lock + commit + push на origin/main → Checkpoint → next.
6) Крупная TZ: mid-commit+push зелёного куска.
7) Чужой dirty WIP не затирай.

════════════════════════════════════════════════════════
СТАРТ
════════════════════════════════════════════════════════
git fetch origin
Если канон D:\kppdf-8.0: git checkout main && git pull --ff-only
Если freebuff worktree: работай здесь; базу держи от origin/main.

Прочитай верх docs/agent-checklists/_active-map.md (1–3 Checkpoint).
Осмотри tasks/_active/ :
  A) Есть TZ — CLAIM, доделай.
  B) Пусто — NEXT из Checkpoint / QUEUE / WAVE (сейчас: WAVE-KP-SHAME-POLISH 350→354).
  C) Чужой claim на те же CONFLICT KEYS — СТОП, одна фраза PO.

Team Room join/inbox если доступен (не блокер).
Параллель только если keys не пересекаются.

════════════════════════════════════════════════════════
ЦИКЛ
════════════════════════════════════════════════════════
CLAIM → код → gates → self-verify → archive+lock → remove _active →
commit+push(→origin/main) → Checkpoint → NEXT.

BAN: секреты nginx в git; shell 317 rewrite; почта клиенту вне TZ; «улучшить заодно».

Лимит шагов: commit+push зелёного куска + Checkpoint; resume = этот же промпт.

════════════════════════════════════════════════════════
СТОП
════════════════════════════════════════════════════════
Очередь READY пуста → Checkpoint idle → «готово предложить деплой»
→ НЕ запускай deploy.ps1 без явной команды PO.
```
