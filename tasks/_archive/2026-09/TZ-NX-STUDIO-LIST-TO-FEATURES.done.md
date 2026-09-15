# TZ-NX-STUDIO-LIST-TO-FEATURES — DONE

- **Status:** DONE
- **Agent:** freebuff
- **Closed:** 2026-09-15T12:20:00Z
- **Dependency:** `e736f413` (TZ-NX-STUDIO-LIST-FACADE)

## Delivered

- Moved `StudioListFacade` from `apps/kppdf-web/src/app/pages/studio/` to `libs/features/src/lib/doc-studio/`.
- Exported it from `@kppdf/features/doc-studio`.
- Updated `studio-list.page.ts` to import the facade from the feature library.
- Kept providers on the page and routes in the app; no behavior change.

## Scope guard

- No `registries/**` files changed.
- No `registry-forms/**` files changed.
- No registry-detail conflict files changed.

## Gates

- App TypeScript: PASS.
- Focused studio list/templates tests: PASS.
- `nx build features`: PASS.
- `nx lint features`: baseline FAIL due to existing repository lint violations.
- Final `nx build kppdf-web`: PASS; existing Angular nullish-coalescing and bundle/style budget warnings only.
