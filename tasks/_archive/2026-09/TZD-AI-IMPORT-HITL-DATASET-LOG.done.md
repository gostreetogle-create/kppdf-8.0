# TZD-AI-IMPORT-HITL-DATASET-LOG: opt-in JSONL для будущего Soup

**РОЛЬ АГЕНТА:** Executor Desktop — claude  
**ЗАВИСИМОСТИ:** `TZD-AI-IMPORT-GENERAL-BASELINE` DONE  
**LAYER:** 3 · **SIZE:** M  
**PAGE_DOCS:** `desktop/docs/AI-PROVIDERS.md`

**CONFLICT KEYS:**  
`desktop/src/core/inbox.ts` ;  
`desktop/src/App.svelte` (confirm / settings — минимально) ;  
`desktop/src/core/ai/dataset-log.ts` (create) ;  
`desktop/docs/AI-PROVIDERS.md` ;  
`docs/audits/2026-09-11-soup-sft-import-decision.md` ;  
`docs/agent-checklists/WAVE-DESKTOP-AI-IMPORT-BASELINE.md` ;  
`docs/agent-checklists/_NOW.md`

IMPLICIT: prefer **local app-data JSONL only** — do **not** add raw Excel to Mongo mutation_journal unless PO later asks.

## ЧТО ДЕЛАТЬ

1. Setting default **OFF**: «Сохранять пары для обучения (только этот ПК)».
2. On successful HITL confirm: append one JSONL line locally:
   `{ "schemaId"|"kind", "rawRows", "confirmedPayload", "ts", "source":"hitl-confirm" }`.
3. Redact: truncate long strings; no cloud upload; no HuggingFace.
4. Optional read-only script: export done `import_task` rows (`raw`+proposed) into same JSONL shape.
5. Docs: file path + how Soup would consume later; note reopen gate ≥300 lines.
6. WAVE row 02.

## НЕ

- soup train; enable log by default; weaken privacy banner

## AC

1. OFF → no growth. ON → ≥1 line after confirm.
2. Gates PASS.

---

**ARCHIVE_MARKER:** DONE 2026-09-12T00:00:00Z — see docs/agent-checklists/TZD-AI-IMPORT-HITL-DATASET-LOG.md for SHA
