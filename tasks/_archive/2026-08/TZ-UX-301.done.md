# TZ-UX-301 — Compact icon top nav

**Outcome:** DONE  
**Date:** 2026-08-08  
**Cursor Verdict:** PASS (executor self / PO continuous claim)  
**Canon:** `docs/audits/2026-08-08-chrome-nav-admin-smell.md`

## Delivered

- Top-nav categories: **icon-first** `size-9` + `hairline`; `title` + `aria-label` + `sr-only` label (tooltip on hover/focus)
- Active category: sunrise wash + `border-sunrise-warm` (not text-only)
- Right chrome: Desktop / Logout = icon-only `pi-icon-btn`; username `md+` truncate
- `PiNavDropdownComponent`: optional `[compact]="true"` icon trigger (kit menus unchanged)
- NAV-301 category order untouched; nav-order jest PASS

## НЕ (as scoped)

- Admin roles / production cockpit / deploy
- Mobile hamburger (known_limitation out of P0)

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-08T08:22:00Z
closed_by: agent-3e757640b7
verification:
  - acceptance criteria: PASS
  - typecheck: PASS (frontend tsc -p tsconfig.app.json --noEmit)
  - tests: PASS (jest app-layout.nav-order 1/1)
  - checklist: UPDATED
  - progress.md: UPDATED
cursor_verdict: PASS
agent_id: agent-3e757640b7
