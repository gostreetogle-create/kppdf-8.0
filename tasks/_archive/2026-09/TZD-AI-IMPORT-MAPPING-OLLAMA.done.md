# TZD-AI-IMPORT-MAPPING-OLLAMA: suggestWithAi без скрытого local runner

**РОЛЬ АГЕНТА:** Executor Desktop — claude  
**ЗАВИСИМОСТИ:** `TZD-AI-IMPORT-GENERAL-BASELINE` DONE (shared chatCompletion/provider hygiene)  
**LAYER:** 3 · **SIZE:** M  
**PAGE_DOCS:** `desktop/docs/AI-PROVIDERS.md`

**CONFLICT KEYS:**  
`desktop/src/App.svelte` (`suggestWithAi`) ;  
`desktop/src/core/ai/providers.ts` ;  
`desktop/src/core/ai/client.ts` ;  
`desktop/src/core/ai/suggest-mapping.ts` (read) ;  
`desktop/docs/AI-PROVIDERS.md` ;  
`docs/audits/2026-09-11-prompt-cannon-002-desktop-ai.md` ;  
`docs/agent-checklists/WAVE-DESKTOP-AI-IMPORT-BASELINE.md` ;  
`docs/agent-checklists/_NOW.md`

### Why
Cannon 002: many models ranked **f** right after **a**. Today `suggestWithAi` requires `aiState.port` (embedded runner hidden by TZD-75) → AI column mapping dead for most users. Deterministic `analyzeTables` still works.

## ЧТО ДЕЛАТЬ

1. Route «Предложить сопоставление» AI branch through the **same** provider abstraction as chat (Ollama local and/or remote API), not only embedded port.
2. If no provider configured → keep deterministic mapping + clear RU message (no fake errors).
3. Reuse `buildMappingPrompt` / `parseMappingJson`; no SoT write.
4. Spec + WAVE row 03 COMPLETE.

## НЕ

- Soup; change HITL confirm semantics; require TZD-76

## AC

1. With Ollama (or remote) configured and embedded runner offline: AI mapping button works.
2. Without provider: deterministic path + honest message.
3. Desktop gates PASS.

---

**ARCHIVE_MARKER:** DONE 2026-09-12T00:35:00Z — see docs/agent-checklists/TZD-AI-IMPORT-MAPPING-OLLAMA.md for SHA
