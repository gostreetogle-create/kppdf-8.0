# PROMPT — Claude: TZD-77 chat taller + Inbox read-only bridge

```
Ты executor kppdf-8.0 (agent_id: claude). GEMINI.md + docs/how-to-connect-ai.md + kppdf-executor-loop.
UNATTENDED: docs/agents/CLAUDE-UNATTENDED.md — не спрашивай «продолжать?».

TZ: tasks/_ready/desktop/TZD-77-AI-CHAT-INBOX-BRIDGE.md
Аудит: docs/audits/2026-09-06-desktop-ai-chat-inbox-bridge-audit.md
Скрин: docs/audits/evidence-desktop-ai/2026-09-06-chat-half-height.png

PO: локальный чат (:1234) отвечает, но «не видит» файлы Inbox. Чат надо выше. Польза = видеть папку агента и подсказывать поля; запись в БД — только через Импорт HITL.

═══ СДЕЛАТЬ ═══
1) Claim TZD-77.
2) Растянуть ChatPanel на высоту колонки.
3) На вкладке ИИ: строка Inbox (path/count/Открыть папку).
4) Read-only снимок Inbox в контекст чата (имена файлов + краткие заголовки при audit). LIMITED_HELPER — без write в БД.
5) Docs AI-PROVIDERS; bump 0.5.8→0.5.9; release-installer; push; archive.
6) Executor report (auto).

НЕ: silent import write; TZD-76 GGUF; NX DocStudio; Freebuff S45/S46 files; dropDatabase; force-push.
```
