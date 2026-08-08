# TZ-UX-305 — Nav equal width + full RU labels

**Outcome:** DONE  
**Date:** 2026-08-08  
**Cursor Verdict:** PASS (executor self / PO continuous claim)  
**Source:** `tasks/_backlog/TZ-UX-305-nav-equal-width-full-labels.md`  
**Note:** archive name suffix avoids collision with older docs-only `TZ-UX-305.done.md` (page.md sync, 2026-08-02).

## Delivered

- Removed `shortLabel` as primary caption; full RU under icon (`Проектирование`, `Справочники`, …)
- Equal-width category columns: inner `grid grid-flow-col auto-cols-fr w-max` (width = longest label + padding)
- `PiNavDropdownComponent` compact: full `label`, `host.contents` so trigger is the grid cell; drop min/max width clamp
- Slightly roomier frame (`px-2 py-1.5`, `gap-1`); caption `text-[9px]` below 1280 → `text-[10px]` from 1280+
- Right chrome (Desktop/Logout) stays outside the equal-width grid (`shrink-0`)
- Order from UX-304 unchanged; nav-order jest asserts full labels

## НЕ (as scoped)

- admin/** (peer ADMIN-302 / users WIP left alone)
- Deploy

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-08T08:35:00Z
closed_by: agent-3e757640b7
verification:
  - acceptance criteria: PASS
  - typecheck: PASS (frontend tsc -p tsconfig.app.json --noEmit; peer admin WIP isolated)
  - tests: PASS (jest app-layout.nav-order 2/2)
  - checklist: UPDATED
  - progress.md: UPDATED
cursor_verdict: PASS
agent_id: agent-3e757640b7
known_limitation: extreme narrow viewports may scroll-x the nav; no shortLabel fallback in this TZ
