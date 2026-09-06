# PROMPT — Claude: собрать Desktop ZIP и починить скачивание с NX

Скопируй целиком в Claude Code CLI (terminal). Долгая сборка Tauri — не останавливайся mid-build.

```
Ты executor kppdf-8.0 (agent_id: claude). GEMINI.md + docs/how-to-connect-ai.md + .agents/skills/kppdf-executor-loop/SKILL.md.
UNATTENDED: docs/agents/CLAUDE-UNATTENDED.md — PO AFK, не спрашивай «продолжать?».

═══ ЗАДАЧА ═══
TZ: tasks/_ready/desktop/TZ-OPS-DESKTOP-INSTALLER-LOCAL.md
Аудит: docs/audits/2026-09-06-nx-desktop-download-404-audit.md

Факт: NX pairing → GET /downloads/kppdf-desktop-setup.zip = Nest 404.
Причина: нет файла в frontend/downloads/ (только README), NSIS не собран.
Код NX/proxy OK — нужен release-installer, не патч pairing UI.

═══ CLAIM ═══
git status; conflict keys vs tasks/_active/* — пересечение STOP.
Claim: скопируй TZ в tasks/_active/, checklist docs/agent-checklists/TZ-OPS-DESKTOP-INSTALLER-LOCAL.md (agent_id: claude, claimed_at ISO).
_NOW: Claude = этот TZ. Freebuff параллельно → DOCSTUDIO-CHROME-IA (studio/**) — НЕ трогай studio/app-shell warehouse orphan.

═══ СДЕЛАТЬ ═══
1) cd desktop && pnpm install (если нужно)
2) pnpm run release-installer
3) Проверь frontend/downloads/kppdf-desktop-setup.zip (+ versioned)
4) curl -I http://127.0.0.1:3000/downloads/kppdf-desktop-setup.zip → 200 (иначе рестарт backend)
5) curl -I http://127.0.0.1:4201/downloads/kppdf-desktop-setup.zip → 200
6) Smoke: скачать с NX диалога; установить Desktop; краткий старт; pairing к local API
7) Checklist + audit PASS; бинарники НЕ в git; commit только docs если правил; archive; _NOW Claude IDLE
8) Executor report (auto) с semver, size, HEAD status

ЗАПРЕЩЕНО: KPPDF_PUBLISH_ALLOW_STALE без свежего NSIS; commit .exe/.zip; правки app-shell/warehouse/orphan scripts чужой волны; production wipe.
```
