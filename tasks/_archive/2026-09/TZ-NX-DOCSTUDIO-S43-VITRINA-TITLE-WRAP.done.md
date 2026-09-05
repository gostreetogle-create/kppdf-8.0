# TZ-NX-DOCSTUDIO-S43-VITRINA-TITLE-WRAP

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-09-05
closed_by: Freebuff (Buffy)
verification:
  - acceptance criteria: PASS (sm titles clamp to two lines; no horizontal vitrina overflow)
  - focused tests: PASS (2 suites / 19 tests)
  - typecheck: PASS (kppdf-web app)
  - targeted lint: PASS (0 errors)
  - kppdf-web build: PASS (final P4 gate)
  - docs integrity: PASS (document-studio page contract updated; no route/API/permission change)
  - status synchronization: P4 marked [x] in WAVE

## Delivered

- `frontend-nx/libs/ui/paper-and-ink/src/lib/card/pi-showcase-card.component.ts`: only `size="sm"` titles changed from one-line ellipsis to two-line clamped wrapping; description remains one-line ellipsis; row/body/actions are width-safe.
- `frontend-nx/apps/kppdf-web/src/app/pages/studio/studio-data-vitrina.component.ts`: bounded host/grid/card widths, `min-width: 0`, and vertical-only grid scrolling with horizontal overflow hidden.
- Focused card and Data-panel regressions cover the title and overflow contracts.
- `docs/pages/document-studio.page.md` documents S43.

## Scope disclosure

- Add/remove behavior, media sizing, and `md`/`lg` card variants were not changed.
- Legacy `frontend/` and unrelated dirty DocStudio work were not staged.
