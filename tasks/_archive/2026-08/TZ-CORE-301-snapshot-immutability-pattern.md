═══════════════════════════════════════════════════════════════
TZ-CORE-301: Snapshot-on-transition immutability pattern
═══════════════════════════════════════════════════════════════

STATUS: BACKLOG (parked) — не active в tasks/ до PO un-park.
SOURCE: docs/compose/plans/2026-08-02-shop-customer-lifecycle.md §3 / §7 #16
NOTE: Proposed ID TZ-Z-007 occupied by RBAC (Z-007). This file = CORE-301.

РОЛЬ АГЕНТА: Backend Architect
ЗАВИСИМОСТИ: none (foundational); precedes ORDERS/PRODUCTION chain
LAYER: 4

CONFLICT KEYS:
backend/src/common/ (snapshot helper / session patterns);
docs/compose/specs/;
ARCHITECTURE.md;
docs/agent-checklists/TZ-CORE-301.md

═══════════════════════════════════════════════════════════════
ИСХОДНОЕ СОСТОЯНИЕ
═══════════════════════════════════════════════════════════════

Нет единого snapshot-on-transition паттерна. FK-only на переходах ломает
immutability (lifecycle plan §3): правка каталога «протекает» в архивные
заказы/спеки. Q9 default: denormalize per stage, не mega-collection.

═══════════════════════════════════════════════════════════════
ЧТО ДЕЛАТЬ
═══════════════════════════════════════════════════════════════

ШАГ 1 — Спека helper (SessionRunner-friendly) + контракт inline snapshot
  per stage (что кладём в Order item / Specification / Shipment).
ШАГ 2 — Reference impl на одном переходе (stub или КП→Order hook point).
ШАГ 3 — Документ в ARCHITECTURE.md + companion spec под lifecycle plan.
ШАГ 4 — Не мигрировать всю БД; не трогать legacy Proposal/Quotation merge.

═══════════════════════════════════════════════════════════════
КРИТЕРИИ ПРИЁМКИ
═══════════════════════════════════════════════════════════════

1. Документированный API snapshot helper (+ пример payload).
2. Пример перехода с inline snapshot (тест или thin service method).
3. tsc / unit tests в зоне helper проходят.
4. docs/agent-checklists/TZ-CORE-301.md + ## Executor report (auto).

known_limitation: Не mega-collection. Не full catalog denorm migration.
ПРОМПТ: GEMINI.md + этот файл. Push: по PO.
