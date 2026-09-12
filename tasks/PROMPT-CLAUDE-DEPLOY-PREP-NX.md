# PROMPT — Claude: подготовка NX-деплоя (НЕ деплой)

> После desktop verify. Deploy только по отдельной фразе PO «сделай деплой по документации».

```
Ты executor kppdf-8.0 (agent_id: claude). GEMINI.md + how-to-connect-ai + kppdf-executor-loop.
UNATTENDED. ДЕПЛОЙ / wipe / SSH на prod — ЗАПРЕЩЕНЫ.

Канон: docs/ops/DEPLOY-NX-PROD.md
Stamp: docs/agent-checklists/DEPLOY-READY.md
Evidence: обновить/создать docs/agent-checklists/PRE-DEPLOY-2026-09-12-NX.md

0) main ff-only; status; claim если есть TZ-OPS-DEPLOY-NX-* или работай по канону без product rewrite если cutover уже DONE.
1) Полные gates tip main:
   backend tsc+test+lint; frontend-nx nx build kppdf-web (+ tests по канону);
   architecture:check если в каноне.
2) wipe_default=false (warm). desktop_zip — из DESKTOP-VERIFY audit.
3) Перепиши DEPLOY-READY.md → READY + deploy_sha_target + prepared_at + warm deploy.ps1 без -Wipe.
4) Commit+push. Отчёт: «Deploy-Ready на <sha>. Можно: сделай деплой по документации.»
   STOP. Не запускай deploy.ps1.
```
