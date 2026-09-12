# TZ-NX-DOCSTUDIO-CATALOG-HYDRATE-ALL checklist

> Status: **CLAIMED / IN PROGRESS**
> Marker: `tasks/_active/TZ-NX-DOCSTUDIO-CATALOG-HYDRATE-ALL.md`
> Wave: `docs/agent-checklists/WAVE-NX-DOCSTUDIO-CATALOG-TABLE-IA.md` (#2/4)

## Claim slot

- agent_id: claude
- claimed_at: 2026-09-12T20:16:09Z
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable

## Architect gate (5-10 min, перед кодом)

`refreshLiveDataSetsOnLoad` (L1588-1611 pre-change) loops `tables` and fires
`void firstValueFrom(putDataSet(...)).then(...)` per table **without await** —
every iteration reads `this.document()?.revision` before any prior request
resolved, so all N requests carry the SAME `expectedRevision` → server 409s
all but one, `if (!result.ok) return` swallows it silently. Fix: reuse
`hydrateTablesSerially` (built in #1, already the exact serial-queue pattern
`commitCatalogSelectionChange` uses) — for-loop with `await` inside, each
iteration reads `this.document()` fresh. No BE change; no bake-rows-in-GET;
no S15 expansion. Two call sites to repoint: constructor on-load (L741) and
`ensureLiveRowsAfterLayoutSave` (L2462) — both currently call it as a
synchronous void method; after the change it returns `Promise<void>`, so
both call sites need `void` prefix (no-floating-promises).

## Acceptance (из TZ)

- [x] Doc с 4 wired catalog tables + non-empty Выбрано → после open все четыре с строками (spec: 4/4 blocks get liveRows)
- [x] Spec доказывает serial revisions — `[1,2,3,4]` strictly increasing, proven distinct
- [x] Helper существует и вызывается из Insert (#1) / готов для VITRINA-EDIT (#4) — done in #1, on-load now reuses same `hydrateTablesSerially`
- [x] nx build green

## Gates (факт)

- `pnpm exec tsc -p apps/kppdf-web/tsconfig.app.json --noEmit` → exit 0
- `pnpm exec nx test kppdf-web` → 121 suites / 840 tests PASS (includes new `studio-editor-hydrate-serial.spec.ts`, 2 tests: serial-revisions + one-failure-does-not-abort-rest)
- `pnpm exec nx build kppdf-web` → exit 0, same pre-existing budget warnings as baseline

## Executor report

- Changed: `studio-editor.page.ts` — `refreshLiveDataSetsOnLoad` rewritten from a parallel fire-and-forget loop to `await this.hydrateTablesSerially(tables)` (the primitive built in #1); both call sites (constructor on-load, `ensureLiveRowsAfterLayoutSave`) updated to `void` the now-async method.
- New spec `studio-editor-hydrate-serial.spec.ts` drives a real document load with 4 wired catalog tables and proves `expectedRevision` sequence `[1,2,3,4]` (serial, not raced) and that a single 409 on table #2 doesn't abort tables #3/#4.
- `docs/pages/document-studio.page.md` — one-liner near S46 documenting GET-has-no-liveRows + serial on-load hydrate.
- No BE change, no bake-rows-in-GET, no S15 expansion.
