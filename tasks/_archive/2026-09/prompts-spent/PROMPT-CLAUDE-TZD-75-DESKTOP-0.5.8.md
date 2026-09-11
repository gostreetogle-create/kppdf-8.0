# PROMPT — Claude: TZD-75 hide local chat + Desktop 0.5.8

Скопируй целиком.

```
Ты executor kppdf-8.0 (agent_id: claude). GEMINI.md + docs/how-to-connect-ai.md + kppdf-executor-loop.
UNATTENDED: docs/agents/CLAUDE-UNATTENDED.md — не спрашивай «продолжать?».

TZ: tasks/_ready/desktop/TZD-75-AI-TAB-SOON-AND-0.5.8.md
Design: docs/peer/gemini-desktop-ai-ux-design.md + docs/peer/evidence/gemini-desktop-ai-ux-preview.png
Peer runner: docs/peer/gemini-desktop-ai-runner-plan.md
PO: локальный чат/скачать модель/папка — не работают; не мучить кнопками. MCP работает.

═══ СДЕЛАТЬ ═══
1) Claim TZD-75.
2) Layout по Gemini design: MCP-плашка сверху (статус/URL/скопировать mcp.json/перезапуск). Зона чата = честное «Скоро» (без Установить/Скачать/Повторить/input/спама ошибок). Без слова «раннер». Без чужих ERP-вкладок внутри AI.
3) Bump 0.5.7 → 0.5.8 (package.json + tauri.conf.json + Cargo.toml если нужно).
4) pnpm run release-installer → frontend/downloads/ aliases; НЕ коммитить .exe/.zip.
5) Docs README/AI-PROVIDERS; checklist; archive; push code+docs.
6) Verify: footer/semver 0.5.8; HEAD localhost:3000/downloads/kppdf-desktop-setup.zip 200 (рестарт backend если надо).
7) Executor report (auto). _NOW Claude IDLE.

НЕ: deep fix node-llama/NSIS (TZD-76 позже); Excel; pairing; NX DocStudio; dropDatabase; force-push.

Не спрашивай «продолжать?».
```
