═══════════════════════════════════════════════════════════════
TZD-28: Doc-constructor MCP — list + create draft template — DONE
═══════════════════════════════════════════════════════════════

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-08
closed_by: buffy-desktop-ex (Freebuff desktop executor, wave #6)
acceptance_status: PASS (all AC + gates green)
verification:
  - desktop/mcp typecheck: PASS
  - desktop/mcp pnpm test: 60/60 PASS (incl. 2 new doc tests)
checklist: docs/agent-checklists/TZD-28.md
lock: .mimocode/locks/TZD-28-doc-constructor-mcp.lock
source: tasks/_backlog/desktop/TZD-28-doc-constructor-mcp.md
wave: tasks/_backlog/desktop/WAVE-DESKTOP-BULK-IMPORT.md (#6)

---

## Summary

- **NEW `desktop/mcp/src/doc-tools.ts`**: `kppdf_doc_types_list`,
  `kppdf_doc_template_categories_list`, `kppdf_doc_templates_list` (GET) +
  `kppdf_doc_template_create_draft` (POST draft: `isActive=false`,
  `isDefault=false`, notes `[AI-DRAFT] …`; никогда set-default/publish).
- Зарегистрированы в `tools.ts` (общий сервер HTTP + stdio).
- **MCP.md doc-draft protocol**: discover gap → create_draft → id в todo
  (TZD-29) → менеджер доводит в `/doc-constructor`.
- AC: list tools ✅; create_draft → id, виден в GET list, isDefault≠true ✅;
  нет вызова set-default (тест-ассерт) ✅; MCP.md protocol ✅.

## Out of scope (successors)

- Визуальный builder / upload backgrounds / Angular redesign — не этот TZ.
- Наполнение блоков конструктора — руками менеджера (TZD-29).

## Protects

Агент не может случайно сделать черновик дефолтным или опубликованным:
draft-флаги жёстко false, инструмента set-default нет.
