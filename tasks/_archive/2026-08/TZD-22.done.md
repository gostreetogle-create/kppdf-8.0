═══════════════════════════════════════════════════════════════
TZD-22: AI Import Task — точка сборки (модель + API + Desktop + MCP) — DONE
═══════════════════════════════════════════════════════════════

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-08
closed_by: cursor-composer-tzd22 (Cursor PASS → archive)
acceptance_status: PASS (Cursor PASS 2026-08-08)
verification:
  - backend tsc --noEmit: PASS
  - backend jest import-task: 6/6 PASS
  - desktop/mcp pnpm test: 33/33 PASS
  - desktop/mcp typecheck: PASS
  - desktop typecheck: PASS
checklist: docs/agent-checklists/TZD-22.md
lock: .mimocode/locks/TZD-22-ai-import-task.lock
source: tasks/_backlog/desktop/TZD-22-ai-import-task.md

---

## Summary

- NEW `backend/src/modules/import-task/**` + `ImportTaskModule` in `app.module.ts`
- REST: POST/GET list/GET :id/PATCH status/POST cancel → `ready_for_ai`; **0** journal proposals
- Desktop: «Создать задачу для ИИ» (`createImportTaskFromRows`); expert «Предложить строки» intact
- MCP: `kppdf_import_task_{list,get,create,set_status}` + `backendPatchJson`
- Docs: MCP.md Variant C (`file → ImportTask → TZD-23 → propose → confirm`); FEATURE checklist

## Out of scope (successors)

- **TZD-23** — AI matching + HITL plan → propose (only on PO)
- Web UI «Задачи импорта»; blob upload; >500 rows (TZD-18)

## Protects

Managers/agents get a durable ImportTask assembly point without polluting mutation journal with unmatched create proposals.
