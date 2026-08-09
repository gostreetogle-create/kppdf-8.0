# TZ-PHOTO-302 checklist

> Status: **DONE**
> Source: `tasks/_backlog/perf/TZ-PHOTO-302-lists-use-thumb.md`
> Wave: `tasks/_backlog/perf/WAVE-PERF-PHOTOS.md`
> DEPENDS ON: TZ-PHOTO-301 DONE
> Commit/push: **YES**

## Claim slot

- agent_id: agent-3e757640b7
- claimed_at: 2026-08-09T01:46:40Z
- workspace: D:\\kppdf-8.0
- team_room_claim: unavailable — Team Room registry reports Unknown task `TZ-PHOTO-302`
- closed_at: 2026-08-09T01:50:47Z

## Preflight

- [x] Get-Location + git rev-parse → `D:\\kppdf-8.0`, branch `main`
- [x] `main` synchronized with the pushed TZ-PHOTO-301 checkpoint at `bf74f617`
- [x] `_active-map.md` + `tasks/_active/` checked; no conflicting active claim
- [x] TZ, wave and dependency `TZ-PHOTO-301` archive read
- [x] Claim slot filled before product code
- [x] Pickers, backend upload, PAGE_SIZE, layout and business logic explicitly excluded

## Conflict keys

- `frontend/src/app/shared/services/photos.service.ts`
- `frontend/src/app/shared/services/photos.service.spec.ts`
- `frontend/src/app/pages/products/products.page.ts`
- `frontend/src/app/pages/materials/materials.page.ts`
- `frontend/src/app/pages/modules/modules.page.ts`
- `frontend/src/app/pages/production/production-read.facade.ts`
- `frontend/src/app/shared/ui/card/pi-showcase-card.component.ts`
- `frontend/src/app/pages/products/products.page.spec.ts`
- `frontend/src/app/pages/materials/materials.page.spec.ts`
- `frontend/src/app/pages/materials/materials.page-316.spec.ts`
- `docs/pages/products.page.md`
- `docs/pages/materials.page.md`
- `progress.md`
- `STATUS.md`
- `docs/agent-checklists/_active-map.md`

## Acceptance

- [x] Shared `photoListUrl` prefers a direct or linked `thumb` and falls back to original
- [x] `/products` table photo cell uses the helper
- [x] `/products` grid/showcase uses the helper
- [x] `/materials` list photo cell uses the helper
- [x] `/modules` audit completed: current module list has no photo surface
- [x] `/production` read-facade catalogue/order thumb path uses the helper where photo data is available
- [x] Grep audit recorded remaining direct `storageUrl` usages as detail/form/lightbox or photo-picker exceptions
- [x] PAGE_SIZE, layout, pickers, backend upload and business logic unchanged
- [x] Frontend tsc PASS
- [x] Focused products/materials/production/photo specs PASS: 5 suites / 33 tests

## Gates (fact)

| Gate | Result |
|------|--------|
| `pnpm exec tsc -p tsconfig.app.json --noEmit` | PASS |
| `pnpm exec jest src/app/shared/services/photos.service.spec.ts src/app/pages/products/products.page.spec.ts src/app/pages/materials/materials.page.spec.ts src/app/pages/materials/materials.page-316.spec.ts src/app/pages/production/production-read.facade.spec.ts --runInBand --no-coverage` | PASS — 5 suites / 33 tests; existing Angular NG0101 console noise in materials harness is non-failing |
| `pnpm exec eslint` on changed FE files | PASS |
| `pnpm exec prettier --check` on changed FE files | PASS |
| `git diff --check` | PASS |
| `bash OrchestratorKit/verify-status.sh` | pre-existing FAIL — 72 legacy kit-era archive/STATUS mismatches outside this TZ |

## Executor report

- Added one shared `photoListUrl` selector with legacy fallback and support for both `parentPhotoId` and reverse `linkedPhotoId` relations.
- Products table and grid now use the selector; Materials list resolves populated photos through the same selector; Production order/catalogue thumb extraction uses it where product/module photo data is present.
- `/modules` list was audited and has no list/grid photo surface; module detail, product/material detail, form dialogs and photo picker intentionally retain original URLs for large previews/editing.
- No picker behavior, upload pipeline, payload, Product/Material business logic, layout, PAGE_SIZE, or backend code was changed.
- Known pre-existing issue: `verify-status.sh` reports 72 legacy kit-era mismatches.

## Closeout

- [x] archive + lock + progress + remove `_active`
- [x] Status/wave/queue synchronization
- [x] Page docs updated
- [x] Status = DONE
- closed_at: 2026-08-09T01:50:47Z
