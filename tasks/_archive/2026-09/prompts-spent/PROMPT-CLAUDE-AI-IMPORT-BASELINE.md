# PROMPT — Claude: Desktop AI import baseline WAVE (pre-Soup)

> Очередь: **после** COMPLETE `WAVE-NX-DOCSTUDIO-TABLE-PROPS`.  
> Не стартовать параллельно с NX DocStudio.

```
Ты executor kppdf-8.0 (agent_id: claude). GEMINI.md + docs/how-to-connect-ai.md + kppdf-executor-loop.
UNATTENDED: docs/agents/CLAUDE-UNATTENDED.md — не спрашивай «продолжать?».

[КОНТЕКСТ]
Workspace: D:\kppdf-8.0
Audits: docs/audits/2026-09-11-soup-sft-import-decision.md
        docs/audits/2026-09-11-prompt-cannon-002-desktop-ai.md
WAVE: docs/agent-checklists/WAVE-DESKTOP-AI-IMPORT-BASELINE.md
Soup SFT = PARK. TZD-76 NOT required (use Ollama/remote). 152-FZ: no client Excel to cloud trainers.
Cannon consensus: TOP-1 = wire general.md; then HITL JSONL; then mapping via Ollama.

[ЗАДАЧА]
01) CLAIM tasks/TZD-AI-IMPORT-GENERAL-BASELINE.md
02) CLAIM tasks/TZD-AI-IMPORT-HITL-DATASET-LOG.md
03) CLAIM tasks/TZD-AI-IMPORT-MAPPING-OLLAMA.md
Each: desktop gates → archive → commit → push.
After 03: WAVE COMPLETE, _NOW IDLE, Executor report 3 SHA + baseline metrics summary + JSONL path.

[ОГРАНИЧЕНИЯ]
НЕ: soup train/export; wipe; deploy; TZD-76 NSIS deep-dive; NX frontend; «продолжать?».
НЕ писать SoT из normalizeStep. Dataset log default OFF.

[ФОРМАТ]
<thinking>…</thinking> → работа.
Финал: 3 SHA; parse_ok% на fixtures; как включить opt-in JSONL; как вызвать AI mapping через Ollama.
```
