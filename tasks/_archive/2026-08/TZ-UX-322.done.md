# TZ-UX-322 DONE — Chrome page-tools API (L/R app rails)

```
ARCHIVE_MARKER
task: TZ-UX-322
outcome: DONE
closed_at: 2026-08-15T14:20:00Z
closed_by: Buffy continuous executor
workspace: D:\kppdf-8.0
wave: WAVE-UX-CHROME-GANTT-TOOLS
verification:
  - pnpm exec tsc -p tsconfig.app.json --noEmit PASS
  - Jest app-layout + pi-chrome-tools 8/8 PASS
  - git diff --check PASS
  - deploy: NOT EXECUTED
protected:
  - frontend/src/app/layout/app-layout.component.ts
  - frontend/src/app/layout/app-layout.component.spec.ts
  - frontend/src/app/shared/chrome/pi-chrome-tools.service.ts
  - frontend/src/app/shared/chrome/pi-chrome-tools.service.spec.ts
  - frontend/src/app/shared/chrome/pi-chrome-tools.types.ts
  - docs/pages/page-chrome.md
  - docs/agent-checklists/TZ-UX-322.md
```

## Delivered

- `PiChromeToolsService` root: `setTools(ownerId)` / `clear(ownerId)` → `leftTools` / `rightTools`
- AppLayout renders page tools under ←/→ with `chrome-tool-{id}`, RU aria/title, `.is-active`
- Pages without setTools unchanged (history only)
- Docs: page-chrome projection canon; first consumer TZ-UX-323
- BAN honored: production-cockpit not touched

## Successor

`TZ-UX-323-gantt-tools-into-chrome-rail.md`
