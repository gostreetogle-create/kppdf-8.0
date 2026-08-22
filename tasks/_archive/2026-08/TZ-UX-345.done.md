TZ-UX-345: Chrome-rail visible at operator width (≥1024px)
═══════════════════════════════════════════════════════════
Status: DONE
Agent: freebuff
Completed: 2026-08-22

What changed:
- app-layout.component.ts: media query 1680px → 1024px for .app-chrome-rail display
- app-layout.component.ts: added background var(--color-paper-2) + inner border (left→border-right, right→border-left) for menu-strip feel
- products.page.ts: .products-chrome-fallback hide threshold 1680→1024
- modules.page.ts: .modules-chrome-fallback hide threshold 1680→1024
- materials.page.ts: .materials-chrome-fallback hide threshold 1680→1024
- app-layout.component.spec.ts: assertion 1680px → 1024px
- Updated comments referencing 1680px threshold

Gates:
- FE tsc PASS (0 errors)
- Jest: 99/99 (7 suites) PASS
- Lint: 0 errors

Known limitation: Gantt <1024 without chrome-tools fallback — separate successor TZ.
