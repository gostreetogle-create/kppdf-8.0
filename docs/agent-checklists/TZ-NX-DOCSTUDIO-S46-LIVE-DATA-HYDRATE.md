# TZ-NX-DOCSTUDIO-S46-LIVE-DATA-HYDRATE checklist

> Status: **CLAIMED → IN PROGRESS**
> Marker: `tasks/_active/TZ-NX-DOCSTUDIO-S46-LIVE-DATA-HYDRATE.md`
> Audit: `docs/audits/2026-09-06-docstudio-live-data-hydrate-audit.md`

## Claim slot

- agent_id: freebuff
- claimed_at: 2026-09-06T18:27:00+03:00
- workspace: D:\kppdf-8.0 (continuous main checkout)
- team_room_claim: unavailable (no Team Room CLI in this executor)

## Preflight

- [x] Continuous workspace, branch `main`, origin/main aligned; `tasks/_active/` empty before claim
- [x] TZ + audit + related S45 TZ read; Chrome IA C1–C4 DONE (`42b4df0f`/`85f1dc8e`/`45d7e6b8`/`2b295bf9`)
- [x] Constraints: liveRows stay ephemeral (no Mongo persist); S45 UI untouched; no Chrome C*, warehouse, desktop
- [x] Baseline `nx build kppdf-web` before product edits (pre-claim run, exit 0)

### Preflight Check Output

- **Root cause (audit-confirmed):** `saveLayouts` (~L2208–2232) does `this.blocks.set(normalized)` from the layout API response; server never returns ephemeral `settings.liveRows` (S28 hydrate does not persist them) → after drag/resize the table loses its rows until full reload.
- **Planned deliverable:** preserve-client-settings helper (liveRows + existing imageUrl pattern) + merge-by-id in `saveLayouts` + safety re-hydrate + tests + page.md line.
- **Geometry risk:** none — data path only, no CSS/layout change.

## Acceptance

- [x] Insert from Выбрано → rows visible → move table → rows remain (merge preserves liveRows) — drag-scenario spec: layout x/y→0.2 applies, liveRows intact, no extra putDataSet
- [x] Resize — same merge path (single helper covers saveLayouts replace)
- [x] Safety net: `ensureLiveRowsAfterLayoutSave` re-hydrates once only when rows are empty; spec asserts single putDataSet when rows survived
- [x] Tests: `studioPreserveClientBlockSettings` (helpers spec) + `studio-editor-live-rows.spec.ts` (3 saveLayouts specs, incl. drag) — 15/15 green
- [x] page.md line: liveRows ephemeral; layout save must preserve client hydrate
- [x] Gates PASS (tsc → focused jest → ESLint 0 errors → nx build LAST)

## Gates

- [x] Baseline build (pre-claim): exit 0
- [x] `tsc -p apps/kppdf-web/tsconfig.app.json --noEmit` — 0 errors
- [x] Focused jest — 15 passed / 0 failed (block-helpers + live-rows suites)
- [x] Changed-file ESLint — 0 errors (pre-existing warnings only)
- [x] `nx build kppdf-web` LAST — exit 0

## Executor report

- See tasks/_archive/2026-09/TZ-NX-DOCSTUDIO-S46-LIVE-DATA-HYDRATE.done.md
