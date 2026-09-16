# PROMPT-CANNON — kppdf Desktop AI: что делать дальше (multi-model)

> Куда вставлять: Smart Poll / GeoPrompt / любой multi-LLM.  
> Цель: **разные**, но **заземлённые** ответы (не один «рано»).  
> Эталон фактов у нас: `docs/audits/2026-09-11-soup-sft-import-decision.md`  
> Урок из `prompt_cannon/001.txt`: без жёстких FACTS модели выдумывают React-пути и делают TZD-76 обязательным блокером SFT.

Скопируй блок ниже целиком.

---

```
ROLE
You are an independent product+ML architect reviewing options for kppdf-8.0
(small workshop ERP, ~10 users, Angular/Nest/Mongo + Tauri Desktop companion).
ANALYSIS ONLY. Do not invent file paths, endpoints, or “closed TZ” status.
If something is not in FACTS below, say UNKNOWN — do not guess.

FACTS (treat as ground truth; do not contradict)

Product / privacy
- Operator under 152-FZ: client PII must not go to foreign APIs without explicit legal TZ.
- Default AI path prefers local (Ollama). Remote OpenAI-compatible chat exists with a privacy banner.

Desktop AI today
- desktop/ai/system-prompts/general.md = DRAFT for “raw import → strict JSON by entity schema”
  (_questions / _errors / _skipped). NOT wired: prompts.ts still has TODO; pipeline.normalizeStep is a stub.
- What actually works for Import today: column mapping (headers → fields) via buildMappingPrompt /
  suggestWithAi, plus deterministic analyzeTables fallback; SoT write only after HITL confirm
  via /api/mutation-journal/proposals (payload only — NO raw Excel/CSV stored on the journal row).
- import_task documents CAN store rows[].raw + proposed fields (MCP import-task contour) —
  not the same as an exportable SFT JSONL pipeline.
- Chat role = LIMITED_HELPER (no DB writes from chat). Write path = Import HITL only.
- Embedded node-llama-cpp + .gguf UI was hidden (TZD-75 DONE). TZD-76 (fix NSIS runner) has
  acceptance criteria in docs/peer/gemini-desktop-ai-runner-plan.md but NO TZ file / NOT done.
- Working AI surfaces NOW: (1) remote API chat, (2) MCP tools for external clients (Cursor/LM Studio),
  (3) Ollama as documented provider. Embedded GGUF chat is NOT required to use Ollama.

Hardware (user-confirmed)
- Train PC: 16 GB VRAM. Shop PCs: ~12 GB VRAM.
- Soup 0.74 exists as Soup-0.74.0.zip in repo root (CLI SFT/LoRA/QLoRA → GGUF/Ollama).
- Hardware is NOT the blocker for Qwen2.5-7B QLoRA train or Q4/Q5 GGUF infer on 12 GB.

Already decided by project architect (do not re-litigate unless you have a stronger fact-based rebuttal)
- Full Soup SFT TZ right now = TOO EARLY (no wired general.md scenario, no gold raw→JSON dataset).
- Prerequisite wave drafted: (A) wire general.md + normalizeStep + prompt-only eval metrics;
  (B) opt-in LOCAL JSONL log of HITL pairs after confirm. Soup returns after baseline + enough gold.

QUESTION (answer ALL sections; be concrete; disagree with peers where useful)

1) PRIORITY ORDER (next 2–6 weeks for THIS product, not ML hobby)
   Rank these with 1–2 sentences WHY (operator value, risk, 152-FZ):
   a) Wire general.md + normalizeStep baseline (Ollama/remote), eval harness
   b) Opt-in local HITL→JSONL dataset logging
   c) Soup LoRA on Qwen2.5-7B for import JSON
   d) Close TZD-76 embedded GGUF runner
   e) Improve MCP tool-calling reliability via SFT
   f) Improve column-mapping AI (suggestWithAi) on Ollama without SFT
   g) Something else you believe is higher ROI (name it; no vapor)

2) WHAT NOT TO DO
   List 3 anti-patterns for kppdf specifically (e.g. fine-tune “general assistant”,
   send client Excel to cloud trainer, train before baseline metrics).

3) SMALLEST USEFUL EXPERIMENT
   Describe ONE experiment ≤1 week wall-clock that produces a measurable number
   (metric + how to compute) WITHOUT Soup train. Name exact artifacts
   (prompt file, test fixtures count, where results are written).

4) WHEN SOUP BECOMES RATIONAL
   Give hard gates (numbers/conditions), not vibes. Example form:
   “Soup TZ only if baseline parse_ok ≥ X on N fixtures AND ≥ Y local gold JSONL lines
   AND delta expected on format errors is Z”. State your X/Y/Z.

5) TZD-76 RELATIONSHIP
   Explicitly choose ONE and justify with FACTS:
   - (i) Must finish TZD-76 before any local-model work
   - (ii) Ollama path is enough for baseline + later Soup-exported GGUF; TZD-76 is parallel/optional UX
   - (iii) Other (state)

6) DIVERSITY RULE
   If you would only say “do baseline then dataset then Soup”, ALSO propose ONE alternative
   product bet that is NOT that sequence (e.g. double-down on deterministic mapping + profiles,
   or MCP-only for power users, or warehouse inventory NLP). Argue when that bet wins.

OUTPUT FORMAT (strict)
- Verdict line: TOP-1 next action = <letter from §1>
- Then sections 1–6 with bullets
- End with: Confidence 1–5 and the single fact that most limits your confidence
- Max ~600 words. No invented paths. Russian or English OK; prefer Russian for operator-facing wording.
```

---

## Зачем такой промпт (коротко)

| Было в 001 | Стало |
|------------|--------|
| «Проверь код» без фактов | Жёсткий блок **FACTS** |
| Все схлопнулись в одно «рано» | §6 **обязан** дать альтернативную ставку |
| TZD-76 = must | §5 **явный выбор** i/ii/iii |
| Галлюцинации путей | Запрет invent + UNKNOWN |
| Нет метрик | §3–4 требуют числа |

После прогона: сложи ответы в `prompt_cannon/002.txt` и попроси Cursor сверить с FACTS (как для 001).
