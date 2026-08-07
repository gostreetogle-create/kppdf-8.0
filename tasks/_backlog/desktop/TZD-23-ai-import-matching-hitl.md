═══════════════════════════════════════════════════════════════
TZD-23: AI Import Task — matching + HITL plan → propose (PARK)
═══════════════════════════════════════════════════════════════

STATUS: PARK · DEPENDS ON: **TZD-22 DONE**

РОЛЬ: Desktop/MCP (+ тонкий backend patch `aiReport` / proposalIds) · агент как
оператор-аналитик.

Кратко (развернуть в полный TZ после TZD-22):

1. Агент: `import_task_get` → для строк `list_materials` / `validate` /
   (опц.) find_similar → классификация: **new | skip | update | doubt**.
2. Заполнить `aiReport` + `summary`; status → `awaiting_user`.
3. Чат HITL: отчёт «N новых / M skip / K update? / D сомнений» → ждать ok /
   правки / cancel.
4. После ok: `propose_material_create` / `propose_material_update` **по плану**;
   записать `proposalIds`; status `applying` → после confirm’ов `done`.
5. **НЕ** propose до ok пользователя; **НЕ** молчаливый SoT write.

CONFLICT KEYS (ожидаемые):
backend/src/modules/import-task/**;
desktop/mcp/src/import-task-tools.ts;
desktop/mcp/src/write-tools.ts;
desktop/docs/MCP.md;

Связь: TZD-17 validate — вход matching; TZD-18 batch — когда план большой.
