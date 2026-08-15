# TZ-PRODUCTION-313.done — Карточка flyout compact

```
ARCHIVE_MARKER
TZ: TZ-PRODUCTION-313
TITLE: Карточка flyout — убрать пустой gutter
OUTCOME: DONE
DATE: 2026-08-15
AGENT: gemini-executor-313
WIPE: none
EVIDENCE: progress.md · docs/agent-checklists/TZ-PRODUCTION-313.md
LOCK: .mimocode/locks/TZ-PRODUCTION-313-card-flyout-compact.lock
```

## What changed

- `.production-studio-flyout-card` width: `min(28rem)` → `min(22rem, calc(100% - 1rem))`
- `app-order-inspector` root: `w-[20rem] xl:w-[22rem]` → `w-full min-w-0`
- Docs: production-cockpit.page.md · PAGE-TZ-INDEX · WAVE-PRODUCTION-GANTT-RESIZE · progress

## Gates

- FE tsc PASS (`tsconfig.app.json --noEmit`)
- FE jest production-cockpit|gantt-bar **27 PASS**

## Out of scope (intentional)

- Gantt resize/drag (312)
- Chrome rails / PiChromeTools
- Backend
