# TZ-NX-REGISTRIES-COMPOSITION-DIALOG checklist

> Status: **DONE** (Phase A+B + Phase 2)

## Claim slot

- (cleared)

## Acceptance

- [x] Phase A header cleanup + inset
- [x] Module/Product composition dialogs + registry actions
- [x] Phase 2: lineId fix, derived Комплекс, dirty guard ESC/backdrop
- [x] Component + integration tests
- [x] Gates PASS

## Integrity slot

- [x] registries.page.md updated (Phase B)
- [x] composition-line-resolve shared (no Module/Product logic duplication)

## Executor report

PASS — Phase 2 closed 2026-08-29. See `tasks/_archive/2026-08/TZ-NX-REGISTRIES-COMPOSITION-DIALOG.done.md`.

Key fixes: composition PATCH/DELETE via line `_id`; nested parent composition fetch; `dismissOnEscape`/`dismissOnBackdropClick` false on registry dialogs.
