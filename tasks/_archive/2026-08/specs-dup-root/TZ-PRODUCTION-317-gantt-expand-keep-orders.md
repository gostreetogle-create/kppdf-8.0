═══════════════════════════════════════════════════════════════
TZ-PRODUCTION-317: Gantt expand in-place — keep all orders visible
═══════════════════════════════════════════════════════════════

STATUS: READY
SOURCE: PO 2026-08-15 screenshot — click ORD-004 → others vanished; composition bars did not appear under row
РОЛЬ АГЕНТА: Frontend
ЗАВИСИМОСТИ: TZ-PRODUCTION-314 DONE
LAYER: 3
PAGES: /production
PAGE_DOCS: production-cockpit.page.md

CONFLICT KEYS:
frontend/src/app/pages/production/production-cockpit.page.ts ;
frontend/src/app/pages/production/production-cockpit.page.spec.ts ;
frontend/src/app/pages/production/blocks/gantt-bars.component.ts ;
frontend/src/app/pages/production/blocks/gantt-bars.component.spec.ts ;
docs/pages/production-cockpit.page.md ;
docs/agent-checklists/TZ-PRODUCTION-317.md ;
docs/pages/PAGE-TZ-INDEX.md ;
progress.md ;
tasks/_backlog/WAVE-PRODUCTION-GANTT-TREE.md

Проверено: `onSelect` → `applyBars([order])` filters Gantt to one order — root cause.
  Tree expand exists (`toggleExpand` / `expandedOrderIds`) but select kills multi-order list.

═══════════════════════════════════════════════════════════════
ПРОДУКТОВЫЙ LOCK
═══════════════════════════════════════════════════════════════

1. **Select order must NOT filter away other orders** on the Gantt.
   Keep `applyFilteredActive()` / multi-order bars; only highlight/select + open card.
2. **Expand in place:** clicking ▸ (and preferably clicking summary label) toggles expand;
   children rows appear **directly under** that summary; orders below **shift down**.
3. On select from summary: optionally **also expand** that order (UX: one click sees composition).
   Do not collapse others unless PO later asks accordion-only.
4. «Все активные» / filters still control which orders are in the list — selection ≠ filter.
5. Deep-link `?orderId=` may still scroll/highlight/open card; **must not** drop other filtered orders from bars (same rule).

═══════════════════════════════════════════════════════════════
ЧТО ДЕЛАТЬ
═══════════════════════════════════════════════════════════════

ШАГ 0 — CLAIM.
ШАГ 1 — Fix `onSelect` / reload paths: never `applyBars([order])` for selection;
  use full filtered set; set selectedOrderId + inspector + `setOrderExpanded(id, true)`.
ШАГ 2 — Ensure chevron + label expand work; jest: select keeps N summaries; expand adds children under.
ШАГ 3 — Docs one line; archive.

═══════════════════════════════════════════════════════════════
НЕ ИЗМЕНЯТЬ
═══════════════════════════════════════════════════════════════

- Bottom sheet layout (318)
- estimateStartOffsets / days APIs
- left flyouts Заказы/Фильтры

═══════════════════════════════════════════════════════════════
КРИТЕРИИ ПРИЁМКИ
═══════════════════════════════════════════════════════════════

1. With ≥2 active orders: click one → all summaries remain; children appear under clicked order.
2. Other orders shift down, do not disappear.
3. Card may open; Gantt still multi-order.
4. FE tsc + jest cockpit|gantt PASS; archive + report.

FINALIZE: GEMINI.md + tasks/_archive/2026-08/
