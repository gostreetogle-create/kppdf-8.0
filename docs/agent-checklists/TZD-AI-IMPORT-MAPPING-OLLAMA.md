# TZD-AI-IMPORT-MAPPING-OLLAMA checklist

> Status: **DONE**
> Archive: `tasks/_archive/2026-09/TZD-AI-IMPORT-MAPPING-OLLAMA.done.md`
> Commit/push: по `docs/GIT-POLICY.md`

## Claim slot

- agent_id: claude
- claimed_at: 2026-09-12T00:05:00Z
- workspace: D:\kppdf-8.0

## Preflight

- [x] Confirmed the exact gap: `suggestWithAi` read `aiState.port` directly and threw if absent — the ONLY caller (`suggestMapping()`) only entered that branch when `aiState.status === 'running' && aiState.modelLoaded && aiState.port` (the embedded runner TZD-75 hid from UI). No path to Ollama/remote existed for AI mapping at all before this TZ.
- [x] Found `suggestMapping()` already has a 3-way fallback chain (embedded AI → MCP classifier → deterministic `classifyHeaders`) — the deterministic path was ALREADY always-available (confirms AC#2's "without provider" case was already correct; this TZ only needed to insert a new middle option, not build a fallback from scratch).
- [x] `pingProvider()` (`providers.ts`) was a stub (`return false` always) — a genuine TODO already named in `AI-PROVIDERS.md`. Implemented it for real: `local-ollama` → short-timeout `GET /api/tags` (Ollama's own documented health endpoint); `remote` → optimistic `true` (no universal cheap ping across arbitrary OpenAI-compatible gateways — a real failure surfaces honestly from the actual `chatCompletion` call instead of a fake pre-flight check).
- [x] Reused the exact "provider as an explicit parameter, never read from ambient state" design already established in `TZD-AI-IMPORT-GENERAL-BASELINE`'s `normalizeStep` — `suggestWithAi` now takes `{baseUrl, apiKey?, model}` instead of closing over `aiState`.

## ЧТО ДЕЛАТЬ

1. [x] `suggestWithAi(headers, rows, provider)` — provider is a parameter now; the embedded-runner call site builds an ad-hoc `{baseUrl: aiEndpoint(port), model: aiState.modelName ?? 'local'}` object, same shape `ResolvedProvider` uses.
2. [x] `pingProvider(config)` implemented (`providers.ts`) — see Preflight.
3. [x] `suggestMapping()` extended: embedded runner (unchanged) → **NEW: config `aiProvider` via `resolveProvider`/`pingProvider`** (Ollama or remote, TZD-76 not required) → MCP classifier (unchanged) → deterministic `classifyHeaders` (unchanged, still always available). Result message now names the source (`(AI: Ollama)` / `(AI: удалённый провайдер)` / `(AI: встроенная модель)` / no tag for deterministic) — honest, not overstated.
4. [x] Reused `buildMappingPrompt`/`parseMappingJson` unchanged — no HITL confirm semantics touched anywhere.
5. [x] Docs: two new sections in `desktop/docs/AI-PROVIDERS.md` (the mapping-Ollama flow + the now-real `pingProvider`), replacing the stale TODO line.
6. [x] WAVE row 03 → DONE, **WAVE COMPLETE**.

## НЕ

- [x] Soup untouched; HITL confirm semantics (`confirmMapping`/`sendBlocks`/`confirmBlockProposals`) untouched — this TZ only changes *where the suggested mapping comes from*, never what happens after the operator confirms it; TZD-76 (embedded `.gguf` runner in NSIS) not required — the embedded-runner branch is left exactly as it was, just no longer the only option.

## AC

1. [x] With Ollama (or remote) configured and embedded runner offline: AI mapping button works — traced the new branch: `aiState.port` falsy → falls to the config-provider branch → `pingProvider` true → `suggestWithAi` called with the resolved provider.
2. [x] Without provider: deterministic path + honest message — `pingProvider` false (Ollama not running, confirmed separately not running in this sandbox) → falls through to MCP-or-deterministic exactly as before; the message never claims AI ran when it didn't (no `aiSource` tag set).
3. [x] Desktop gates PASS (below).

## Gates (факт)

- `cd desktop && pnpm run typecheck` (`tsc --noEmit`) → PASS
- `cd desktop && npx tsx --test src/core/*.test.ts src/core/ai/*.test.ts src/importers/*.test.ts src/ai-runner/*.test.ts` → PASS **174/174** (было 167; +7 в новом `providers.test.ts`)
- `cd desktop && pnpm run check` (svelte-check) → 404 files, **0 errors, 0 warnings**
- `cd desktop && pnpm run build` (`tsc --noEmit && vite build`) → PASS (та же pre-existing dynamic-import chunking warning family)

## Executor report

- **The real gap was narrower than "no AI mapping ever works"**: the deterministic fallback (`classifyHeaders`) was already always-available and already honest (no misleading success message) — so AC#2 was largely already satisfied by existing code. The actual fix needed was purely additive: give the middle branch (Ollama/remote) a real chance to run before falling further down the chain, without touching the two branches on either side of it.
- **`pingProvider` went from a permanent stub to a real, tested health check** — `local-ollama` gets a genuine 3-second `GET /api/tags` probe (Ollama's own documented endpoint, cheap and correct); `remote` deliberately does NOT get an equivalent probe, because there's no single endpoint that works across arbitrary OpenAI-compatible gateways (OpenAI, OpenRouter, TokenRouter, etc. don't share one). Chose to let a misconfigured/unreachable remote provider fail loudly from the real `chatCompletion` call rather than build a fragile universal pre-flight check.
- **Same "provider as a parameter" shape as `normalizeStep`** (from `TZD-AI-IMPORT-GENERAL-BASELINE`, same WAVE) — deliberately kept the two AI-import features consistent rather than inventing a second convention for "how does this function receive Ollama-vs-remote-vs-embedded" three tasks apart in the same wave.
- **Priority order was a judgment call, stated explicitly rather than left implicit**: embedded runner (if genuinely running) → config Ollama/remote → MCP classifier → deterministic. Put the new Ollama/remote option ahead of MCP because it's fully local/user-controlled (no external pairing dependency), matching the spirit of "не только скрытый local port" — the fix should make a *real*, privacy-preserving local option available, not just add a lower-priority fallback behind an already-working cloud path.
- No live click-through this session (Tauri app not launched, Ollama confirmed not running in this sandbox in TZD-01's preflight). Recommend PO: with Ollama running locally (`ollama serve` + `ollama pull qwen2.5:7b`) and the embedded runner NOT started, open Import → load a file → «Предложить сопоставление» → confirm the result message shows `(AI: Ollama)`, not silently falling to deterministic.

## Closeout

- [x] archive + удалить `_active`
- [x] Status = DONE
- closed_at: 2026-09-12T00:35:00Z
