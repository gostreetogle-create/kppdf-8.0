═══════════════════════════════════════════════════════════════
TZ-ARCHIVE-301: Immutable lifecycle links (S7)
═══════════════════════════════════════════════════════════════

STATUS: BACKLOG (parked) — не active в tasks/ до PO un-park.
SOURCE: docs/compose/plans/2026-08-02-shop-customer-lifecycle.md §2 S7 / §7 #15
MODE A: Q10 → per-shipment archive card; order links many shipments

РОЛЬ АГЕНТА: Backend archive links + read-only UI
ЗАВИСИМОСТИ: TZ-SHIPPING-301
LAYER: 4

CONFLICT KEYS:
archive / generated docs links;
order/shipment freeze writes;
docs/agent-checklists/TZ-ARCHIVE-301.md

═══════════════════════════════════════════════════════════════
ИСХОДНОЕ СОСТОЯНИЕ
═══════════════════════════════════════════════════════════════

После dispatch нужен immutable archive card per shipment со ссылками
КП / Order / Shipment. Forever read-only.

═══════════════════════════════════════════════════════════════
ЧТО ДЕЛАТЬ
═══════════════════════════════════════════════════════════════

ШАГ 1 — Archive record + links KP/Order/Shipment.
ШАГ 2 — Freeze writes (reject updates after archive).
ШАГ 3 — UI read-only card.

═══════════════════════════════════════════════════════════════
КРИТЕРИИ ПРИЁМКИ
═══════════════════════════════════════════════════════════════

1. No edits after archive (API rejects).
2. Links navigate to historical snapshots / docs.
3. Executor report.

known_limitation: —
ПРОМПТ: GEMINI.md + этот файл. Push: по PO.
