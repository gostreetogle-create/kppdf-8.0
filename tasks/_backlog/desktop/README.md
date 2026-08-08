# Desktop backlog (`TZD-*`)

Канон: `docs/superpowers/specs/2026-08-05-desktop-mcp-agent-vision.md`  
Мастер-контекст (архив): `tasks/_archive/2026-08/TZD-00.done.md`  
Код: `desktop/`

## Open / GO

| ID | File | Notes |
|----|------|-------|
| **TZD-21** | `TZD-21-desktop-pairing-keys-ttl.md` | **GO** — pairing keys, TTL, multi-key + revoke. «делай TZD-21». |

## Park

| ID | File | Notes |
|----|------|-------|
| **TZD-18** | `TZD-18-mcp-batch-scale.md` | Batch propose/confirm + chunked inbox |
| **TZD-19** | `TZD-19-mcp-graph-integrity.md` | BOM/where_used + integrity suite |
| **TZD-23** | `TZD-23-ai-import-matching-hitl.md` | PARK после TZD-22 — AI matching + HITL план → propose |

## Done (stubs may linger — see archive)

| ID | Archive |
|----|---------|
| TZD-05 | `tasks/_archive/2026-08/TZD-05.done.md` |
| TZD-11 | `tasks/_archive/2026-08/TZD-11.done.md` |
| TZD-12 | `tasks/_archive/2026-08/TZD-12.done.md` |
| TZD-13 | `tasks/_archive/2026-08/TZD-13.done.md` |
| TZD-14 | `tasks/_archive/2026-08/TZD-14.done.md` |
| TZD-15 | `tasks/_archive/2026-08/TZD-15.done.md` |
| TZD-16 | `tasks/_archive/2026-08/TZD-16.done.md` |
| TZD-17 | `tasks/_archive/2026-08/TZD-17.done.md` |
| TZD-20 | `tasks/_archive/2026-08/TZD-20.done.md` |
| TZD-22 | `tasks/_archive/2026-08/TZD-22.done.md` |

Import stream TZD-01…04, 06…10 — PARKED (не в этой папке как active stubs).

## Rules

- Owner track: desktop/MCP end-to-end.
- Do not start without PO «делай TZD-NN». Never `git add .` with чужой dirty.
- Semantic (17) DONE → scale (18) / graph (19) PARK.
- Hybrid import: **22** (task container) → **23** (match + HITL) → optionally 18 for big batches.
