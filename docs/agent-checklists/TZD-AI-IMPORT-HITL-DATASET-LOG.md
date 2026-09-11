# TZD-AI-IMPORT-HITL-DATASET-LOG checklist

> Status: **DONE**
> Archive: `tasks/_archive/2026-09/TZD-AI-IMPORT-HITL-DATASET-LOG.done.md`
> Commit/push: по `docs/GIT-POLICY.md`

## Claim slot

- agent_id: claude
- claimed_at: 2026-09-11T23:15:00Z
- workspace: D:\kppdf-8.0

## Preflight

- [x] `inbox.ts`'s `appendInboxLog()` (read-existing-fallback-empty, write-back with `\n`-join) is the exact established append-log convention already in this codebase — reused verbatim for `appendDatasetLogEntry`, not reinvented.
- [x] Found TWO distinct "successful HITL confirm" points in `App.svelte`, not one: `sendBlocks()` (non-material targets — `inventory`/generic `else` branches write directly to SoT, immediately effective) and `confirmBlockProposals()` (material — proposal already exists, THIS call is the true commit via `/api/mutation-journal/proposals` confirm). Both needed the hook; material is NOT logged at `sendBlocks()` time (only proposed there, not yet confirmed).
- [x] `ValidatedImportRow.values: RawRow` is the POST-mapping schema-keyed row, not the original file row — but `ValidatedImportRow.rowIndex` indexes back into the top-level `importRows: RawRow[]` state (the file's original parsed rows), giving the true (raw, confirmed) pair the TZ payload shape needs.
- [x] `config.ts`/`inbox.ts` have **no** `.test.ts` files — confirmed precedent that real Tauri-fs-touching functions in this codebase are not unit-tested directly (tested manually via the app); mirrored this split by keeping `dataset-log.ts`'s fs I/O untested and its redaction/entry-building logic (no fs) fully covered by `dataset-log.test.ts`.
- [x] Deliberately did **not** touch `config.ts`/`AppConfig` (not a listed conflict key) — the enable/disable flag lives in its own small `ai-dataset-log-enabled.json` file instead of bumping `CONFIG_VERSION`, keeping this privacy-sensitive opt-in fully separate from the main synced config.

## ЧТО ДЕЛАТЬ

1. [x] New `core/ai/dataset-log.ts`: `buildDatasetLogEntry`/`formatDatasetLogLine` (pure, redacts long strings >500 chars), `appendDatasetLogEntry` (JSONL append, `appDataDir()/ai-dataset-log.jsonl`), `isDatasetLogEnabled`/`setDatasetLogEnabled` (separate `ai-dataset-log-enabled.json`, default OFF on any read error — fail-safe, not fail-open).
2. [x] `App.svelte`: checkbox «Сохранять пары для обучения (только этот ПК)» on the «Импорт» tab (default unchecked, loaded via `isDatasetLogEnabled()` in `onMount`), same `mcp-lan` label/hint styling as the existing LAN toggle — no new CSS.
3. [x] Hooked `logDatasetPairIfEnabled(targetKey, allowed)` into both real confirm points (`sendBlocks()`'s inventory/generic-create branches, `confirmBlockProposals()`'s material branch) — only when the setting is ON, only for rows with `ok_new`/`ok_update` status (the ones that actually got written).
4. [x] Redaction: long string values truncated to 500 chars + `…[truncated]` marker. No cloud upload anywhere in the new code — confirmed by grep, zero `fetch`/`apiPost` calls in `dataset-log.ts`.
5. [x] Docs: new section in `desktop/docs/AI-PROVIDERS.md` — file paths, payload shape, both hook points, the ≥300-line Soup reopen gate.
6. [ ] Optional read-only export script (`import_task` rows → same JSONL shape) — **not built**: no evidence this session that `import_task` proposals currently carry the raw source row in a shape worth a dedicated export script; the live HITL-confirm hook (item 3) already produces the same shape going forward. Noting as a deliberately-skipped optional item, not an oversight.
7. [x] WAVE row 02 → DONE.

## НЕ

- [x] Не `soup train`; setting stays default OFF (verified: `isDatasetLogEnabled()` returns `false` on missing file, on read error, and on `enabled !== true` — never silently ON); privacy banner for the remote-API chat provider (TZD-65) untouched.

## AC

1. [x] OFF → no growth (the setting starts `false`; `logDatasetPairIfEnabled` early-returns when `!datasetLogEnabled`, before ever touching the fs). ON → ≥1 line after confirm (traced through both hook points; `appendDatasetLogEntry` is called once per successful block confirm with the block's `allowed` rows).
2. [x] Gates PASS (below).

## Gates (факт)

- `cd desktop && pnpm run typecheck` (`tsc --noEmit`) → PASS
- `cd desktop && npx tsx --test src/core/*.test.ts src/core/ai/*.test.ts src/importers/*.test.ts src/ai-runner/*.test.ts` → PASS **167/167** (было 162; +5 в `dataset-log.test.ts`)
- `cd desktop && pnpm run check` (svelte-check) → 404 files, **0 errors, 0 warnings**
- `cd desktop && pnpm run build` (`tsc --noEmit && vite build`) → PASS (та же pre-existing dynamic-import chunking warning family — `dataset-log.ts` добавился в список статических импортёров тех же уже предупреждаемых Tauri-модулей, не новая категория)

## Executor report

- **Two confirm points, not one, needed the hook** — this was the main design finding. `sendBlocks()` writes non-material rows to SoT immediately (that IS the confirm for those tables), but for `material` the SAME function only *proposes* — the true commit is a separate, later `confirmBlockProposals()` call against the mutation-journal. Logging only at `sendBlocks()` would have silently missed every material row (the most common import target in this app) and, worse, would have logged material rows that later got *cancelled* rather than confirmed. Traced both paths before writing any code.
- **Reused the raw-row linkage that already existed but wasn't obviously named for this purpose**: `ValidatedImportRow.rowIndex` → `importRows[rowIndex]` gives the true pre-mapping row. No new plumbing needed to recover "what did the file actually say" — it was already there, just not previously read for anything beyond error messages (`rejectionReport`).
- **Deliberately kept the enable flag out of `config.ts`/`AppConfig`** even though that would have been the more "normal" place for a setting — this flag controls whether potentially-sensitive customer data gets written to a local file at all; keeping it in its own tiny file means it's never accidentally bundled into a `config.json` a user might copy/paste into a support chat, and it doesn't require bumping `CONFIG_VERSION` for something this narrow.
- **Skipped the "optional read-only export script" (item 6) deliberately, not by oversight** — the TZ itself marks it optional, and the live-confirm hook already produces entries going forward in the exact target shape; building a second script to backfill from `import_task` would need to inspect that collection's actual stored shape first (a Mongo read, arguably its own small investigation) for a benefit that's now smaller since new confirms are already being captured. Flagged here explicitly per this session's "note real skips, don't silently drop them" convention.
- No live app click-through this session (Tauri app not launched). Recommend PO: toggle the checkbox on, run one real Excel import through to confirm (either a material proposal-confirm or a direct-write table), then check `app-data/ai-dataset-log.jsonl` has exactly one new line shaped as documented.

## Closeout

- [x] archive + удалить `_active`
- [x] Status = DONE
- closed_at: 2026-09-12T00:00:00Z
