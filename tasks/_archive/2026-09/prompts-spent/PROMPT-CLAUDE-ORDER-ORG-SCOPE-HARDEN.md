# PROMPT — Claude: Order org-scope harden

Скопируй блок ниже агенту **Claude Code**.

```
═══ START ═══

Executor · D:\kppdf-8.0 · main · agent_id: claude

Прочитай: GEMINI.md · CLAUDE.md · .agents/skills/kppdf-executor-loop/SKILL.md · docs/PO-CANON.md

Одна TZ (не continuous queue после неё):
  tasks/_ready/TZ-BACKEND-ORDER-ORG-SCOPE-HARDEN.md

Контекст: docs/audits/2026-09-05-gantt-nx-l0-peer-review.md (P0 blast radius).
Estimate-days/start УЖЕ пофикшены в ff5cbad3 — не ломай, reuse assertOrgAccess.

═══ СДЕЛАТЬ ═══

1. Claim → tasks/_active/ + Claim slot (agent_id: claude)
2. Harden: update / setItemStatus / patchLineBoardLane / patchModuleLane
   — @CurrentUser organizationId → service → assertOrgAccess ДО mutation/save
3. Регрессии cross-org + same-org в order.service.spec.ts
4. Gates: cd backend && pnpm exec tsc -p tsconfig.build.json --noEmit && pnpm test && pnpm lint
5. Archive → tasks/_archive/2026-09/TZ-BACKEND-ORDER-ORG-SCOPE-HARDEN.done.md
6. Commit/push по GIT-POLICY
7. Обнови _NOW: Claude HARDEN DONE

═══ ЗАПРЕТЫ ═══

- frontend / frontend-nx (Freebuff на polish P1–P6 — не пересекайся)
- Не меняй семантику assertOrgAccess (no-org allow) без стопа
- Не deploy / wipe
- После archive — STOP. Не бери Freebuff TZ.

═══ END ═══
```
