# TZ-NX-REGISTRIES-COMPOSITION-PARITY-WAVE-1 checklist

> Status: **DONE**

## Claim slot

- (cleared)

## Acceptance

- [x] Composition add targets selected nested parent (not root when nested selected)
- [x] focusComposition scrolls composition block into view
- [x] Dialog lifetime host-scoped (`provideRegistriesCatalog` on page)
- [x] Details filter honest default (`part`, not false «Все»)
- [x] Locked materialKind preserved after patch; dimension remove aria-label
- [x] getById before edit for module/product/material
- [x] Regression tests + gates PASS

## Integrity slot

- [x] `docs/pages/registries.page.md` updated (filters/actions/limitations)
- [x] No backend/schema/permission changes
- [x] `/constructor` preserved; no legacy `boms` write path
- [x] Test specs updated for page-scoped catalog provider (`overrideComponent`)

## Executor report

PASS — closed 2026-08-29. See `tasks/_archive/2026-08/TZ-NX-REGISTRIES-COMPOSITION-PARITY-WAVE-1.done.md`.

Key fixes: nested composition add endpoint; `scrollCompositionBlockIntoView`; page `DestroyRef` for registry dialogs; Details `emptyOptionLabel`; async `getById` before edit dialogs.
