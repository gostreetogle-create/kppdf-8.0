═══════════════════════════════════════════════════════════════
TZ-PRODUCTION-303: Cockpit shell + orders rail + Gantt bars — DONE
═══════════════════════════════════════════════════════════════

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-06
closed_by: cursor-composer (PO «добиваем до конца»)
acceptance_status: PASS
verification:
  - FE jest production|gantt|cockpit: 4 suites / 14 tests PASS
  - FE tsc -p tsconfig.app.json --noEmit: PASS
  - BE tsc -p tsconfig.build.json --noEmit: PASS
  - Browser smoke: PO after land (see production-cockpit.page.md §Smoke)
checklist: docs/agent-checklists/TZ-PRODUCTION-303.md
lock: .mimocode/locks/TZ-PRODUCTION-303-gantt-board-page.lock
source_was: tasks/_active/TZ-PRODUCTION-303.md
backlog: tasks/_backlog/TZ-PRODUCTION-303-gantt-board-page.md
audit: tasks/_backlog/TZ-PRODUCTION-303-gantt-board-page.audit-2026-08-06.md
next: TZ-PRODUCTION-304+ after PO browser smoke

---

## Summary

Production Cockpit Lego #1: `/production` dense shell, orders rail (ACTIVE_COMMERCIAL + selected RO), Gantt plan-estimate bars from Order→Product→Module→WorkType.days via FE read facade (lock H). Quantity ×N display only. PAGE_KEYS.production + seed + director GET Roles (lock J). No ProductionOrder/OrderTask. Lifecycle north-star (КП→заказ→Гант auto/manual→склад) documented in PO-DIARY + design; not in 303 scope.

## Known limitations

Worker column = «—». No ProductionSchedule / assign writes / stuck / check-in. Demo seed for e2e = later.
