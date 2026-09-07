# TZD-78-CHAT-HITL-MAPPING checklist

> Status: **DONE**
> Marker: removed (`tasks/_active/TZD-78-CHAT-HITL-MAPPING.md` deleted at closeout)

## Claim slot

- agent_id: claude
- claimed_at: 2026-09-08T02:00:00+03:00
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (no Team Room CLI in this executor)

## Preflight

- [x] TZD-77 archive read (`tasks/_archive/2026-09/TZD-77-AI-CHAT-INBOX-BRIDGE.done.md`) — Inbox snapshot already in chat context, known follow-up
- [x] `desktop/src/core/inbox.ts` read — `auditInboxFile`/`scanInbox` (read-only), propose/confirm journal path (unrelated, not touched)
- [x] `desktop/src/App.svelte`'s existing `auditFile()` (Import-tab "Разобрать" button) and `suggestMapping()`/`suggestWithAi()` (AI + local-classifier fallback) read — reused, not duplicated
- [x] `desktop/src/core/ai/suggest-mapping.ts` read — existing AI-prompt mapping helper; extended (not replaced) with a non-AI summary path
- [x] `desktop/src/ChatPanel.svelte` read — self-contained, no fs access; kept that boundary (parent does all I/O via callback props)
- [x] Canon test command confirmed (desktop has no `pnpm test`): `cd desktop && npx tsx --test src/core/*.test.ts src/core/ai/*.test.ts src/importers/*.test.ts src/ai-runner/*.test.ts`
- [x] `tasks/_active/` checked — no competing claim

## Acceptance

- [x] Из чата можно получить mapping draft для файла Inbox
- [x] Запись в БД только через Импорт confirm
- [x] 0.5.10 published; gates; archive

## Integrity slot (before READY / archive)

- [x] Type: other (Desktop-only chat/Import UI; no NX/backend route, no new permission)
- [x] FIC §A–E: N/A — Desktop-only
- [x] page.md: `desktop/docs/AI-PROVIDERS.md` new §TZD-78 section + `desktop/README.md` note
- [x] DOMAIN-MAP: N/A
- [x] No unrelated dirty WIP staged (NX/supply untouched, per instruction)

## Build integrity

- N/A (Desktop) — `pnpm run typecheck` + `pnpm run check` (svelte-check) used instead

## Gates (fact)

- PASS: `cd desktop && npx tsx --test src/core/*.test.ts src/core/ai/*.test.ts src/importers/*.test.ts src/ai-runner/*.test.ts` — 135/135 (11 new)
- PASS: `cd desktop && pnpm run typecheck` (tsc --noEmit)
- PASS: `cd desktop && pnpm run check` (svelte-check) — 397 files, 0 errors, 0 warnings
- PASS: `pnpm run release-installer` — exit 0, PE FileVersion 0.5.10 verified (publish-installer's own assert)
- PASS: `curl -I http://127.0.0.1:3000/downloads/kppdf-desktop-setup.zip` → 200, `Content-Length: 42139334` (started the local dev stack solely for this check, stopped it afterward via `node start.mjs --stop`)

## Executor report

- New pure/testable logic (matches project convention: `.svelte` stays thin, logic lives in `core/**` with `.test.ts`):
  - `core/ai/chat-inbox-intent.ts` — `matchInboxIntent(message, fileNames)`: local heuristic (intent word + exact/stem file-name match), no LLM call.
  - `core/ai/suggest-mapping.ts` (extended) — `pickBestTableSuggestion()` + `buildInboxMappingSummary()`: reuses `analyzeTables()`/`IMPORT_TARGETS` (same classifier `suggestMapping()`'s fallback branch already uses on the Import tab) to build a deterministic RU summary, no LLM call.
- `ChatPanel.svelte`: new props (`inboxFileNames`, `onInboxAudit`, `onOpenInboxFile`); quick-pick file buttons above the history; typed "разбери файл X" intent short-circuits `send()` before any `chatCompletion()` call; a mapping-preview reply carries `inboxFile` and renders a "Открыть в Импорте" CTA. The existing LLM chat path is otherwise unchanged.
- `App.svelte`: `auditInboxFileForChat()` (read-only: `auditInboxFile` + `analyzeTables` + the two new pure helpers) and `openInboxFileFromChat()` (sets `activeTab='import'` + calls the EXISTING `auditFile()` — same function the Import tab's own "Разобрать" button calls, no second parse/open path).
- Kept `ChatPanel.svelte` free of Tauri/fs imports (matches its own doc comment: parent resolves everything, panel stays environment-agnostic) — all I/O happens in `App.svelte` via callback props.
- System prompt (`ai/system-prompts/desktop-chat.md` + `core/ai/prompts.ts` fallback) — added one synced sentence telling the model this local command exists, so it can point users to it in conversation (mirrors TZD-77's "keep both texts in sync" convention).
- Version bump 0.5.9 → 0.5.10 (`package.json`, `tauri.conf.json`, `Cargo.toml`; `Cargo.lock` is gitignored for this app, auto-updated by the build, nothing to commit) + `pnpm run release-installer` + HEAD-200 verification.
- conflict disclosure: touched only the TZ's listed conflict keys; NX/supply untouched as instructed.
- known limitation: intent recognition is a simple word+filename heuristic, not full NLU — ambiguous phrasing may miss; the quick-pick buttons are the reliable fallback path (zero typing, always works when `onInboxAudit` is wired).

## Closeout

- [x] archive + DONE lock + remove `_active` marker
- closed_at: 2026-09-08T02:45:00+03:00
