# TZ-NX-SUPPLY-S5-MATERIAL-UPSERT checklist

> Status: **DONE**
> Marker: removed (`tasks/_active/TZ-NX-SUPPLY-S5-MATERIAL-UPSERT.md` deleted at closeout)
> Wave: `WAVE-NX-SUPPLY-OPS` (5/7)

## Claim slot

- agent_id: claude
- claimed_at: 2026-09-07T23:15:00+03:00
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (no Team Room CLI in this executor)

## Preflight

- [x] `MaterialFormDialogComponent`/`MaterialFormDialogData` read — `mode:'create'|'edit'`, optional `material` prefill via `patchMaterial()`/`hydratePhotos()`; confirmed passing `{mode:'create', material: source}` prefills but still calls `create()` on submit (mode signal stays 'create')
- [x] `material-registry-dialog-host.ts` read for the exact `dialog.open(...) + onDialogCloseOnce` calling convention (reused verbatim)
- [x] Confirmed nested dialog-opens-dialog is an established pattern (`PiDialogService` already injected inside other form dialogs in this codebase)
- [x] `tasks/_active/` checked — no competing claim

## Acceptance

- [x] Create + copy flows работают из снабжения
- [x] nx build; archive

## Integrity slot (before READY / archive)

- [x] Type: other (existing-page UI reuse; no new route/permission/module/MCP/backend endpoint)
- [x] FIC §A–E: N/A
- [x] page.md: `docs/pages/supply.page.md` (§S5) + `docs/pages/materials.page.md` (one-line cross-reference)
- [x] DOMAIN-MAP: N/A — no new entity/module, reuses `Material`/`PiMaterialsService`
- [x] Coupling map: N/A — no new FK/status coupling
- [x] No unrelated dirty WIP staged

## Build integrity

- [x] `cd frontend-nx && pnpm exec nx build kppdf-web` — green (last gate)

## Gates (fact)

- PASS: `cd frontend-nx && nx test kppdf-web` (full) — 97 suites / 634 passed / 7 skipped / 0 failed
- PASS: `nx lint kppdf-web` changed files — 0 new issues (one warning introduced and fixed inline before commit)
- PASS: `pnpm architecture:check` — 1465 files, baseline 17, 2 resolved
- PASS: `cd frontend-nx && pnpm exec nx build kppdf-web` (last)

## Executor report

- Added «+ Новый материал» (blank `MaterialFormDialogComponent` create) and «Копировать и изменить» (per search-result row, same dialog with `material: source` prefill) to `supply-request-form-dialog.component.ts`. Both close-callbacks call the existing `pickMaterial()` to bind the resulting material to the request.
- No backend change — `PiMaterialsService.create()` already existed and is the only write-path; "copy" is a client-side prefill (not the `duplicate()` endpoint), matching the TZ's "user edits before save" requirement.
- Did not modify `MaterialFormDialogComponent` itself — pure reuse, including its existing photo-prefill-on-copy behavior (documented as inherited, not new).
- conflict disclosure: unrelated dirty WIP in the tree (docker-compose.yml, start.mjs, build-info.ts, data/, reports/, other nx-supply TZ files for later waves) — none staged.
- known limitation: none new. Dedup stays HITL (existing S3 typeahead list, no auto-merge) per TZ step 4.

## Closeout

- [x] archive + DONE lock + remove `_active` marker
- closed_at: 2026-09-07T23:45:00+03:00
