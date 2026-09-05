# PROMPT — Claude: Order org-scope TX (reserve/ship/cancel/remove)

```
═══ START ═══

Executor · D:\kppdf-8.0 · main · agent_id: claude

Прочитай: GEMINI.md · CLAUDE.md · .agents/skills/kppdf-executor-loop/SKILL.md · docs/PO-CANON.md · docs/PO-SHARED-UNDERSTANDING.md

Одна TZ:
  tasks/_ready/TZ-BACKEND-ORDER-ORG-SCOPE-TX.md

После HARDEN остались unscoped: reserveStock / ship / cancel / remove.
Reuse assertOrgAccess внутри session до side-effects. FE не трогать.

CLAIM → код → gates (backend tsc/test/lint) → archive → commit/push → _NOW → STOP.

═══ END ═══
```
