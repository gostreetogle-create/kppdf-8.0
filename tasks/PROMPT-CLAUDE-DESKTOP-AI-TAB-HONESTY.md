# PROMPT — Claude: archive Desktop installer + next TZD-74 AI tab honesty

Скопируй целиком в Claude (после того как PO сказал PASS по скачиванию/парингу — уже Connected admin v0.5.7).

```
Ты executor kppdf-8.0 (agent_id: claude). GEMINI.md + docs/how-to-connect-ai.md + kppdf-executor-loop.
UNATTENDED: docs/agents/CLAUDE-UNATTENDED.md — не спрашивай «продолжать?».

═══ ЭТАП A — closeout installer ═══
PO GUI: Connected admin, v0.5.7 на скрине «ИИ» — download/pairing PASS.
1) Checklist TZ-OPS-DESKTOP-INSTALLER-LOCAL: отметь GUI smoke PASS (download+pair+version).
2) Archive tasks/_archive/2026-09/TZ-OPS-DESKTOP-INSTALLER-LOCAL.done.md + lock; удали _active.
3) Push commit 7cfbde42 (или новый closeout commit) по GIT-POLICY.
4) _NOW / STREAM-QUEUE: Claude installer DONE.

═══ ЭТАП B — TZD-74 ═══
TZ: tasks/_ready/desktop/TZD-74-AI-TAB-HONESTY.md
Аудит: docs/audits/2026-09-06-desktop-ai-tab-honesty-audit.md

Claim → honesty UI вкладки «ИИ»: MCP главный; убрать спам ошибок; «раннер»→человеческий термин; локальный чат = одно честное состояние.
Не чинить llama end-to-end в этом TZ. Не ломать MCP/Excel/pairing.

Gates: focused desktop tests + smoke MCP. Archive TZD-74. Executor report (auto).

НЕ: NX warehouse/DocStudio; dropDatabase; commit .exe.
```
