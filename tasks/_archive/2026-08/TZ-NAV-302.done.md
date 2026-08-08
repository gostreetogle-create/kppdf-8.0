# TZ-NAV-302 — IA people/work-types + section chips

**Outcome:** DONE  
**Date:** 2026-08-08  
**Cursor Verdict:** PASS (executor self / PO continuous lane B)

## Delivered

- Menu: `/work-types` → production (Цех); `/people` → clients (Клиенты)
- Highlight: `/people` = Клиенты; `/work-types` = Цех (jest matchActiveCategoryId)
- Chips (PiGroupWorkspace / reuse chrome): Клиенты · Цех · Сделки
- `/orders`: «+ Создать заказ» + empty hint; deals chips include Заказы from КП
- Catalog chips dropped people/work-types; new `*-group-chips.ts` for clients/production/deals
- Docs: nav-ia audit + PO-DIARY already aligned (§2)

## НЕ (as scoped)

- QuickCreate Order / FORM-302..305 / *form*dialog* / proposal form internals
- desktop/**; deploy

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-08T09:24:00Z
closed_by: agent-3e757640b7
verification:
  - acceptance criteria: PASS
  - typecheck: PASS (frontend tsc -p tsconfig.app.json --noEmit)
  - tests: PASS (jest app-layout.nav-order.spec.ts — 7 tests)
  - checklist: UPDATED
  - progress.md: UPDATED
cursor_verdict: PASS
agent_id: agent-3e757640b7
known_limitation: production cockpit uses inline chips (same visual tokens) to keep full-height gantt shell; not full PiGroupWorkspace wrap
