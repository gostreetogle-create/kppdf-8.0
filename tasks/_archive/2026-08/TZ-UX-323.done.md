# TZ-UX-323 DONE — Gantt tools into app chrome-rail

```
ARCHIVE_MARKER
task: TZ-UX-323
outcome: DONE
closed_at: 2026-08-15T14:35:00Z
closed_by: Buffy continuous executor
workspace: D:\kppdf-8.0
wave: WAVE-UX-CHROME-GANTT-TOOLS
depends: TZ-UX-322 DONE
verification:
  - pnpm exec tsc -p tsconfig.app.json --noEmit PASS
  - Jest production + app-layout + chrome 14/14 PASS
  - git diff --check PASS
  - no production-studio-rail in production-cockpit template
  - deploy: NOT EXECUTED
protected:
  - frontend/src/app/pages/production/production-cockpit.page.ts
  - frontend/src/app/pages/production/production-cockpit.page.spec.ts
  - frontend/src/app/shared/chrome/pi-chrome-tools.service.ts
  - docs/ux/production-gantt-studio-spec.md
  - docs/pages/production-cockpit.page.md
  - docs/pages/page-chrome.md
  - docs/agent-checklists/TZ-UX-323.md
```

## Delivered

- Production registers chrome tools (Заказы/Фильтры/Обновить | Карточка/Сегодня/Масштаб)
- Local 48px `production-studio-rail` columns deleted; studio-body single column
- Flyouts overlay at left:0 / right:0; Escape/backdrop/focus return 1:1
- SoT + page-chrome + SECTION-READINESS updated
- `untracked` around setTools in effect (avoid byOwner read/write loop)

## Wave

`WAVE-UX-CHROME-GANTT-TOOLS` score → 100

## known_limitation

- Chrome tools visible only ≥1680px (same as history ←→); below that rails hidden — no local 48px fallback by design.
- Browser geometry rect smoke not re-run in this closeout (Jest + source contract evidence).
