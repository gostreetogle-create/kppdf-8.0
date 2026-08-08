═══════════════════════════════════════════════════════════════
TZD-18: MCP batch propose/confirm + scaled ImportTask — DONE
═══════════════════════════════════════════════════════════════

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-08
closed_by: buffy-desktop-ex (Freebuff desktop executor, wave #3)
acceptance_status: PASS (all AC + gates green)
verification:
  - backend tsc --noEmit: PASS
  - backend jest mutation-journal + import-task: 22/22 PASS (incl. batch tests)
  - desktop/mcp pnpm test: 47/47 PASS
  - desktop/mcp typecheck: PASS
checklist: docs/agent-checklists/TZD-18.md
lock: .mimocode/locks/TZD-18-mcp-batch-scale.lock
source: tasks/_backlog/desktop/TZD-18-mcp-batch-scale.md
wave: tasks/_backlog/desktop/WAVE-DESKTOP-BULK-IMPORT.md (#3)

---

## Summary

- **BE journal batch:** `POST /api/mutation-journal/propose-batch`
  (items 1..500; all-or-nothing best-effort — при ошибке созданные
  proposals откатываются; опц. `idempotencyKey` с dedup по предложенным),
  `confirm-batch`, `cancel-batch` (по-одному, ошибки собираются).
- **MCP:** `kppdf_propose_material_batch` / `kppdf_confirm_batch` /
  `kppdf_cancel_batch`; `apply_plan` переведён на propose-batch чанками по
  **100** (120-row план → 2 вызова); ошибка чанка → ничего не линкуется.
- **ImportTask cap 500 → 2000** (BE service/DTO, MCP create/reshape,
  desktop app). `inbox_propose_file` — опц. `limit`/`offset`.
- AC: batch 50 → 50 ids, 0 SoT до confirm ✅; confirm-batch создаёт
  материалы / cancel-batch не пишет SoT ✅; 120-row plan → ≤3 batch calls ✅;
  create 600 rows → success ✅.

## Out of scope (successors)

- BOM/where_used (TZD-19) · product.* journal kinds (TZD-27) ·
  doc drafts (TZD-28) · manager todos (TZD-29).
- Тот же batch API примет product kinds после TZD-27 без redesign.

## Protects

Опт не умирает на N× round-trip: один propose-batch вместо сотни HTTP;
все-or-nothing спасает от partial-мусора; idempotencyKey — безопасные
retry; confirm остаётся единственным шагом записи в SoT.
