# SESSION WAVE — Desktop bulk import (PO vision)

> Источник: `docs/audits/2026-08-08-desktop-bulk-import-vision-audit.md`  
> Старт исполнения: **после** DETAIL/FACT wave и по явной команде PO (`делай TZD-23` …).  
> Не брать параллельно с Angular DETAIL-301… без проверки CONFLICT KEYS (обычно disjoint).

## Порядок

| # | ID | File | Status |
|---|-----|------|--------|
| 1 | **TZD-23** | `tasks/_park/desktop/TZD-23-ai-import-matching-hitl.md` | PARK → unpark first |
| 2 | **TZD-26** | `TZD-26-column-ready-reshape.md` | PARK |
| 3 | **TZD-18** | `TZD-18-mcp-batch-scale.md` | PARK |
| 4 | **TZD-19** | `TZD-19-mcp-graph-integrity.md` | PARK (перед/с 27) |
| 5 | **TZD-27** | `TZD-27-journal-product-writes.md` | PARK |
| 6 | **TZD-28** | `TZD-28-doc-constructor-mcp.md` | PARK |
| 7 | **TZD-29** | `TZD-29-manager-import-todos.md` | PARK |

## Defer

- Order / КП (commercial proposal) bulk import  
- PDF importer (legacy TZD-04)  
- In-app Ollama pipeline (TZD-01/02) — после 23, не вместо  

## Docs hygiene (Cursor, без кода)

- [x] `tasks/_park/desktop/README.md` — убрать DONE из Open  
- [x] `desktop/README.md` — структура не «стабы»  
- [x] Audit written 2026-08-08  
- [x] Vision §5 pointer + QUEUE item 3

## PO one-liner

«Сделай TZD-23» — matching + HITL; остальное не трогать, пока не скажу.
