═══════════════════════════════════════════════════════════════
TZ-ACCESS-304: Nav pageKey filter на все разделы — DONE
═══════════════════════════════════════════════════════════════

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-04
closed_by: Cursor (verification + type harden, PO small-tech)
acceptance_status: PASS
verification:
  - NAV_CATEGORIES: все items имеют pageKey (typed AppNavItem)
  - navCategories computed: filter by user.pages + capabilities
  - frontend tsc --noEmit: PASS
protected_files:
  - frontend/src/app/layout/app-layout.component.ts
checklist: docs/agent-checklists/TZ-ACCESS-304.md
lock: .mimocode/locks/TZ-ACCESS-304-nav-pagekey-filter.lock
source: tasks/_backlog/TZ-ACCESS-304-nav-page-filter-all-sections.md (archived)

---

## Summary

Код ACCESS-302 уже фильтровал nav по pages[]. Этот TZ — completion AC:
`AppNavItem` требует `pageKey` на каждом пункте app-shell nav (kit menus
по-прежнему optional). Голых пунктов без pageKey в NAV_CATEGORIES нет.

known_limitation: deep-link route guards = ACCESS-303 (уже DONE).
