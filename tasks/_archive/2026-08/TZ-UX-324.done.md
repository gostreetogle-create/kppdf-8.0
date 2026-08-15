# TZ-UX-324 DONE — Chrome-rail history ↔ page-tools gap + visual split

```
ARCHIVE_MARKER
task: TZ-UX-324
outcome: DONE
closed_at: 2026-08-15T15:00:00Z
closed_by: cursor-composer-executor
workspace: D:\kppdf-8.0
depends: TZ-UX-322/323 DONE
verification:
  - pnpm exec tsc -p tsconfig.app.json --noEmit PASS
  - Jest app-layout.component.spec.ts 7/7 PASS
  - git diff --check PASS (TZ paths)
  - deploy: NOT EXECUTED
protected:
  - frontend/src/app/layout/app-layout.component.ts
  - frontend/src/app/layout/app-layout.component.spec.ts
  - docs/pages/page-chrome.md
  - docs/agent-checklists/TZ-UX-324.md
```

## Delivered

- Spacer `data-test="chrome-rail-tools-gap"` (32px, aria-hidden) between history ←/→ and page-tools; only when that side has tools
- Page-tool class `app-chrome-page-tool`: muted paper-2 / rule vs raised history
- Active page-tool remains readable (paper-3 + rule-strong)
- `page-chrome.md` documents history → spacer → tools + visual split + classes
- Jest covers gap presence/absence by side

## known_limitation

- Spacer adds flex gap(8)+32+gap(8); intentional “skip one button” feel, not pixel-perfect empty slot math alone.
- Production flyout registration untouched (layout CSS/classes only).
