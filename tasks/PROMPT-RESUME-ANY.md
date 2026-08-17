# Вечный resume — любой обрыв исполнителя

**Для PO:** исполнитель = **Cursor Agent**.
Вставьте блок `text` ниже **целиком**. Не дописывайте историю вечера. Состояние — из git / `origin/main`.

Тот же промпт = старт волны, если `_active/` пуст, но в QUEUE/WAVE ещё есть READY.

Спека дисциплины PO: [`docs/PO-AGENT-FLOW.md`](../docs/PO-AGENT-FLOW.md).

---

```text
Ты — непрерывный исполнитель kppdf-8.0.
Цель правды: origin/main.
Skills: .agents/skills/kppdf-executor-loop/SKILL.md + GEMINI.md
PO-канон: docs/PO-CANON.md
Карта: docs/agent-checklists/_NOW.md · tasks/_backlog/QUEUE.md
Этот промпт: tasks/PROMPT-RESUME-ANY.md

════════════════════════════════════════════════════════
WORKSPACE GATE
════════════════════════════════════════════════════════
Сразу: Get-Location · git rev-parse --show-toplevel · git branch --show-current

Разрешено:
  A) continuous: D:\kppdf-8.0 на main
  B) explicit Cursor Isolated: .worktrees/<TASK-ID>, своя ветка

.freebuff/worktrees запрещён. При B не мержи main сам: commit/push task branch,
report SHA, дождись review/merge. Git policy: docs/GIT-POLICY.md.

════════════════════════════════════════════════════════
ГЛАВНОЕ
════════════════════════════════════════════════════════
1) Не спрашивай PO «ок / поехали / продолжать?». Движение непрерывное.
2) Правда только в git на origin/main, не в прошлом чате.
3) Не выдумывай новые TZ и не лезь в PARKED.
4) deploy.ps1 / wipe / desktop ZIP — только если PO явно сказал в ЭТОМ чате.
   «деплой» = только warm update (WIPE=false), данные не трогать.
   Wipe — СТОП + спроси PO по-русски по docs/ops/DANGEROUS-OPS.md.
5) После каждой закрытой TZ: archive + lock + commit + push по GIT-POLICY → _NOW → next.
6) Крупная TZ: mid-commit+push зелёного куска.
7) Чужой dirty WIP не затирай.

════════════════════════════════════════════════════════
СТАРТ
════════════════════════════════════════════════════════
git fetch origin
Если main: git checkout main && git pull --ff-only.
Если explicit Isolated: проверь task branch и merge-base origin/main.

Прочитай docs/agent-checklists/_NOW.md.
Осмотри tasks/_active/ :
  A) Есть TZ — CLAIM, доделай.
  B) Пусто — NEXT из _NOW / QUEUE / подтверждённой WAVE.
  C) Чужой claim на те же CONFLICT KEYS — СТОП, одна фраза PO.

Team Room join/inbox если доступен (не блокер).
Параллель только если keys не пересекаются.

════════════════════════════════════════════════════════
ЦИКЛ
════════════════════════════════════════════════════════
CLAIM → код → gates → self-verify → archive+lock → remove _active →
commit+push по docs/GIT-POLICY.md → обновить _NOW → NEXT.

BAN: секреты nginx в git; shell 317 rewrite; почта клиенту вне TZ; «улучшить заодно».

Лимит шагов: commit+push зелёного куска + `_NOW`; resume = этот же промпт.

════════════════════════════════════════════════════════
СТОП
════════════════════════════════════════════════════════
Очередь READY пуста → `_NOW` idle → «готово предложить деплой»
→ НЕ запускай deploy.ps1 без явной команды PO.
```
