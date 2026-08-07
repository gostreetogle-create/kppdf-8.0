═══════════════════════════════════════════════════════════════
TZD-17: MCP semantic domain layer (schema + validate + inbox audit) — DONE
═══════════════════════════════════════════════════════════════

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-08
closed_by: cursor-composer-tzd17 (Cursor PASS → archive)
acceptance_status: PASS (Cursor PASS 2026-08-08)
verification:
  - kppdf_get_domain_schema kinds + required name + version tzd-17: PASS
  - kppdf_list_categories material id/name/skuPrefix|null: PASS
  - kppdf_validate_material empty name → ok:false; no proposal POST: PASS
  - kppdf_validate_material bad/inactive category → error: PASS
  - kppdf_inbox_audit_file + propose mode=validate → 0 proposals: PASS
  - default kppdf_inbox_propose_file still propose-only / SoT-safe: PASS
  - MCP.md + FEATURE-INTEGRATION-CHECKLIST §E: PASS
  - desktop/mcp pnpm typecheck: PASS
  - desktop/mcp pnpm test 31/31: PASS
checklist: docs/agent-checklists/TZD-17.md
lock: .mimocode/locks/TZD-17-mcp-semantic-domain-layer.lock
source: tasks/_backlog/desktop/TZD-17-mcp-semantic-domain-layer.md

---

## Summary

- `domain-schema.ts` — MATERIAL_KINDS sync, version `tzd-17`, RU/EN rules
- `validate-material.ts` — dry-run (name/category/kind/skuPrefix/duplicate); GET-only deps
- `domain-tools.ts` — `kppdf_get_domain_schema`, `kppdf_list_categories`, `kppdf_validate_material`
- `inbox-tools.ts` — `kppdf_inbox_audit_file` + `kppdf_inbox_propose_file` mode=propose|validate
- `tools.ts` — registerDomainTools
- Docs: MCP.md, FEATURE §E

## Out of scope (successors)

- TZD-18 batch scale — PARK until PO
- TZD-19 graph integrity — PARK until PO
- inbox.ts encoding WIP not staged (audit does not require it)

## Protects

MCP agents get domain discovery + dry-run before propose; SoT remains propose→confirm only.
