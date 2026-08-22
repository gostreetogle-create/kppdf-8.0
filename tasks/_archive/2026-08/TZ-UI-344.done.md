# TZ-UI-344 DONE — Photo lightbox kit + catalog wiring

- Status: DONE
- Closed: 2026-08-22T11:58:00+03:00
- Executor: `claude`
- Checklist: `docs/agent-checklists/TZ-UI-344.md`
- Plan: `docs/superpowers/plans/2026-08-22-photo-lightbox-kit.md`

## Delivered

- Added shared `PiPhotoLightboxComponent` in the existing photo UI kit.
- Uses the existing `PiDialogService` for focus trap, Escape, backdrop dismissal, and overlay lifecycle.
- Displays a single image with contain fitting, viewport-safe height, dark image surface, accessible label/alt text, explicit close action, and empty/broken-source fallback.
- Intentionally does not add zoom, pan, carousel, or mutation behavior.
- Added image-only activation to `PiShowcaseCardComponent` while preserving outer catalog links.
- Wired product/module showcase cards, composition-tree thumbnails, and product/module detail photos.
- Composition thumbnail activation stops propagation, so row select/expand behavior remains unchanged.
- Upload, delete, and set-main photo actions remain parent-owned and unchanged.
- KP preview surfaces were not modified.

## Verification

- FE typecheck: PASS.
- Focused lightbox/card/composition/catalog/detail Jest: **90/90 PASS**.
- Shared dialog service/component Jest: **23/23 PASS**.
- FE lint: PASS, 0 errors; 18 existing architecture warnings.
- Prettier check for touched FE files: PASS.
- Architecture check: PASS (979 files; baseline 6).
- TZ-path diff check: PASS.
- Full FE Jest: 1827/1835 PASS; 8 unrelated failures remain in `login.page.spec.ts` and `production-read.facade.spec.ts`.
- Live browser pass: BLOCKED because repository does not contain the documented `scripts/with_server.py` helper and no authenticated browser session was available. No browser PASS is claimed.

## Conflict disclosure

The workspace contained unrelated dirty backend/import-task, desktop/MCP, documentation, and other WIP paths. None were staged for this task.
