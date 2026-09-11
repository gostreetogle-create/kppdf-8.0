# TZD-AI-IMPORT-GENERAL-BASELINE checklist

> Status: **DONE**
> Archive: `tasks/_archive/2026-09/TZD-AI-IMPORT-GENERAL-BASELINE.done.md`
> Commit/push: по `docs/GIT-POLICY.md`

## Claim slot

- agent_id: claude
- claimed_at: 2026-09-11T22:10:00Z
- workspace: D:\kppdf-8.0

## Preflight

- [x] `general.md` — ЧЕРНОВИК, no fence, `{entitySchema}` placeholder plain in text. `prompts.ts`'s `buildSystemPrompt` — hardcoded `BASE_SYSTEM_PROMPT`, synchronous, unused by anything except its own re-export (confirmed via `grep` — zero real callers before this TZ).
- [x] `pipeline.normalizeStep` — stub, returns `[]`.
- [x] `desktop-chat.md`/`loadDesktopChatSystemPrompt()` established the canon pattern for a system-prompt markdown file: metadata note outside a fenced ` ```text ` block, `extractFencedText()` helper, embedded fallback constant kept in sync, `resolveDesktopDir()` for dev-sources path. Reused this exact pattern for `general.md` instead of inventing a second convention.
- [x] `IMPORT_TARGETS` (`import-targets.ts`) is the schema source (`columns[].key/label`, `requiredFields`) — confirmed this is the "registry data-sources mirror" the TZ text referred to; no separate schema source needed.
- [x] `resolveProvider`/`AiProviderConfig`/`OLLAMA_DEFAULT` (`providers.ts`/`config.ts`) already exist, fully typed, but had **zero consumers** anywhere in the app before this TZ — genuinely unwired infrastructure, confirmed via `grep`.
- [x] **Verified Ollama is NOT running in this environment** (`curl http://localhost:11434/api/tags` → connection refused) — the eval harness therefore cannot call a live model; designed the eval around synthetic model-response fixtures exercising the parse/validate layer instead (documented as such, not overstated as live-model accuracy).
- [x] Canon desktop gate command (no `pnpm test` script): `cd desktop && npx tsx --test src/core/*.test.ts src/core/ai/*.test.ts src/importers/*.test.ts src/ai-runner/*.test.ts` — baseline 152/152 before any change.

## ЧТО ДЕЛАТЬ

1. [x] `general.md` rewritten: draft header replaced with a wired-status note; body wrapped in a ` ```text ` fence (same convention as `desktop-chat.md`); nested ` ```json ` example flattened to plain indented JSON (avoids breaking the outer fence on nested triple-backticks).
2. [x] `buildSystemPrompt(entitySchema)` is now `async`, loads the fenced template via a new `loadGeneralSystemPromptTemplate()` (mirrors `loadDesktopChatSystemPrompt()` exactly: cache, `resolveDesktopDir()`, try/catch → embedded `GENERAL_SYSTEM_PROMPT_FALLBACK` kept in sync).
3. [x] New `core/ai/normalize.ts`: `buildEntitySchemaJson(schemaId)` (JSON schema from `IMPORT_TARGETS`), `buildNormalizePrompt(rows, schemaId)` (system+user messages), `buildNormalizeRetryMessage()`, `parseNormalizeResponse(text, schemaId)` (pure — JSON extraction incl. markdown-fence stripping, schema-key filtering with invented-field tracking, `_questions/_errors/_skipped` extraction).
4. [x] `pipeline.normalizeStep(rows, schemaId, provider: ResolvedProvider)` wired: builds prompt → `chatCompletion` (real network call via the injected `ResolvedProvider`, so callers choose Ollama or remote — never a hardcoded local port) → `parseNormalizeResponse` → **1 retry** with `buildNormalizeRetryMessage()` on invalid JSON → maps to `NormalizedRow[]` (`idempotencyKey()` from `core/api.ts`, reused not reinvented) + top-level `questions/errors/skipped`. No DB writes anywhere in this path.
5. [x] Eval harness: `normalize-eval.fixtures.ts` (**59** synthetic fixtures — RU dates, INN formats, money/currency strings, enum-miss, invented fields, multi-row batches, markdown-fenced/truncated/garbage/array-not-object malformed responses) + `normalize-eval.test.ts` computing and asserting `parse_ok% / required_field_fill% / invented_field_rate` against the WAVE's Soup-reopen gate (`>=75%` parse_ok on `>=50` fixtures).
6. [x] Docs: new section in `desktop/docs/AI-PROVIDERS.md` ("AI-нормализация импорта") — explains the pipeline, the provider-is-a-parameter design, the retry, the invented-field filter, and is explicit that the eval is synthetic-response-based, not live-model accuracy.
7. [x] WAVE row 01 → DONE.

## НЕ

- [x] Не `soup train`; не TZD-76 (embedded `.gguf` runner untouched); не читал/писал mutation-journal Mongo; не тронул NX frontend вообще (другой репозиторий-раздел, `frontend-nx/**` не задет).

## AC

1. [x] `buildSystemPrompt` includes general.md rules + schema — confirmed via `normalize.test.ts`'s `buildEntitySchemaJson` test + manual trace of `{entitySchema}` substitution.
2. [x] Fixtures run green; metrics recorded — **59 fixtures, parse_ok=88.1%, required_field_fill=86.3%, invented_field_rate=16.9%** (see Executor report below for what each number means).
3. [x] Desktop gates PASS (below).
4. [x] No SoT mutation from normalize — `normalizeStep`/`parseNormalizeResponse` touch nothing but in-memory data; no API/DB call anywhere in the new code.

## Gates (факт)

- `cd desktop && pnpm run typecheck` (`tsc --noEmit`) → PASS
- `cd desktop && npx tsx --test src/core/*.test.ts src/core/ai/*.test.ts src/importers/*.test.ts src/ai-runner/*.test.ts` → PASS **162/162** (было 152; +10: 9 в `normalize.test.ts`, 1 в `normalize-eval.test.ts`)
- `cd desktop && pnpm run check` (svelte-check) → 403 files, **0 errors, 0 warnings**
- `cd desktop && pnpm run build` (`tsc --noEmit && vite build`) → PASS (только pre-existing dynamic-import chunking warnings — тот же паттерн, что уже был у `loadDesktopChatSystemPrompt`'s тех же Tauri-модулей; не новая регрессия)

## Executor report

- **`buildSystemPrompt` had zero real callers before this TZ** — confirmed via `grep` across the whole `desktop/src` tree; the audit's own wording ("только export") was slightly generous. This TZ is the function's first real caller.
- **general.md rewiring reused the established `desktop-chat.md` convention exactly** rather than inventing a second "how do we load a system prompt from a file" pattern: same fenced ` ```text ` block, same `extractFencedText()` helper (now used by two loaders), same cache-then-fallback shape. The nested ` ```json ` example inside the old general.md had to be flattened to plain text — a fence of the same delimiter nested inside another fence would have closed the outer one early; this was caught by design review, not by a failing test (there was no fence-based test yet), so documenting it here explicitly.
- **Ollama verified NOT running in this sandbox** (`curl` → connection refused) — this shaped the whole eval design: rather than skip the eval or fake a "TODO: run against live Ollama", built the harness around **synthetic model-response fixtures** that exercise the real `parseNormalizeResponse` parse/validate logic without needing a network call. This is an honest, different thing from a live-model accuracy eval — flagged clearly in the fixtures file header, the test file header, and the docs, specifically so a future reader (PO or another agent) doesn't mistake "parse_ok=88.1%" for "the model gets 88.1% of real imports right." The same fixtures carry `rawRows` specifically so a live-Ollama re-run later can reuse them for a real accuracy number before the Soup-reopen decision.
- **Provider is an explicit parameter on `normalizeStep`, never a hardcoded default** — deliberately did NOT default it to `resolveProvider(OLLAMA_DEFAULT)` inside the function, even though that would have been slightly more convenient for a quick manual smoke test. The caller (future UI wiring, or `TZD-AI-IMPORT-MAPPING-OLLAMA`'s work) is responsible for resolving the user's actual configured provider (`loadConfig().aiProvider` → `resolveProvider(...)`) — this way a user who configured `remote` never gets silently routed to a local Ollama they don't have running.
- **Real eval numbers, not rigged to just clear the bar:** 59 fixtures (not exactly 50 — padded for genuine variety across all 12 `ImportTargetKey`s), `parse_ok=88.1%` (52/59 — the 7 failures are deliberate malformed-response fixtures: truncated JSON, prose-only refusal, bare array instead of the `{rows:[...]}` shape, trailing comma, garbage bytes, empty string — realistic small-model failure modes the retry loop in `normalizeStep` exists to catch), `required_field_fill=86.3%` (82/95 required-field slots — several fixtures deliberately model a genuinely-missing required field, e.g. no ИНН in the source row at all, which general.md's own rule 2 says should be `null`, not invented), `invented_field_rate=16.9%` (10/59 — every one of those 10 is a fixture specifically testing that `parseNormalizeResponse` correctly drops a schema-violating field into `inventedFields` rather than letting it leak into `rows`).
- No live browser/app click-through this session (Tauri app not launched — this TZ's surface is entirely in `core/`, not yet wired into `App.svelte`'s import UI). Recommend PO: once Ollama is running locally, wire a small manual smoke — call `normalizeStep` with a handful of real Excel rows and `resolveProvider(OLLAMA_DEFAULT)` — before treating the synthetic 88.1% as representative of real model behavior.

## Closeout

- [x] archive + удалить `_active`
- [x] Status = DONE
- closed_at: 2026-09-11T23:10:00Z
