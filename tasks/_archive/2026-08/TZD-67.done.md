# TZD-67 — Desktop AI tab: raw fetch errors, invisible chat card, text-only progress

**Date:** 2026-08-23
**Executor:** claude
**Outcome:** DONE (source fix; new Tauri build + publish + install still required — see Successor)

## Objective

PO screenshot of the running desktop app's AI tab showed status "работает"
next to "Ошибка: Failed to fetch", and reported confusion about whether a
chat UI exists at all, whether download has visible progress, and whether
TZD-62/64/65 (chat, project prompt, API card) were actually finished.

## Diagnosis (Explore agent, this session)

- Chat UI (`ChatPanel.svelte`) **was** already wired into the AI tab (TZD-62)
  — first card, "Открыть чат" button — but styled identically to the
  "Локальная модель" card below it, easy to miss.
- "Ошибка: Failed to fetch" is a raw, unwrapped `Error.message` from
  `aiRunner.ts::downloadModel()`'s fetch to the runner's own `/download`
  endpoint — no RU translation, unlike the parallel API-provider path
  (`checkApiProvider()` in App.svelte, TZD-65) which already has friendly
  401/429/network text.
- Same raw-message pattern existed in `ChatPanel.svelte::send()`'s catch.
- "работает" status badge (set from a stdout log line) and a failed
  per-action fetch are independent, unreconciled state — the badge never
  downgrades when a subsequent request to the same runner fails to connect.
- Download progress existed but was text-only ("X из Y, N%"), no visual bar.
- TZD-62/64/65 were all closed on static gates only (tsc/svelte-check/unit
  tests) — no live human click-through was ever done before this PO session.

## Fix

1. **`desktop/src/core/ai/error-messages.ts`** (new): `describeChatError()`
   (401/429/generic-network RU text, shared shape with `checkApiProvider()`)
   and `describeRunnerFetchError()` (raw local-runner fetch failure →
   actionable RU text), exported via `core/ai/index.ts`.
2. **`desktop/src/ChatPanel.svelte`**: `send()`'s catch now uses
   `describeChatError()` instead of the raw `err.message`.
3. **`desktop/src/core/aiRunner.ts`**: `downloadModel()`'s catch now uses
   `describeRunnerFetchError()`, and — since a raw fetch failure there can
   mean the runner silently stopped responding on that port even though
   `status` still says "running" — re-probes `/health` once; if that also
   fails, downgrades `status` to `'error'` with an actionable message
   ("Раннер перестал отвечать на этом порту. Нажмите «Перезапустить»."),
   reconciling the badge instead of leaving it contradicting a fresh error.
4. **`desktop/src/App.svelte`**:
   - "Чат" card gets a `card--chat` accent (dark left border + background
     tint) and a small "Начните здесь" eyebrow label, so it reads as the
     primary/first card instead of blending into "Локальная модель" below it.
   - Download status block now renders a visible `<progress>` bar
     (indeterminate while total bytes unknown) above the existing percent
     text, instead of text-only progress.

## Source task

Ad-hoc PO report (screenshot) in this session — no pre-existing TZ file;
claimed directly as `tasks/_active/TZD-67.md`.

## Conflict keys

- `desktop/src/App.svelte`
- `desktop/src/core/aiRunner.ts`
- `desktop/src/ChatPanel.svelte`

## Affected files

- `desktop/src/App.svelte`
- `desktop/src/core/aiRunner.ts`
- `desktop/src/ChatPanel.svelte`
- `desktop/src/core/ai/error-messages.ts` (new)
- `desktop/src/core/ai/index.ts`

## Acceptance criteria

| # | Criterion | Status | Evidence |
|---|-----------|--------|----------|
| 1 | Raw `Failed to fetch` no longer shown verbatim for download or chat-send | PASS | both catches now call the new helpers |
| 2 | Status badge downgrades when runner truly unreachable after a failed download fetch | PASS | health re-probe added in `downloadModel()` catch |
| 3 | Chat card visually distinct from Local-model card | PASS | `card--chat` accent + eyebrow |
| 4 | Download shows a visual progress indicator, not just text | PASS | `<progress>` element added |
| 5 | `tsc --noEmit` (desktop) | PASS | exit 0 |
| 6 | `svelte-check` | PASS | 396 files, 0 errors/warnings |
| 7 | Existing unit tests (`aiRunner.test.ts`, `model-catalog.test.ts`) | PASS | 11/11 |
| 8 | `vite build` | PASS | built in ~2s, pre-existing chunk-size warning only (unrelated) |

## Commands and exit codes

- `cd desktop && pnpm exec tsc --noEmit -p .` → exit 0
- `cd desktop && pnpm run check` (svelte-check) → 396 files, 0 errors, 0 warnings
- `cd desktop && npx tsx --test src/core/aiRunner.test.ts src/core/model-catalog.test.ts` → 11/11 pass
- `cd desktop && pnpm run build` → exit 0

## Known limitations

- **This does not change the currently-installed desktop app on the PO's
  machine.** Desktop is a compiled Tauri binary — these are source changes;
  they only reach a real install after `cd desktop && pnpm run
  release-installer` (fresh `tauri build` + publish) produces a new
  `.exe`/`.zip`, that gets deployed to the site (see TZD-66, already fixed
  the deploy-side version sync), and the PO downloads + reinstalls.
- No new automated test was added for the new health-reconciliation branch
  in `downloadModel()` (would require mocking `fetch` + the Tauri shell
  Command — out of scope for this pass; behavior verified by code review
  + existing test suite passing unchanged).
- Did not touch `checkApiProvider()`'s existing inline RU-error logic in
  App.svelte to reuse the new shared helper — its wording differs slightly
  and changing it wasn't necessary for this fix; worth a follow-up dedup
  pass if a fourth call site appears.
- Footer version string still doesn't reflect feature additions (noted in
  the diagnosis, not fixed here — separate, smaller concern, not blocking).

## Successor tasks

- **PO/build action required:** `cd desktop && pnpm run release-installer`
  (bump `desktop/package.json` + `src-tauri/tauri.conf.json` version first,
  e.g. `0.5.7`, per TZD-46 canon) to produce a real installer with this fix,
  then a warm deploy (TZD-66 already wires DESKTOP_MIN/RECOMMENDED_VERSION
  automatically from that semver) so the pairing dialog offers the new build.

## Archive marker

```
ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-23
closed_by: claude
source_task: ad-hoc (tasks/_active/TZD-67.md)
protected_files:
  - desktop/src/App.svelte
  - desktop/src/core/aiRunner.ts
  - desktop/src/ChatPanel.svelte
affected_areas:
  - desktop/src/
acceptance_status: ALL_PASS
verification: TSC_SVELTECHECK_UNITTESTS_BUILD_ALL_PASS
review: NOT_REQUESTED
lock_file: NOT_CREATED
successor_required: TRUE
```
