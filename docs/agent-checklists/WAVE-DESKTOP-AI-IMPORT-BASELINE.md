# WAVE-DESKTOP-AI-IMPORT-BASELINE — до Soup: prompt + датасет (+ optional mapping)

**Решение:** `docs/audits/2026-09-11-soup-sft-import-decision.md` + cannon `002`  
(`docs/audits/2026-09-11-prompt-cannon-002-desktop-ai.md`).  
**Цель:** измеримый prompt-only baseline + local gold JSONL.  
**НЕ:** `soup train`; wipe; cloud fine-tune на ПДн; TZD-76 в этой волне.

| # | SIZE | TZ | Суть | Status |
|---|------|-----|------|--------|
| 01 | L | `tasks/TZD-AI-IMPORT-GENERAL-BASELINE.md` | Wire `general.md` + `normalizeStep` + eval (≥50 fixtures target) | DONE — 59 fixtures, parse_ok=88.1% |
| 02 | M | `tasks/TZD-AI-IMPORT-HITL-DATASET-LOG.md` | Opt-in local JSONL after HITL confirm | READY after 01 |
| 03 | M | `tasks/TZD-AI-IMPORT-MAPPING-OLLAMA.md` | `suggestWithAi` через Ollama/remote (не только скрытый local port) | READY after 01 (можно после 02) |

**Soup reopen gates (медиана cannon):** parse_ok ≥75% на ≥50 fixtures; ≥300 local gold JSONL; ≥10% fewer hard format fails vs baseline → тогда `TZD-SOUP-SFT-IMPORT-V0` (не писать сейчас).

**PROMPT:** `tasks/PROMPT-CLAUDE-AI-IMPORT-BASELINE.md`  
**Очередь:** после COMPLETE `WAVE-NX-DOCSTUDIO-TABLE-PROPS`.
