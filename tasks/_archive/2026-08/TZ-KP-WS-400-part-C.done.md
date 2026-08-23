# TZ-KP-WS-400 — DONE (часть C)

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-23
closed_by: freebuff-2
scope: часть C — MCP gaps, embedded settings scope, multi-supplier flows, parity test plan

## DoD — часть C

| Пункт | Артефакт | Proof | Gates |
|-------|----------|-------|-------|
| MCP readiness audit | `docs/audits/2026-08-23-kp-workspace-mcp-supplier-audit.md` | 15 tools + 5 gaps + Wave 406 recommendation | docs-only |
| Embedded settings scope | тот же документ §2 | 4 inline candidates + 2 must-stay-navigate | docs-only |
| Multi-supplier flows | тот же документ §3 | 3 gaps + 4 fixes (TZ-407) | docs-only |
| Parity test plan | тот же документ §4 | 7 groups ≥26 tests + 10 smoke + data-test map | docs-only |

## Что сделано (часть C)

1. **CLAIM** части C (agent_id freebuff-2) обновлён в `tasks/_active/TZ-KP-WS-400.md`.
2. Создан `docs/audits/2026-08-23-kp-workspace-mcp-supplier-audit.md` (~175 строк):
   - §1 MCP: 15 tools inventory (doc-constructor, text-block, commercial, catalog);
     5 gaps (sourceFileRef, file→blocks parser, import-todo href, MCP↔FE channel, non-MCP upload);
     Wave 406 minimal viable bridge.
   - §2 Embedded settings: 4 inline candidates (template picker, text block library,
     table preset picker, page/background settings) + 2 must-stay-navigate
     (full builder canvas, complex table editor) с rationale.
   - §3 Multi-supplier: 3 as-is gaps + 4 Wave 407 fixes (org change hint,
     copy for other firm, family attach from workspace, template org filter).
   - §4 Parity test plan: 7 Jest groups ≥26 tests, 10 KP-E2E-SMOKE rows,
     data-test attribute mapping (old create → new workspace),
     feature flag rollback `KP_WORKSPACE_LEGACY`.
3. Checklist: `docs/agent-checklists/TZ-KP-WS-400-part-C.md`.
4. Не тронуты: `rail-ia.md` (часть B), `implementation-audit.md` (часть A),
   `frontend/**`, `backend/**`, frozen spec.

## SHA

| Коммит | Файлы |
|--------|-------|
| (pending) | `docs/audits/2026-08-23-kp-workspace-mcp-supplier-audit.md`, `docs/agent-checklists/TZ-KP-WS-400-part-C.md`, `tasks/_active/TZ-KP-WS-400.md` (CLAIM update) |

## known_limitation

- PDF/image layout parsing — out of scope (общая для TZ-400).
- Части A/B (parity matrix, state ownership map, rail IA, icon dedup) — отдельные CLAIM, не здесь.