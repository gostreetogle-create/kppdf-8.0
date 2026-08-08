═══════════════════════════════════════════════════════════════
TZD-23: AI Import Task — matching + HITL plan → propose — DONE
═══════════════════════════════════════════════════════════════

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-08
closed_by: buffy-desktop-ex (Freebuff desktop executor, wave #1)
acceptance_status: PASS (all AC + gates green)
verification:
  - backend tsc --noEmit: PASS
  - backend jest import-task: 10/10 PASS (incl. 4 new TZD-23 tests)
  - desktop/mcp pnpm test: 38/38 PASS
  - desktop/mcp typecheck: PASS
checklist: docs/agent-checklists/TZD-23.md
lock: .mimocode/locks/TZD-23-ai-import-matching-hitl.lock
source: tasks/_backlog/desktop/TZD-23-ai-import-matching-hitl.md
wave: tasks/_backlog/desktop/WAVE-DESKTOP-BULK-IMPORT.md (#1)

---

## Summary

- **BE:** `PATCH /api/import-tasks/:id/report` (aiReport + summary + status
  analyzing|awaiting_user) и `PATCH /api/import-tasks/:id/proposals`
  (proposalIds + status applying|done|failed). Whitelist DTO +
  `forbidNonWhitelisted` — rows/source нельзя пропатчить.
- **MCP:** `kppdf_import_task_set_report` (пишет план, 0 journal) +
  `kppdf_import_task_apply_plan` (только `awaiting_user` + `userOk:true`;
  new→propose_create, update→propose_update, skip/doubt→нет; links proposalIds,
  status=applying). Core `applyImportTaskPlan` deps-injected → unit-testable.
- **Docs:** MCP.md Variant C protocol (get → match → set_report → awaiting_user
  → чат «N new / M skip / K update / D doubt» → ok → apply_plan → confirm →
  done; apply без ok запрещён); FEATURE-INTEGRATION-CHECKLIST §E.
- Acceptance: report persists + awaiting_user (rows intact) ✅; set_report
  видно в get ✅; apply_plan без userOk → error 0 proposes ✅; fixture
  2 new + 1 skip + 1 update + 1 doubt → 3 proposes, applying ✅.

## Out of scope (successors)

- Reshape (TZD-26) · batch >500 (TZD-18) · product.* journal (TZD-27) ·
  graph tools (TZD-19) · doc drafts (TZD-28) · manager todos (TZD-29).
- Order / КП import — вне волны.

## Protects

Ни одна строка плана не попадает в SoT без двойного HITL: план пишется в
ImportTask (0 journal), propose создаётся только после явного ok человека,
а запись в SoT — только через confirm журнала.
