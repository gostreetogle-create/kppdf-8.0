═══════════════════════════════════════════════════════════════
TZD-45: MCP производство + закупки — read-first минимум
═══════════════════════════════════════════════════════════════

> Domain preflight: аудит §6 — production & supply **не покрыты MCP**.
> Север продукта: КП→Заказ→снабжение→Гант (`docs/PO-DIARY.md`, sales-to-shop canon).
> Эта TZ — **только read (+ опционально 1–2 draft write с userOk)**; не CAD/Гант UI.

РОЛЬ АГЕНТА: Desktop MCP (маппинг на существующие Nest routes)

ЗАВИСИМОСТИ: WAVE P0 (TZD-41…43) DONE предпочтительно. Можно стартовать после 41.

LAYER: 2–3 (новые tool files)

CONFLICT KEYS: desktop/mcp/src/production-tools.ts; desktop/mcp/src/supply-tools.ts; desktop/mcp/src/tools.ts; desktop/docs/MCP.md; desktop/mcp/src/production-tools.test.ts; desktop/mcp/src/supply-tools.test.ts

PAGES: (нет)
PAGE_DOCS: (нет)

═══════════════════════════════════════════════════════════════
ИСХОДНОЕ СОСТОЯНИЕ
═══════════════════════════════════════════════════════════════

Проверено аудитом: в MCP нет production orders / operations / supply requests.
Work-types видны косвенно в модулях; отдельного list/create work-types в MCP нет.

Перед кодом — обязательно grep живых Nest controllers:
- production / work-orders / tasks / gantt (что реально есть)
- supply / purchase / procurement

Не invent endpoints. Если Nest route отсутствует — known_limitation + stub TZ successor.

═══════════════════════════════════════════════════════════════
ЧТО ДЕЛАТЬ
═══════════════════════════════════════════════════════════════

ШАГ 1: Inventory Nest surfaces (записать в checklist таблицу path → tool)

ШАГ 2: Read tools (минимум)

  Production (если есть API):
  - list/get производственных сущностей, доступных менеджеру/админу
  - list work-types (если ещё нет отдельного tool)

  Supply:
  - list/get заявок / заказов поставщику — **только существующие** routes

ШАГ 3: Envelope TZD-41 + MCP.md раздел Production/Supply

ШАГ 4: Tests + registry toolCount

НЕ делать в этой TZ: полное покрытие себестоимости, тендеры, PDF, write-heavy HITL
  (successor после ручного smoke PO).

═══════════════════════════════════════════════════════════════
ИЗМЕНЯТЬ / НЕ ИЗМЕНЯТЬ
═══════════════════════════════════════════════════════════════

ИЗМЕНЯТЬ: CONFLICT KEYS; checklist TZD-45

НЕ ИЗМЕНЯТЬ:
- frontend production cockpit
- Dangerous wipe
- Commercial draft tools (уже TZD-33)

═══════════════════════════════════════════════════════════════
КРИТЕРИИ ПРИЁМКИ
═══════════════════════════════════════════════════════════════

- [ ] Таблица «Nest path → MCP tool» в checklist (даже если 0 write)
- [ ] ≥4 новых read tools **или** явное known_limitation «Nest surface отсутствует»
      с proof (grep) — тогда TZ закрывается как SPIKE.done с successor id
- [ ] healthz toolCount увеличен соответственно
- [ ] `cd desktop/mcp && pnpm test && pnpm exec tsc --noEmit` PASS
- [ ] Deploy НЕ

Финализация: `tasks/_archive/YYYY-MM/TZD-45.done.md` или `.spike.md`

Парковка: P2 — не блокирует менеджерский MCP контур; брать после P0/P1.
