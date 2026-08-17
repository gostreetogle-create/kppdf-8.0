# PROMPT — resume после обрыва сети (одна TZ за чат)

Freebuff упал mid-stream. Правда = git / `_NOW` / `_archive`.  
Вставь блок ниже в **новый** чат. Не продолжай мёртвый stream.

После DONE этой TZ — новый чат + тот же промпт (он сам возьмёт next).

---

```text
Ты — executor kppdf-8.0. Репо: D:\kppdf-8.0 на main.
GEMINI.md + .agents/skills/kppdf-executor-loop/SKILL.md
docs/PO-CANON.md · docs/agent-checklists/_NOW.md · tasks/_backlog/QUEUE.md
Сеть рвётся: ОДНА TZ на этот чат. Mid-commit зелёного куска сразу. Не тащи всю очередь.

git fetch origin && git checkout main && git pull --ff-only
Чужой WIP не стейджить. Deploy/wipe запрещены. _park/** не трогать.

СТАРТ:
1) Если tasks/_active/ в КОРНЕ не пуст — доделай ЭТОТ claim до archive+push.
2) Иначе первый НЕ-DONE:
   D) tasks/_backlog/migrate-kp3/TZ-MIG-302-kp3-mcp-load.md
Skip если _archive/**/<ID>.done.md уже есть.
SKIP: TZD-47 (`d158c112`), TZD-56 (`07593970`), UX-371, 351/352/353, SALES-369, TZD-39.

ЦИКЛ ЭТОЙ TZ:
CLAIM → код по AC → gates из TZ → archive+lock+_NOW → commit+push (GIT-POLICY).
Не начинай следующую TZ в этом чате.
Конец: ID | DONE/BLOCKED | archive | SHA. Одна фраза: «следующий чат = тот же промпт».
MCP down на C/D → BLOCKED, не выдумывай.
```
