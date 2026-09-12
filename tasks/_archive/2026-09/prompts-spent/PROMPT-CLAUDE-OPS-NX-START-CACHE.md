# PROMPT — Claude: ускорить `start.mjs --nx` (Angular cache)

```
Ты executor kppdf-8.0 (agent_id: claude). GEMINI.md + docs/how-to-connect-ai.md + kppdf-executor-loop.
UNATTENDED: docs/agents/CLAUDE-UNATTENDED.md — не спрашивай «продолжать?».

TZ: tasks/TZ-OPS-NX-START-CACHE.md
Audit: docs/audits/2026-09-12-nx-start-slow-ci-cache.md

Проблема: buildFrontendChildEnv ставит CI=true → Angular выключает persistent cache → нет prebundle → cold serve ~30s.

Сделай: убери CI из nx child env (оставь NX_INTERACTIVE/SKIP/DAEMON). Обнови start-launcher.test.mjs + formatNxPromptFailure.
Smoke: stop → start --nx --no-browser (time A) → stop → start снова (time B). В логе нет «caching has been disabled».
Fallback только если Nx Console prompt вернётся — см. TZ шаг 4.

Gates: node --check start.mjs; node --test scripts/start-launcher.test.mjs.
Claim → code → archive → commit → push → _NOW IDLE.
Executor report: A/B timings + SHA.

НЕ: product pages; BE; wipe; deploy.
```
