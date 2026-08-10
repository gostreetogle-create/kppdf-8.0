# PROMPT — WAVE Excel Import Studio (Gemini / local)

Скопируй агенту целиком.

---

CLAIM первым (до кода):
1) Get-Location + git rev-parse → D:\kppdf-8.0 (canonical main, не .freebuff)
2) tasks/_active/<TASK-ID>.md + checklist по docs/agent-checklists/_TEMPLATE.md
3) Status CLAIMED; Claim slot: agent_id + claimed_at (ISO) + workspace
4) _active-map + чужие _active keys → конфликт = STOP
5) Team Room claim best-effort

Сначала прочитай:
- docs/AI-AGENT-GUIDE.md
- docs/audits/2026-08-10-desktop-excel-import-studio-audit.md
- tasks/_backlog/desktop/WAVE-EXCEL-IMPORT-STUDIO.md
- GEMINI.md + .agents/skills/kppdf-executor-continuous/SKILL.md

Очередь (строго, без стопов «ок/поехали»):

1. **TZD-36** `tasks/TZD-36-desktop-import-studio-shell.md`  
   Вкладки «Импорт Excel» | «MCP»; большая студия drop+таблица; pairing в MCP-вкладке.
2. **TZD-37** `tasks/TZD-37-excel-validation-hitl-studio.md`  
   Валидация дублей/коллизий/ошибок; multi-sheet; Отправить через propose/confirm; кнопка «Проверить через ИИ» если MCP up.
3. **TZD-38** `tasks/TZD-38-spec-bom-composition-import.md`  
   Иерархия спецификации → product/module + composition HITL (закрывает TZD-35 PARK).

На каждый TZ: code → gates из AC → checklist `## Executor report (auto)` → archive → commit/push → next.

BAN:
- deploy.ps1 / desktop ZIP publish без команды PO
- WAVE-DICT-DEMO / WAVE-KP-COMPLETE / SALES-340+ (не трогать)
- Параллель с WAVE-MCP-GAP на `desktop/mcp/src/tools.ts` (если GAP активен — STOP и спроси)
- `desktop/mcp-runtime/**`
- Вторая БД; silent SoT write; заказы/КП bulk; EAV

Пустая очередь → «готово предложить деплой» (web) / «готово предложить desktop publish» отдельно. Deploy NO.
