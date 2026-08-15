═══════════════════════════════════════════════════════════════
TZ-PRODUCTION-314: Gantt — order summary row + expand composition
═══════════════════════════════════════════════════════════════

STATUS: DONE
SOURCE: PO 2026-08-15 (сводная полоса → раскрытие состава как в таблице изделий)
РОЛЬ АГЕНТА: Frontend
ЗАВИСИМОСТИ: TZ-PRODUCTION-311/312/313 DONE
LAYER: 3
PAGES: /production
PAGE_DOCS: production-cockpit.page.md

CONFLICT KEYS:
frontend/src/app/pages/production/gantt-bar.model.ts ;
frontend/src/app/pages/production/gantt-bar.model.spec.ts ;
frontend/src/app/pages/production/blocks/gantt-bars.component.ts ;
frontend/src/app/pages/production/blocks/gantt-bars.component.spec.ts ;
frontend/src/app/pages/production/production-cockpit.page.ts ;
frontend/src/app/pages/production/production-cockpit.context.ts ;
docs/pages/production-cockpit.page.md ;
docs/ux/production-gantt-studio-spec.md (короткая правка § tree) ;
docs/agent-checklists/TZ-PRODUCTION-314.md ;
docs/pages/PAGE-TZ-INDEX.md ;
progress.md ;
tasks/_backlog/WAVE-PRODUCTION-GANTT-TREE.md

Проверено: сейчас flat list всех work-type bars; buildGanttBars sequential;
  products list expand pattern = UX analogy only (не копировать pi-table API слепо).

═══════════════════════════════════════════════════════════════
ПРОДУКТОВЫЙ LOCK
═══════════════════════════════════════════════════════════════

1. **Default view:** одна строка на заказ = **summary bar**:
   - label: номер заказа (+ status pip);
   - span: `min(child.startDate) … max(child.endDate)` (общий срок);
   - fill: нейтральный ink/muted **или** segmented multi-color preview (optional nice);
   - duration label: суммарные календарные дни span (end-start+1), не сумма days если overlap later.
2. **Expand** (chevron / клик по label row, не обязательно по полосе):
   - под summary появляются child rows = текущие work-type bars (цвет, resize, …);
   - collapse прячет children.
3. State: `expandedOrderIds: Set` в `ProductionCockpitContext` (переживает фильтры в сессии; F5 reset ok).
4. Multi-order «Все активные»: N summary rows; expand независимо.
5. **Жесты на summary:**
   - body-drag → plannedDate (как 312) — сдвигает всю оценку заказа;
   - **нет** right-resize на summary в этом TZ (длительность = derived; менять через children).
6. **Жесты на children:** resize days (311) сохраняется; body-drag plannedDate на child **отключить** в этом TZ
   (иначе путаница) — вернуть независимый move в **316**.
7. Клик summary без drag → select order + можно открыть карточку (существующий selectOrder).
8. RU: заголовок колонки «Заказ» / при expand «Заказ · работа»; hint «Разверните заказ, чтобы править виды работ».

═══════════════════════════════════════════════════════════════
ЧТО ДЕЛАТЬ
═══════════════════════════════════════════════════════════════

ШАГ 0 — CLAIM.
ШАГ 1 — Pure helpers: `buildOrderSummaryBar(children): GanttBar|summary DTO`; group bars by orderId.
ШАГ 2 — gantt-bars render tree: summary (+ optional indent children); expand control a11y.
ШАГ 3 — Wire context expanded set; cockpit select/expand UX.
ШАГ 4 — Jest: collapsed = 1 row/order; expand shows children; summary span math.
ШАГ 5 — Docs + archive. **Не** start-offset schema (316). **Не** bottom sheet (315) unless same agent batch after.

═══════════════════════════════════════════════════════════════
НЕ ИЗМЕНЯТЬ
═══════════════════════════════════════════════════════════════

- BE schema estimateDayOverrides
- parallel free scheduling (316)
- Карточка position (315)
- fact production

═══════════════════════════════════════════════════════════════
КРИТЕРИИ ПРИЁМКИ
═══════════════════════════════════════════════════════════════

1. По умолчанию видны только summary rows (один бар на заказ = общий срок).
2. Expand показывает состав Ганта; collapse убирает.
3. Summary body-drag → plannedDate; child resize → estimate-days; child body-drag plannedDate off.
4. FE tsc + jest gantt-bar|gantt-bars|cockpit PASS.
5. Archive + lock + Executor report (full SHA).

known_limitation: children still sequential pack until 316; no bottom card yet.

FINALIZE: GEMINI.md + tasks/_archive/2026-08/
