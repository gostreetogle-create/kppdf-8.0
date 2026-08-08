# TZ-UX-307 — Nav shorter labels + compact height

**Outcome:** DONE  
**Date:** 2026-08-08  
**Cursor Verdict:** PASS (executor self / PO CLAIM as «306» → canon ID **307**)  
**Source:** `tasks/_backlog/TZ-UX-307-nav-shorter-labels-compact-height.md`  
**Note:** PO said TZ-UX-306; repo renumbered to **307** because `TZ-UX-306` = people-route archive.

## Delivered

- Header row `h-14`; nav triggers `h-10` (was h-16 / h-12)
- Icon 12px; caption `text-[9px] leading-none`; gap `gap-px`; tighter padding
- Restored `shortLabel` per TZ table: Проект / Снабж. / Цех / Докум. / Справ. / Админ…
- Full RU in `label` → aria-label + title (Администрирование, Проектирование, …)
- Equal-width grid kept (`auto-cols-fr` + `w-max`) sized from short captions
- `PiNavDropdownComponent`: `shortLabel` input; compact h-10
- Order L→R unchanged (304/305); jest asserts short + full labels
- Audit note updated for UX-307 compact shortLabel canon

## НЕ (as scoped)

- admin/** pages
- QuickCreate / dialogs
- Deploy

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-08T08:42:00Z
closed_by: agent-3e757640b7
verification:
  - acceptance criteria: PASS
  - typecheck: PASS (frontend tsc -p tsconfig.app.json --noEmit)
  - tests: PASS (jest app-layout.nav-order 2/2)
  - checklist: UPDATED
  - progress.md: UPDATED
cursor_verdict: PASS
agent_id: agent-3e757640b7
known_limitation: extreme narrow viewports may still scroll-x the nav
