# TZ-NX-DOCSTUDIO-REVISION-RACE-UX checklist

> Status: **DONE**
> Marker: `tasks/_active/TZ-NX-DOCSTUDIO-REVISION-RACE-UX.md`

## Claim slot

- agent_id: claude
- claimed_at: 2026-09-14T01:30:00Z
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (unattended CLI, no team-room MCP)

## Preflight

- [x] git fetch/merge, status checked — up to date with origin/main
  (`890fa577`), `_active` empty before claim
- [x] `docs/audits/2026-09-13-docstudio-revision-conflict-spam.md` read in
  full; `studio-editor.page.ts` read in full for every symbol the audit
  names (`conflict`, `schedule`/`saveLayouts`/`flushLayouts`,
  `createTextLayer`, `rehydrateLiveRowsAfterColumnChange`,
  `enqueueDocumentWrite`); `silent-http.ts` read in full
  (`SilentResult`/`HttpErrorResponse`/`extractErrorMessage`); grepped and
  hand-classified all 23 `this.conflict()` call sites in the file (not
  just the ones the audit's own table names) against whether the
  underlying write actually carries `expectedRevision`
- [x] Claim slot filled; marker in `tasks/_active/`

### Preflight Check Output
- **Context read:** TZ text; audit; `studio-editor.page.ts` (full, all 23
  `conflict()` sites + their surrounding write logic); `silent-http.ts`
  (full); backend `studio-document.service.ts` +
  `template-block.service.ts` (confirmed exactly one `ConflictException`
  throw site in the whole domain, and that block-delete never touches the
  parent document's revision)
- **Key Constraints:** keep optimistic concurrency (`expectedRevision`
  stays mandatory server-side, never removed); dialog only for a genuine
  revision conflict; every other failure honest via toast; one soft retry
  max, rebuilding payloads from CURRENT state on retry, not a stale
  snapshot; don't touch TOKEN/PRICE/ISSUER TZs' own files
- **Planned Deliverable:** every revision-gated write funneled through
  `catalogWriteChain`; `isRevisionConflict()` + `reportWriteFailure()` +
  `attemptWithRevisionRetry()`; specs for both the self-race-resolves-
  silently case and the genuine-conflict-still-shows-dialog case; docs
- **Validation Path:** 2 focused spec files + full kppdf-web suite +
  eslint (scoped) + architecture:check + forced-fresh `nx build` + live
  Playwright (self-race during hydrate, drag during hydrate, simulated
  persistent second-tab 409 via network interception)

## Evidence

См. `docs/agent-checklists/evidence/TZ-NX-DOCSTUDIO-REVISION-RACE-UX.txt`

## Acceptance (из TZ)

- [x] 1. Одна вкладка: open → hydrate → drag → «+ Текст» → правка qty —
  **0** показов диалога — live-подтверждено Playwright дважды (rapid
  addPage×2 + «+Текст» racing hydrate; drag racing hydrate), 0 HTTP 409
  observed in either case (queue prevented the race, not merely resolved
  it), final document state verified correct via API both times
- [x] 2. Не-409 ошибка записи → toast, не «другая вкладка» — spec
  (`a non-409 write failure toasts`) + code review (every non-revision-gated
  block PATCH now routes through `reportWriteFailure`, which can
  structurally never classify as a conflict for those endpoints)
- [x] 3. Две вкладки / искусственный stale revision → диалог
  Перезагрузить/Отмена один раз — live-подтверждено Playwright (network
  interception simulating a persistent second-tab 409 via the real
  bundled FE code, real 409 body shape) + spec (persistent-409 mocks in
  both `write-serial` and `catalog-queue` spec files)
- [x] 4. Gates — все PASS, см. Gates ниже
- [x] 5. Archive + STREAM/_NOW IDLE — см. Closeout

## Integrity slot (до READY / archive)

- [x] Тип изменения: consolidates every revision-gated write onto the
  ALREADY-EXISTING `catalogWriteChain` queue (established by
  ADD-PAGE-WRITE-SERIAL) + two new small, pure/near-pure helpers
  (`isRevisionConflict`, `attemptWithRevisionRetry`,
  `reportWriteFailure`) — no new architecture, no new write path,
  `expectedRevision` never removed from any endpoint
- [x] FIC: N/A (no new route/permission/module)
- [x] page.md: `docs/pages/document-studio.page.md` updated — new
  paragraph right after the existing ADD-PAGE-WRITE-SERIAL one, covering
  which additional sites were self-racing, the honest dialog-vs-toast
  classifier, and the soft-retry mechanism + its payload-freshness
  guarantee
- [x] DOMAIN-MAP: N/A
- [x] Чужой WIP не в коммите; conflict keys соблюдены — exactly
  `studio-editor.page.ts`, the two named/matched
  `studio-editor-*.spec.ts` files (mocks broke exactly where predicted —
  no unrelated spec files needed changes), `document-studio.page.md`; did
  NOT touch `_NOW.md`/`STREAM-QUEUE.md` beyond the exact IDLE/DONE
  updates this wave's own instruction asked for (and even those settled
  to a concurrently-edited final state — Cursor/PO tooling updated both
  files again moments after my own edit landed, converging on the same
  DONE/IDLE outcome; left that final state alone rather than fighting it)
- [x] Канон: `expectedRevision` stays mandatory on every endpoint (never
  removed, per the TZ's own "НЕ" list); no auto-reload without asking on a
  genuine conflict (the dialog still requires an explicit "Перезагрузить"
  click, `reloadFromServer()` unchanged); no LWW-without-a-gate (the
  retry still carries `expectedRevision` — it is one additional attempt
  with a freshly-confirmed revision, not an unconditional overwrite; a
  THIRD concurrent writer racing the retry itself still 409s and still
  shows the dialog, per the live-verified persistent-conflict scenario);
  did not touch TOKEN-EDITOR-CHIP/TABLE-PRICE-SUM/ISSUER-SELECT's own
  files; both throwaway live-test documents (3 rounds of verification)
  deleted via direct Mongo immediately after each round

## Gates (факт)

- `cd frontend-nx && pnpm exec tsc -p apps/kppdf-web/tsconfig.app.json --noEmit` → exit 0
- `cd frontend-nx && pnpm exec nx test kppdf-web --testFile=studio-editor-write-serial.spec.ts` → 7/7 PASS (was 4)
- `cd frontend-nx && pnpm exec nx test kppdf-web --testFile=studio-editor-catalog-queue.spec.ts` → 3/3 PASS (was 3, 1 fixed)
- `cd frontend-nx && pnpm exec nx test kppdf-web` (full) → 126 suites / 940 passed + 7 skipped (947 total) PASS (was 937)
- `cd frontend-nx && pnpm exec eslint apps/kppdf-web/src/app/pages/studio/studio-editor.page.ts apps/kppdf-web/src/app/pages/studio/studio-editor-write-serial.spec.ts apps/kppdf-web/src/app/pages/studio/studio-editor-catalog-queue.spec.ts` → 0 errors, 10 pre-existing-style warnings
- `pnpm architecture:check` (repo root) → PASS
- `cd frontend-nx && pnpm exec nx build kppdf-web --skip-nx-cache` (forced fresh, last) → exit 0, pre-existing unrelated warnings only
- Live Playwright (self-race during hydrate: 0 dialogs/0 409s + correct
  final state; drag during hydrate: 0 dialog + layout genuinely persisted;
  simulated persistent second-tab 409 via network interception: dialog
  shown exactly once) — all PASS, all throwaway data deleted

## Executor report

**Widened the audit's own table systematically, not just implemented what
it listed:** the audit named 6 self-race classes; a hand classification of
all 23 `this.conflict()` call sites (grepped, then read each one's
surrounding write) found the SAME bug in 8 more places the audit's table
never mentioned (`createTableBlock` — a third block-create path;
`onDocTypeChange`, `patchDocumentContext` — the hottest of all, every
Кому/Ещё/Связи pick; `openRenameDialog`; `toggleOrientation` — a second,
independent orientation-write entry point; plus `commitCatalogSelectionChange`/
`addPage`/`applyTableSource`, already correctly queued but still calling
`conflict()` unconditionally on any failure, not just a genuine 409).

**Proactively fixed two existing tests before running the suite revealed
them broken, by tracing the retry logic's call-count implications through
by hand first:** both `studio-editor-write-serial.spec.ts` and
`studio-editor-catalog-queue.spec.ts` had a pre-existing test asserting
"a real 409 opens the dialog" using a loosely-typed mock error with no
`.status` field — a fixture that predates this TZ's `isRevisionConflict()`
classifier and would silently stop testing what its own title claims once
that classifier existed. Traced through exactly how the new soft-retry
would change expected call counts (2 addPage clicks × (1 attempt + 1
retry) = 4, not 2) before touching the test files, then confirmed the
prediction by actually running the suite.

**Live-verified with a technique matched to what each scenario actually
needs:** the self-race and drag scenarios were proven with a real
Playwright browser racing real hydrate-on-load against real button
clicks/mouse gestures against the real dev backend — no interception, no
mocks, because the whole point was "does the queue prevent the race at
all." The genuine-second-tab-conflict scenario needed a DIFFERENT
technique (a single soft retry inherently self-heals almost any transient
409 that a live two-tab test could realistically produce without
controlling a third concurrent writer's exact timing) — used Playwright's
own network interception to force a PERSISTENT 409 on the real bundled FE
code against a real 409 response shape, which is the honest way to
deterministically prove "a conflict that outlives the retry still shows
the dialog" in a live browser rather than only in a service-mocked unit
test.

## Closeout

- [x] archive + удалить `_active`
- [x] Status = DONE
- [x] `docs/agent-checklists/_NOW.md` → Claude slot set to IDLE (did not
  autonomously continue to PREVIEW-UPLOADS-INLINE/UNSCOPED — no prompt
  authorized that in this session)
- [x] `docs/agent-checklists/STREAM-QUEUE.md` → REVISION-RACE-UX row
  marked DONE
- closed_at: 2026-09-14T02:15:00Z
