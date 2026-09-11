# TZD-AI-IMPORT-GENERAL-BASELINE: general.md + normalizeStep (prompt-only)

**РОЛЬ АГЕНТА:** Executor Desktop — claude  
**ЗАВИСИМОСТИ:** нет (TZD-76 **не** блокер — Ollama или remote `chatCompletion`)  
**LAYER:** 3 · **SIZE:** L  
**PAGE_DOCS:** `desktop/docs/AI-PROVIDERS.md`

**CONFLICT KEYS:**  
`desktop/ai/system-prompts/general.md` ;  
`desktop/src/core/ai/prompts.ts` ;  
`desktop/src/core/pipeline.ts` ;  
`desktop/src/core/ai/client.ts` (read) ;  
`desktop/src/core/ai/normalize-*.ts` (create fixtures/eval as needed) ;  
`desktop/src/core/ai/**/*.test.ts` ;  
`desktop/docs/AI-PROVIDERS.md` ;  
`docs/audits/2026-09-11-soup-sft-import-decision.md` ;  
`docs/audits/2026-09-11-prompt-cannon-002-desktop-ai.md` ;  
`docs/agent-checklists/WAVE-DESKTOP-AI-IMPORT-BASELINE.md` ;  
`docs/agent-checklists/_NOW.md`

### Preflight Check Output
- **Context read:** general.md DRAFT; prompts.ts TODO; pipeline.normalizeStep stub; cannon 002 → TOP-1=a
- **Key Constraints:** no SoT write; 152-FZ local preferred; TZD-76 not required
- **Planned Deliverable:** wired prompt + normalizeStep + eval report
- **Validation Path:** desktop tsc + node:test; WAVE row 01

## ЧТО ДЕЛАТЬ

1. Load `general.md` into `buildSystemPrompt(entitySchema)` (same pattern as desktop-chat.md); remove TODO.
2. Implement `normalizeStep(rows, schemaId)`: schema from IMPORT_TARGETS and/or registry data-sources; `chatCompletion`; parse JSON (+ 1 retry); return `NormalizedRow[]` + meta `_questions/_errors/_skipped`.
3. No DB writes from normalize.
4. Eval harness (node:test): **≥50** synthetic fixtures (RU dates, INN, money, enum miss → null+_questions). Metrics: `parse_ok%`, `required_field_fill%`, `invented_field_rate` (~0). Write appendix into WAVE checklist or `docs/audits/…-baseline-metrics.md`.
5. Docs: prompt-only baseline; Soup PARK until WAVE gates.
6. WAVE row 01 DONE.

## НЕ

- soup train; TZD-76; mutation-journal Mongo PII dump; NX product UI

## AC

1. `buildSystemPrompt` includes general.md rules + schema.
2. Fixtures run green; metrics recorded.
3. Desktop gates PASS.
4. No SoT mutation from normalize.

---

**ARCHIVE_MARKER:** DONE 2026-09-11T23:10:00Z — see docs/agent-checklists/TZD-AI-IMPORT-GENERAL-BASELINE.md for SHA
