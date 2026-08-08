# Desktop backlog (`TZD-*`)

Канон: `docs/superpowers/specs/2026-08-05-desktop-mcp-agent-vision.md`  
Аудит PO-vision (bulk Excel→ERP): `docs/audits/2026-08-08-desktop-bulk-import-vision-audit.md`  
Wave: `docs/agent-checklists/SESSION-WAVE-2026-08-08-desktop-bulk-import.md`  
Мастер-контекст: `tasks/_archive/2026-08/TZD-00.done.md`  
Код: `desktop/`

## Park (исполнять по PO «делай TZD-NN», порядок wave)

| ID | File | Notes |
|----|------|-------|
| **TZD-23** | `TZD-23-ai-import-matching-hitl.md` | **P0** — matching + HITL → propose (полный TZ) |
| **TZD-26** | `TZD-26-column-ready-reshape.md` | ready/unfit columns + reshape |
| **TZD-18** | `TZD-18-mcp-batch-scale.md` | Batch propose/confirm + chunked inbox |
| **TZD-19** | `TZD-19-mcp-graph-integrity.md` | BOM/where_used перед product mass-write |
| **TZD-27** | `TZD-27-journal-product-writes.md` | journal `product.*` |
| **TZD-28** | `TZD-28-doc-constructor-mcp.md` | doc-constructor MCP draft |
| **TZD-29** | `TZD-29-manager-import-todos.md` | todos менеджеру на доделку |

## Done (see archive)

| ID | Archive |
|----|---------|
| TZD-05 | `tasks/_archive/2026-08/TZD-05.done.md` |
| TZD-11…17 | `TZD-11`…`TZD-17.done.md` |
| TZD-20 | `TZD-20.done.md` |
| TZD-21 | `TZD-21.done.md` |
| TZD-22 | `TZD-22.done.md` |
| TZD-24 | `TZD-24.done.md` |

Import stream TZD-01…04, 06…10 — PARKED (in-app AI; не блокер, если Cursor/LM Studio в MCP).

## Rules

- Owner track: desktop/MCP end-to-end (Cursor architecture + local executor code).
- Do not start without PO «делай TZD-NN». Never `git add .` with чужой dirty.
- Hybrid import: **22 DONE** → **23** (match + HITL) → **26** reshape → **18** batch → **27** products → **28/29** docs/todos.
- Orders / КП bulk — **defer** until catalog HITL works.
- SoT = Nest/Mongo; ImportTask = очередь, не вторая база.
