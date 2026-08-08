═══════════════════════════════════════════════════════════════
TZD-26: Inbox columns — ready / unfit + AI reshape — DONE
═══════════════════════════════════════════════════════════════

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-08
closed_by: buffy-desktop-ex (Freebuff desktop executor, wave #2)
acceptance_status: PASS (all AC + gates green)
verification:
  - backend tsc --noEmit: PASS
  - backend jest import-task: 12/12 PASS (incl. 2 new TZD-26 tests)
  - desktop/mcp pnpm test: 44/44 PASS
  - desktop/mcp typecheck: PASS
checklist: docs/agent-checklists/TZD-26.md
lock: .mimocode/locks/TZD-26-column-ready-reshape.lock
source: tasks/_backlog/desktop/TZD-26-column-ready-reshape.md
wave: tasks/_backlog/desktop/WAVE-DESKTOP-BULK-IMPORT.md (#2)

---

## Summary

- **Classify:** `classifyColumns(headers)` в `desktop/mcp/src/inbox.ts` —
  exact/substring матч против канона материала (name/unit/article/sku/notes/
  categoryId) → `{ ready, unfit, mapping, conflicts }`; `reshapeRowByMap`.
  MCP tool `kppdf_inbox_classify_columns` (fileName ИЛИ headers+sample) — 0 journal.
- **Reshape:** BE `PATCH /api/import-tasks/:id/rows` (только
  draft|ready_for_ai|analyzing|awaiting_user; rows 1..500 + columnMap +
  reshapeNote; **сброс aiReport** → re-match обязателен). MCP
  `kppdf_import_task_reshape` — 0 journal.
- **Docs:** MCP.md «Column ready / unfit + AI reshape» protocol (unfit →
  деформация с сохранением смысла → reshape → classify → TZD-23 match;
  запрет EAV-полей); FEATURE checklist §E.
- Acceptance: classify «Наименование»→name ready / мусор→unfit ✅; reshape
  обновляет rows, get показывает новые name/unit ✅; reshape 0 proposals ✅.

## Out of scope (successors)

- Batch (TZD-18) · graph (TZD-19) · product.* (TZD-27) · docs/todos (TZD-28/29).
- Order / КП import — вне волны.

## Protects

Reshape безопасен по статусам (нельзя ломать уже applying/done) и по смыслу
(columnMap + reshapeNote фиксируют деформацию); сброс aiReport делает
невозможным apply старого плана после изменения строк.
