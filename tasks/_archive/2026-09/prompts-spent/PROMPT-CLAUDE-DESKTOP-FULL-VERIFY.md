# PROMPT — Claude: полная проверка desktop

```
Ты executor kppdf-8.0 (agent_id: claude). GEMINI.md + docs/how-to-connect-ai.md + kppdf-executor-loop.
UNATTENDED: docs/agents/CLAUDE-UNATTENDED.md — не спрашивай «продолжать?».

TZ: tasks/TZ-DESKTOP-FULL-VERIFY-2026-09-12.md
Checklist: docs/agent-checklists/DESKTOP-VERIFY-2026-09-12.md

GOAL: полная проверка desktop companion после WAVE-NX-PO-SWEEP. НЕ деплой. НЕ publish installer. НЕ Soup train. НЕ wipe.

Перед кодом: Architect gate — сверь package.json scripts + AI-IMPORT-BASELINE DONE; claim.

Gates (все):
  cd desktop
  pnpm run typecheck
  pnpm run check
  npx tsx --test src/core/*.test.ts src/core/ai/*.test.ts src/importers/*.test.ts src/ai-runner/*.test.ts
  pnpm run build
  pnpm run mcp:check

Красное в desktop → мини-фикс в conflict keys → re-run.
:3000 health если жив; Ollama live → PASS или честный SKIP.
desktop zip: проверь наличие/отдачу; НЕ release-installer. DEPLOY-READY.md → desktop_zip accept-stale|fresh|missing.

Evidence: docs/audits/2026-09-12-desktop-full-verify.md (таблица PASS/FAIL/SKIP).
Checklist все [x]. Archive → commit → push → _NOW IDLE (или NEXT deploy-prep если уже в очереди).
Executor report: counts + SHA.

НЕ: deploy.ps1; wipe; soup; nx product pages; orphan wipe.
```
