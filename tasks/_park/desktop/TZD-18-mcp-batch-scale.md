═══════════════════════════════════════════════════════════════
TZD-18: MCP batch propose/confirm + scaled inbox (PARK — после TZD-17)
═══════════════════════════════════════════════════════════════

STATUS: PARK · DEPENDS ON: TZD-17 DONE; **практически после TZD-23** (план HITL → batch apply)

РОЛЬ: Desktop/MCP + возможно Backend mutation-journal batch endpoints.

Кратко (развернуть в полный TZ после TZD-23):
- `kppdf_propose_material_batch` / `kppdf_confirm_batch` / `kppdf_cancel_batch`
- `kppdf_inbox_propose_file` / apply_plan: chunking (limit/offset), progress, idempotency key
- Цель: 1k–10k rows без N× round-trip и без partial SoT; поднять cap ImportTask >500 где безопасно
- НЕ: BOM/graph (TZD-19); НЕ silent SoT write; НЕ multi-entity (TZD-27)

CONFLICT KEYS (ожидаемые): desktop/mcp/src/write-tools.ts; inbox-tools.ts;
  import-task-tools.ts; backend mutation-journal (если batch API).

См. audit: docs/audits/2026-08-08-desktop-bulk-import-vision-audit.md
