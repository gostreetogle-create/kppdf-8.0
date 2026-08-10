═══════════════════════════════════════════════════════════════
TZD-26: Inbox columns — ready / unfit + AI reshape
═══════════════════════════════════════════════════════════════

STATUS: READY
WAVE: WAVE-DESKTOP-BULK-IMPORT.md (#2)
DEPENDS ON: TZD-23 DONE
LAYER: 2
CHECKLIST: docs/agent-checklists/TZD-26.md
AUDIT: docs/audits/2026-08-08-desktop-bulk-import-vision-audit.md

РОЛЬ: Desktop/MCP + BE import-task (patch rows / columnMap).

CONFLICT KEYS:
desktop/src/core/inbox.ts;
desktop/mcp/src/inbox-tools.ts;
desktop/mcp/src/domain-tools.ts;
desktop/mcp/src/import-task-tools.ts;
backend/src/modules/import-task/**;
desktop/docs/MCP.md;

Проверено: inbox.ts NAME_COLUMNS aliases; ImportTaskRow без columnMap;
domain validate material; TZD-23 apply_plan path.

---

## ИСХОДНОЕ

Parse кладёт raw + слабый alias map. Нет явного ready/unfit. Нет безопасного
patch rows после AI reshape.

---

## ЧТО ДЕЛАТЬ

### 1. Классификация колонок

- Вычислить из headers: `canonical | unknown | conflict`.
- Canonical set (material Wave-1): name, unit, article, sku, notes (+ category если уже мапится).
- MCP `kppdf_inbox_classify_columns` (path или fileName+headers+sample):  
  `{ ready: string[], unfit: string[], mapping: Record<string,string|null>, sampleRows }`.

### 2. Reshape → ImportTask

- `PATCH /api/import-tasks/:id/rows` — только если status in
  `ready_for_ai|analyzing|awaiting_user` (не applying/done).  
  Body: `{ rows: ImportTaskRow[], columnMap?: object, reshapeNote?: string }`.
- MCP `kppdf_import_task_reshape`: пишет rows + optional note в summary/aiReport.reshape;
  **0** journal. После reshape агент обязан re-audit / re-match (TZD-23 set_report).

### 3. Protocol в MCP.md

unfit → агент deformирует **смысл сохранить** → reshape → classify again →
TZD-23 matching. Запрет: invent EAV fields / новые колонки схемы.

### 4. НЕ

Orders/КП; silent SoT; менять journal kinds; Angular.

---

## AC

1. classify: «Наименование»→name ready; мусорная колонка → unfit.  
2. reshape обновляет rows; get показывает новые name/unit.  
3. reshape не создаёт journal proposals.  
4. MCP.md секция Column ready/reshape.  
5. Gates: backend import-task tests + desktop/mcp test + tsc.

known_limitation: только material canonical fields; product columns → после TZD-27.
