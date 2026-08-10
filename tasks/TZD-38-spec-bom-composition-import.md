═══════════════════════════════════════════════════════════════
TZD-38: Спецификация → состав (BOM composition import)
═══════════════════════════════════════════════════════════════

РОЛЬ АГЕНТА: Full-stack Desktop/MCP (composition HITL)
ЗАВИСИМОСТИ: TZD-37 DONE; **желательно TZD-31** (живой toolset); закрывает PARK TZD-35
LAYER: 3+4
CONFLICT KEYS: desktop/mcp/src/write-tools.ts; desktop/mcp/src/tools.ts; desktop/mcp/src/domain-schema.ts; desktop/src/** (studio BOM preview); backend/src/modules/mutation-journal/** (если новые kinds); docs/agent-checklists/TZD-38.md

PAGES: (desktop Import Studio)
PAGE_DOCS: docs/audits/2026-08-10-desktop-excel-import-studio-audit.md

Проверено: composition GET MCP есть; POST composition только REST products/modules; journal material/product passport; TZD-35 был PARK в WAVE-MCP-GAP.

Loose wording: «спецификация изделия» → Product + Module + Material lines в composition (не Order/КП).

═══════════════════════════════════════════════════════════════
ИСХОДНОЕ СОСТОЯНИЕ
═══════════════════════════════════════════════════════════════

Проектировщик отдаёт Excel «из чего состоит изделие». Flat import материалов недостаточен: нужен граф состав с **количеством**.

═══════════════════════════════════════════════════════════════
ЧТО ДЕЛАТЬ
═══════════════════════════════════════════════════════════════

ШАГ 1: Модель строки спецификации
  - Поддержать минимум один профиль колонок (документировать в TZ checklist):
    - `level` / `parentArticle` / `article` / `name` / `qty` / `unit` / `kind` (material|module|product)
  - Эвристика: если колонок иерархии нет — остаться в flat mode TZD-37 (не ломать).

ШАГ 2: Propose kinds
  - Journal или MCP tools: создать/обновить Product, Module; затем **composition line propose** (product←module|material; module←material|module) с qty.
  - Confirm применяет SoT через существующие REST composition endpoints (или batch).
  - Undo ring если journal уже умеет — не расширять без нужды.

ШАГ 3: Studio UI
  - В Import Studio: preview дерева/группировки «изделие → дети» перед Отправить.
  - Конфликты: child article missing → error; qty ≤0 → error.
  - После успеха: изделие в веб-каталоге открывается с составом (ручной verify в checklist).

ШАГ 4: Tests + docs
  - Fixture Excel (маленький) в `desktop/mcp/fixtures/` или `desktop/testdata/`.
  - MCP tool names в MCP.md.
  - Пометить TZD-35 PARK закрытым этим TZ в WAVE-MCP-GAP note.

═══════════════════════════════════════════════════════════════
НЕ ИЗМЕНЯТЬ
═══════════════════════════════════════════════════════════════

- Order/КП import
- Gantt/production
- Замена BomPanel web UI
- Silent apply без user confirm в студии

═══════════════════════════════════════════════════════════════
КРИТЕРИИ ПРИЁМКИ
═══════════════════════════════════════════════════════════════

1. Fixture спецификации (изделие + ≥1 модуль + ≥2 материала с qty) → после confirm состав виден через API/get_product_composition.
2. Flat файл без hierarchy колонок → поведение TZD-37 без регрессии.
3. Дубликат composition line / missing parent → conflict/error в grid, не partial silent graph.
4. Gates: mcp + desktop tests; BE tsc/jest journal если меняли.
5. Archive TZD-38 + note unpark TZD-35; commit/push.

known_limitation: произвольные CAD-выгрузки без стабильных колонок — только после ручного column map; PDF — out of scope.
