# TZ-NX-DOCSTUDIO-D56-SELECTED-RAIL checklist

> Status: **DONE**
> Marker: `tasks/_active/TZ-NX-DOCSTUDIO-D56-SELECTED-RAIL.md`
> Commit/push: continuous executor on `main`

## Claim slot

- agent_id: freebuff
- claimed_at: 2026-09-05T13:07:00+03:00
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (no Team Room CLI installed)

## Preflight

- [x] `pwd` + `git rev-parse --show-toplevel` → `D:/kppdf-8.0` / `D:/kppdf-8.0` (Windows path `D:\kppdf-8.0`)
- [x] Read `_NOW.md` + `tasks/_active/`; D55 was archived and no competing active `kppdf-web` task exists
- [x] Read D56 TZ, Data IA-2 wave, UI rules, Data IA audit, and relevant shell/editor sources
- [x] D55 prerequisite is archived and pushed; post-D55 `nx build kppdf-web` baseline is green, exit 0
- [x] Claim slot filled; Status = CLAIMED / IN PROGRESS
- [x] Active marker is present
- [x] Team Room claim attempted best-effort; unavailable

## Acceptance

- [x] `selected` Studio section is left-side and uses the existing buffer content
- [x] Left rail order is Data then Selected; Selected has the correct Russian label and badge
- [x] Data TOC no longer contains Selected; remaining categories work
- [x] Existing catalog/anchor inputs and `insertTable`/`catalogRemove` emitters are reused
- [x] A4 geometry does not reflow
- [x] Focused tests and final gates pass

## Integrity slot (до READY / archive)

- [x] Type: page/UI behavior
- [x] FIC §A–E: N/A — no new route, permission, module, or MCP tool
- [x] `docs/pages/document-studio.page.md` and the D56 audit note updated; PAGE-TZ-INDEX unchanged
- [x] SECTION-READINESS: N/A — existing route and user contour
- [x] Foreign WIP excluded; backend, right rail, product rail, and legacy frontend untouched
- [x] Coupling map: N/A — no shared status/FK/filter semantics changed
- [x] Canon: `docs/DOCS-INTEGRITY.md`

## Build integrity

- [x] Baseline `nx build kppdf-web` after D55 and before D56 code: exit 0
- [x] No other active task claims `kppdf-web/src/**`
- [x] Closing `nx build kppdf-web` is the last gate, exit 0

## Gates

- Focused Jest: PASS (`4 suites / 36 tests`, exit 0); covers panel mode, section contract, editor rail registration, and app-shell badge.
- Typecheck: PASS (`pnpm exec tsc -p apps/kppdf-web/tsconfig.app.json --noEmit`, exit 0).
- Changed-file ESLint: PASS, 0 errors (19 existing warnings in adjacent files).
- Diff check: PASS (`git diff --check`, exit 0).
- Final `nx build kppdf-web`: PASS (exit 0; last D56 gate; only known pre-existing warnings).

## Executor report (auto)

- D56 reuses D51/D52 buffer state and the existing `catalogRemove` / `insertTable` emitters; no second write path was added.
- `selected` is a left-side Studio section; Data remains the only wide panel and Selected uses the normal overlay width.
- The left shell rail registers Data then Selected and mirrors the selected-count badge.
- Data TOC now contains only Products, Whom, Links, and More; A4 shell geometry is unchanged.
- Foreign dirty workspace files, backend, Properties, right rail, product rail, and legacy `frontend/` remain excluded.
- Final commit SHA will be recorded in the archive after commit finalization.

## Closeout

- [x] Integrity slot complete
- [x] Archive + lock + update wave and `_NOW.md`
- [x] Status = DONE
- closed_at: 2026-09-05T13:22:00+03:00
