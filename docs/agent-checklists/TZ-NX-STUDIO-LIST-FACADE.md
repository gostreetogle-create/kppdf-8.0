# TZ-NX-STUDIO-LIST-FACADE checklist

> Status: **DONE**
> Marker: `tasks/_active/TZ-NX-STUDIO-LIST-FACADE.md`

## Claim slot

- agent_id: freebuff
- claimed_at: 2026-09-15T16:35:00+03:00
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (no team-room CLI exposed)

## Preflight

- [x] `_NOW.md` and `tasks/_active/` checked; registry DETAIL conflict keys excluded
- [x] TZ, WAVE-MAP, page doc, studio-list page/specs, templates-list page/specs read
- [x] Signals Facade/page-scoped provider and no-behavior-change constraints recorded
- [x] Claim slot filled before further product-code edits

### Preflight Check Output
- **Context read:** `docs/how-to-connect-ai.md`, `GEMINI.md`, `.agents/skills/kppdf-executor-loop/SKILL.md`, `.agents/skills/kppdf-context-preflight/SKILL.md`, `docs/PROJECT-MEMORY.md`, `docs/PO-CANON.md`, `docs/agent-checklists/_NOW.md`, `tasks/_active/TZ-NX-REGISTRY-DETAIL-TO-FEATURES.md`, `tasks/_ready/2026-09-15-decomp-b9-registry-hubs-lists/WAVE-MAP.md`, `tasks/_ready/2026-09-15-decomp-b9-registry-hubs-lists/TZ-NX-STUDIO-LIST-FACADE.md`, `docs/pages/document-studio.page.md`, `frontend-nx/apps/kppdf-web/src/app/pages/studio/studio-list.page.ts`, `frontend-nx/apps/kppdf-web/src/app/pages/studio/studio-list.page.spec.ts`, `frontend-nx/apps/kppdf-web/src/app/pages/studio/studio-templates-list.page.ts`, `frontend-nx/apps/kppdf-web/src/app/pages/studio/studio-templates-list.page.spec.ts`
- **Key Constraints:** page-scoped `StudioListFacade` provider; Signals; no behavior/UX/API changes; do not touch `registries/**` or `registry-forms/**`.
- **Planned Deliverable:** finish facade extraction; make page a thin host; retain specs and exported constants; run focused tests/tsc/lint/build with build last.
- **Validation Path:** focused studio-list and templates-list specs, frontend-nx tsc/lint, `nx build kppdf-web` last, Integrity slot.

## Acceptance

- [x] `StudioListFacade` owns list/filter/select/bulk-delete/create/duplicate orchestration.
- [x] `StudioListPage` is a thin OnPush host with `providers: [StudioListFacade]`.
- [x] Existing studio-list behavior/specs remain green.
- [x] No registries or registry-forms files touched.

## Integrity slot

- [x] Type: refactor / page facade
- [x] FIC N/A: no route/API/capability change
- [x] `document-studio.page.md`: N/A (behavior unchanged)
- [x] DOMAIN-MAP: N/A
- [x] SECTION-READINESS: N/A
- [x] No чужой WIP staged; conflict keys respected
- [x] COUPLING-MAP: N/A

## Build integrity

- [x] Baseline `nx build kppdf-web` — PASS (exit 0)
- [x] Closing `nx build kppdf-web` is last gate — PASS (exit 0)

## Gates

- `pnpm exec tsc -p apps/kppdf-web/tsconfig.app.json --noEmit` — PASS (exit 0)
- `pnpm exec nx test kppdf-web apps/kppdf-web/src/app/pages/studio/studio-list.page.spec.ts` — PASS (12/12)
- `pnpm exec nx test kppdf-web apps/kppdf-web/src/app/pages/studio/studio-templates-list.page.spec.ts` — PASS (8/8)
- `pnpm exec nx lint kppdf-web` — baseline FAIL: existing lazy `features` boundary/accessibility errors; no new studio-list warning after cleanup
- `pnpm exec nx build kppdf-web` — PASS (exit 0, last gate; existing warnings only)

## Executor report

- Extracted page-scoped `StudioListFacade`; page remains OnPush and template behavior is unchanged.
- Facade owns list/filter/selection/bulk-delete/template/create/duplicate/delete orchestration and dialogs.
- Conflict disclosure: registry DETAIL active TZ and unrelated dirty/WIP files were not touched or staged.

## Closeout

- [x] archive + remove `_active`
- [x] Status = DONE
- closed_at: 2026-09-15T16:50:00+03:00
