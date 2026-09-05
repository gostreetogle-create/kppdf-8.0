# TZ-NX-DOCSTUDIO-S43-VITRINA-TITLE-WRAP checklist

> Status: **DONE**
> Marker: `tasks/_archive/2026-09/TZ-NX-DOCSTUDIO-S43-VITRINA-TITLE-WRAP.done.md`
> Commit/push: по `docs/GIT-POLICY.md` (executor Freebuff/Buffy)

## Claim slot

- agent_id: freebuff (Buffy)
- claimed_at: 2026-09-05T09:30:00+03:00
- workspace: `D:\kppdf-8.0`
- team_room_claim: unavailable (no team-room CLI in environment)
- conflict keys: `frontend-nx/libs/ui/paper-and-ink/src/lib/card/pi-showcase-card.component.ts` (sm title/desc only); `frontend-nx/apps/kppdf-web/src/app/pages/studio/studio-data-vitrina.component.ts`
- concurrent active task: none in these keys; unrelated dirty DocStudio WIP was not staged

## Preflight

- [x] Required executor and PO context read; WAVE and P4 TZ read.
- [x] Existing active-task state checked; P4 task copied to `_active` before code changes.
- [x] Baseline `nx build kppdf-web` passed before code changes.
- [x] Legacy `frontend/` and unrelated Studio files left untouched.

## Acceptance

- [x] `size="sm"` title wraps to at most two lines with `white-space: normal` and line clamp.
- [x] `size="sm"` description remains one-line ellipsis.
- [x] Vitrina/card row/body chain uses `min-width: 0`; grid clips horizontal overflow and scrolls vertically only.
- [x] `md` and `lg` card behavior/media sizing remain unchanged.
- [x] Focused tests cover long-title CSS/DOM contract and vitrina overflow containment.
- [x] Light/dark behavior remains token-based; no raw color or action logic changes.

## Integrity slot

- [x] Type: page/presentation-only.
- [x] FIC §A–E: N/A — existing `/studio` route; no route, capability, API, or permission change.
- [x] `docs/pages/document-studio.page.md` updated with the S43 visual contract.
- [x] `PAGE-TZ-INDEX`: N/A — existing route, no navigation change.
- [x] `SECTION-READINESS`: N/A — existing DocStudio section.
- [x] Coupling map: N/A — no shared field/status/filter change.
- [x] Foreign dirty WIP not staged; only P4-owned files included.
- [x] Canonical docs checked: `docs/DOCS-INTEGRITY.md`, `docs/PO-CANON.md`.

## Gates

- [x] Focused Jest: `cd frontend-nx && pnpm exec jest libs/ui/paper-and-ink/src/lib/card/pi-showcase-card.component.spec.ts apps/kppdf-web/src/app/pages/studio/studio-data-panel.component.spec.ts --runInBand` → PASS, 2 suites / 19 tests.
- [x] App typecheck: `cd frontend-nx && pnpm exec tsc -p apps/kppdf-web/tsconfig.app.json --noEmit` → PASS.
- [x] Targeted ESLint on P4 card/vitrina files → PASS, 0 errors.
- [x] Final `cd frontend-nx && pnpm exec nx build kppdf-web` → PASS (last P4 gate; existing warnings only).
- [x] `git diff --check` on P4-owned changes → PASS.

## Executor report

- Shared `PiShowcaseCardComponent` `sm` title now has two-line clamp, normal wrapping, and safe breaking; description remains one-line ellipsis.
- Studio vitrina host/grid/card chain now has `min-width: 0`, bounded width, and vertical-only scrolling with horizontal overflow hidden.
- Add/remove behavior, media dimensions, and `md`/`lg` styles were not changed.

## Closeout

- [x] Archive marker created.
- [x] P4 marked `[x]` in WAVE.
- [x] Active/ready P4 task removed.
- [x] Commit + push completed; SHA recorded in archive after closeout.
- closed_at: 2026-09-05
