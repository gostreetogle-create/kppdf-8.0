# TZ-UX-304 — Nav icon+caption rect + L→R order

**Outcome:** DONE  
**Date:** 2026-08-08  
**Cursor Verdict:** PASS (executor self / PO continuous claim)  
**Canon:** `docs/audits/2026-08-08-nav-ia-lifecycle-audit.md` §3

## Delivered

- Top-nav items: **rect** (`min-w-[2.75rem]`…`max-w-[3.25rem]` / `h-12`) — icon top (~14px) + caption bottom (`text-[10px]`, truncate); `shortLabel` for long RU (Проект./Снабж./Произв./Докум./Справ.)
- Full `label` in `aria-label` + `title`; right chrome (Desktop/Logout) stays square `pi-icon-btn`
- Header `h-16` for caption row
- Order L→R: catalog → clients → deals → design → supply → production → warehouse → docs → **reference** → admin
- `PiNavDropdownComponent` compact = same icon+caption language + `shortLabel` input
- Audits + nav-order jest updated

## НЕ (as scoped)

- admin/** (ADMIN-301 peer)
- production deep / deploy

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-08T08:28:00Z
closed_by: agent-3e757640b7
verification:
  - acceptance criteria: PASS
  - typecheck: PASS (frontend tsc -p tsconfig.app.json --noEmit)
  - tests: PASS (jest app-layout.nav-order 1/1)
  - checklist: UPDATED
  - progress.md: UPDATED
cursor_verdict: PASS
agent_id: agent-3e757640b7
known_limitation: long words use shortLabel under icon; full RU in aria/title
