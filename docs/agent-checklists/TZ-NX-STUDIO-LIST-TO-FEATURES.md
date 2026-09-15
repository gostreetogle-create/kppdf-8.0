# TZ-NX-STUDIO-LIST-TO-FEATURES checklist

> Status: **DONE**
> Marker: `tasks/_active/TZ-NX-STUDIO-LIST-TO-FEATURES.md` (removed on closeout)

## Claim slot

- agent_id: freebuff
- claimed_at: 2026-09-15T17:00:00+03:00
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (no team-room CLI exposed)

## Preflight

- [x] `_NOW.md` / `tasks/_active/` checked; registry DETAIL conflict excluded
- [x] Dependency `e736f413` archived and committed
- [x] `@kppdf/features/doc-studio` index and local `on-dialog-close-once` helper read
- [x] Claim slot filled before feature-move edits

### Preflight Check Output
- **Context read:** `tasks/_ready/2026-09-15-decomp-b9-registry-hubs-lists/WAVE-MAP.md`, `tasks/_ready/2026-09-15-decomp-b9-registry-hubs-lists/TZ-NX-STUDIO-LIST-TO-FEATURES.md` (captured before concurrent removal), `frontend-nx/libs/features/src/lib/doc-studio/index.ts`, `frontend-nx/libs/features/src/lib/doc-studio/ui/on-dialog-close-once.ts`, `frontend-nx/apps/kppdf-web/src/app/pages/studio/studio-list.page.ts`
- **Key Constraints:** move facade into `@kppdf/features/doc-studio`; routes stay in app; no behavior change; do not touch registries or registry-forms.
- **Delivered:** feature-library facade move, public export, app import update, and no app-local facade remains.
- **Validation Path:** focused specs, frontend-nx tsc/lint, final `nx build kppdf-web`, Integrity slot.

## Acceptance

- [x] `StudioListFacade` is exported by `@kppdf/features/doc-studio`.
- [x] App page imports facade from feature library; no app-local facade remains.
- [x] Studio list/templates specs remain green; routes stay in app.
- [x] No registries or registry-forms files touched.

## Integrity slot

- [x] Type: feature-library refactor
- [x] FIC N/A: no route/API/capability change
- [x] page.md N/A: behavior unchanged
- [x] DOMAIN-MAP N/A
- [x] SECTION-READINESS N/A
- [x] No чужой WIP staged; conflict keys respected
- [x] COUPLING-MAP N/A

## Gates

- [x] `pnpm exec tsc -p apps/kppdf-web/tsconfig.app.json --noEmit` — PASS
- [x] focused `nx test kppdf-web apps/kppdf-web/src/app/pages/studio/studio-list.page.spec.ts apps/kppdf-web/src/app/pages/studio/studio-templates-list.page.spec.ts` — PASS
- [x] `nx build features` — PASS
- [x] `nx lint features` — baseline FAIL (pre-existing repository lint violations)
- [x] `nx build kppdf-web` — PASS; existing Angular/budget warnings only

## Executor report

- Moved `StudioListFacade` from the app page directory into `@kppdf/features/doc-studio`.
- Exported the facade through the feature public index and updated the app page import.
- Preserved page providers and behavior; no registries or registry-forms paths changed.

## Closeout

- [x] archive + remove `_active`
- [x] Status = DONE
- closed_at: 2026-09-15T12:20:00Z
