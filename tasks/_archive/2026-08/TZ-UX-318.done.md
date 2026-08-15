# TZ-UX-318 DONE — KP columns checkbox menu stay-open

```
ARCHIVE_MARKER
task: TZ-UX-318
outcome: DONE
closed_at: 2026-08-15
closed_by: Buffy (closeout)
workspace: D:\kppdf-8.0
implementation_sha: 9bd27f11a644384e48d5c26488d70573cdfda7fc
docs_sha: 2340979af9d5fa792d179f30153a8ff1cbb19278
confirm_sha: d4426510e26525315b321e982ed6e9cf3b686b6d
commits:
  - 9bd27f11 — fix(ux): keep KP columns checkbox menu open across toggles
  - 2340979a — docs(ux): record TZ-UX-318 implementation SHA for review
  - d4426510 — docs(ux): confirm TZ-UX-318 pushed to origin/main
verification:
  - acceptance criteria: PASS (см. checklist docs/agent-checklists/TZ-UX-318.md)
  - frontend tsc: PASS
  - Cursor verdict: PASS (browser smoke «Колонки» ≥2 toggles stay-open → outside closes)
  - checklist: DONE
  - progress.md: UPDATED
  - active marker: removed after archive
  - deploy: NOT EXECUTED
protected:
  - frontend/src/app/features/proposals/proposal-create/proposal-create-table-editor.component.ts
    (columns checkbox dropdown: no mouseleave / no close-on-toggle; close only outside/Escape/trigger/More/scroll)
  - docs/pages/ui-overflow-select.md (stay-open canon for checkbox multi-panels)
  - docs/pages/proposals-create.page.md
  - docs/pages/PAGE-TZ-INDEX.md
```

## Delivered

- «Колонки» on `/proposals/create`: multiple checkbox toggles without reopening the menu.
- Menu closes only on outside-click / Escape / trigger toggle / opening «Ещё» / table-wrap scroll.
- RU canon in `ui-overflow-select.md` for checkbox multi-panel stay-open behavior.

## НЕ

- Deploy / wipe
- CDK Overlay migration (ad-hoc dropdown remains; known_limitation)
- «Ещё» menu mouseleave behavior unchanged
