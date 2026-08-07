═══════════════════════════════════════════════════════════════
TZD-18: MCP batch propose/confirm + scaled inbox (PARK — после TZD-17)
═══════════════════════════════════════════════════════════════

STATUS: PARK · DEPENDS ON: TZD-17 DONE

РОЛЬ: Desktop/MCP + возможно Backend mutation-journal batch endpoints.

Кратко (развернуть в полный TZ после TZD-17):
- `kppdf_propose_material_batch` / `kppdf_confirm_batch` / `kppdf_cancel_batch`
- `kppdf_inbox_propose_file`: chunking (limit/offset), progress, idempotency key
- Цель: 1k–10k rows без N× round-trip и без partial SoT
- НЕ: BOM/graph (TZD-19); НЕ silent SoT write

CONFLICT KEYS (ожидаемые): desktop/mcp/src/write-tools.ts; inbox-tools.ts;
  backend mutation-journal (если batch API).
