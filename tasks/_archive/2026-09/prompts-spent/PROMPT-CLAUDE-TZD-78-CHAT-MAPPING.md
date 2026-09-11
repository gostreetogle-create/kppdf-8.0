# PROMPT — Claude: TZD-78 chat HITL mapping

```
Ты executor kppdf-8.0 (agent_id: claude). GEMINI.md + docs/how-to-connect-ai.md + kppdf-executor-loop.
UNATTENDED: docs/agents/CLAUDE-UNATTENDED.md — не спрашивай «продолжать?».

TZ: tasks/_ready/desktop/TZD-78-CHAT-HITL-MAPPING.md
Аудит контекст: docs/audits/2026-09-06-desktop-ai-chat-inbox-bridge-audit.md
Зависимость: TZD-77 DONE (135a9407). Supply OPS DONE — NX/supply не трогать.

PO: чат видит Inbox (TZD-77); нужно предложить сопоставление колонок и открыть Импорт для HITL-записи. LIMITED_HELPER — без silent write в API.

═══ СДЕЛАТЬ ═══
1) Claim TZD-78.
2) Из чата: выбрать/указать файл Inbox → audit headers → suggest mapping (reuse helpers).
3) Показать краткую карту колонок + CTA «Открыть в Импорте» (вкладка Импорт, файл/draft mapping) — запись только после HITL «Записать».
4) Docs AI-PROVIDERS; bump 0.5.9→0.5.10; release-installer; binaries не коммитить.
5) Gates desktop; archive; push; _NOW Claude IDLE; Executor report (auto).

НЕ: TZD-76 GGUF NSIS; Supply OPS rewrite; Photos; dropDatabase; паузы; чужой WIP.
```
