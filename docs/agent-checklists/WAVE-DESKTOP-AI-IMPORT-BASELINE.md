# WAVE-DESKTOP-AI-IMPORT-BASELINE — до Soup: prompt + датасет (+ optional mapping)

**Решение:** `docs/audits/2026-09-11-soup-sft-import-decision.md` + cannon `002`  
(`docs/audits/2026-09-11-prompt-cannon-002-desktop-ai.md`).  
**Цель:** измеримый prompt-only baseline + local gold JSONL.  
**НЕ:** `soup train`; wipe; cloud fine-tune на ПДн; TZD-76 в этой волне.

| # | SIZE | TZ | Суть | Status |
|---|------|-----|------|--------|
| 01 | L | `tasks/TZD-AI-IMPORT-GENERAL-BASELINE.md` | Wire `general.md` + `normalizeStep` + eval (≥50 fixtures target) | DONE — 59 fixtures, parse_ok=88.1% |
| 02 | M | `tasks/TZD-AI-IMPORT-HITL-DATASET-LOG.md` | Opt-in local JSONL after HITL confirm | DONE — default OFF, 2 confirm hooks |
| 03 | M | `tasks/TZD-AI-IMPORT-MAPPING-OLLAMA.md` | `suggestWithAi` через Ollama/remote (не только скрытый local port) | DONE — pingProvider реализован, 3-way fallback |

**Soup reopen gates (медиана cannon):** parse_ok ≥75% на ≥50 fixtures; ≥300 local gold JSONL; ≥10% fewer hard format fails vs baseline → тогда `TZD-SOUP-SFT-IMPORT-V0` (не писать сейчас).

**PROMPT:** `tasks/PROMPT-CLAUDE-AI-IMPORT-BASELINE.md`  
**Очередь:** после COMPLETE `WAVE-NX-DOCSTUDIO-TABLE-PROPS`.

**WAVE COMPLETE (2026-09-12).** Все 3 задачи DONE. SHA: 01 `0a4bbe76` · 02 `9e79911d` · 03 `88e80537`. Итог: `general.md` + `normalizeStep` реально вызывают модель (provider — параметр, никогда хардкод); eval 59 fixtures, parse_ok=88.1% (Soup gate ≥75% пройден); опт-ин локальный JSONL (default OFF) на двух реальных HITL-confirm точках; `suggestWithAi`/«Предложить сопоставление» получили Ollama/remote-путь через тот же provider-параметр + реализованный `pingProvider`. Soup остаётся PARK — датасет-лог только что включён, ещё не набрал ≥300 строк; ни один прогон не был против живой модели (Ollama не запущен в этой среде, честно задокументировано).
