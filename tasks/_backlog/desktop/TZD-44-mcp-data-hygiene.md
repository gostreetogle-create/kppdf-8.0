═══════════════════════════════════════════════════════════════
TZD-44: MCP гигиена данных — поиск дублей + мягкая очистка теста
═══════════════════════════════════════════════════════════════

> Domain preflight: SoT на проде засмущён (`fbdb`, `fhfbgf`, `6565`, `Тест ·…`,
> `ООО «ТестФорма»` — `docs/audits/2026-08-11-mcp-full-audit.md` §5.5).
> Клиент = Counterparty. Опасные ops — только с `userOk:true` + явный префикс/фильтр.
> Канон: `docs/ops/DANGEROUS-OPS.md` — wipe без явного PO запрещён.

РОЛЬ АГЕНТА: Desktop MCP (+ тонкие Nest endpoints только если без них нельзя)

ЗАВИСИМОСТИ: TZD-41 (envelope) желателен. Не блокер.

LAYER: 3 (mcp) / 4 если новые Nest routes

CONFLICT KEYS: desktop/mcp/src/hygiene-tools.ts; desktop/mcp/src/hygiene-tools.test.ts; desktop/mcp/src/tools.ts; desktop/docs/MCP.md; backend/src/modules/counterparty/counterparty.controller.ts; backend/src/modules/material/material.controller.ts; backend/src/modules/product/product.controller.ts

PAGES: (нет)
PAGE_DOCS: (нет)

═══════════════════════════════════════════════════════════════
ИСХОДНОЕ СОСТОЯНИЕ
═══════════════════════════════════════════════════════════════

- Нет MCP delete/soft-delete для контрагентов/мусорных материалов
- Аудит просил: поиск дубликатов по имени/ИНН/SKU + мягкая очистка по префиксу/метке
- Полный wipe tenant — **вне scope**

═══════════════════════════════════════════════════════════════
ЧТО ДЕЛАТЬ
═══════════════════════════════════════════════════════════════

ШАГ 1: Read tools

  - `kppdf_find_duplicates` — entity ∈ {material, product, module, counterparty};
    критерии: name (normalize), sku, inn (для counterparty)
  - Возврат: группы дублей + ids (envelope TZD-41)

ШАГ 2: Soft cleanup (gated)

  - `kppdf_cleanup_test_data` с **обязательным** `userOk:true` и одним из:
    `namePrefix` | `nameRegex` | `ids[]` (max N)
  - Только soft-delete / isActive=false — то, что уже умеет Nest
  - Dry-run режим: `dryRun:true` → список кандидатов, 0 мутаций
  - Запрет без фильтра (пустой cleanup = toolFail)

ШАГ 3: Docs + тесты (мок fetch); live smoke optional

═══════════════════════════════════════════════════════════════
ИЗМЕНЯТЬ / НЕ ИЗМЕНЯТЬ
═══════════════════════════════════════════════════════════════

ИЗМЕНЯТЬ: CONFLICT KEYS (создать hygiene-tools.ts); checklist TZD-44

НЕ ИЗМЕНЯТЬ:
- Hard delete / drop database / WIPE deploy
- Автозапуск cleanup без userOk
- Production/procurement (TZD-45)

═══════════════════════════════════════════════════════════════
КРИТЕРИИ ПРИЁМКИ
═══════════════════════════════════════════════════════════════

- [ ] find_duplicates находит ≥1 группу на фикстуре с двумя одинаковыми именами
- [ ] cleanup без userOk → 0 DELETE/PATCH
- [ ] cleanup dryRun → список, 0 мутаций
- [ ] cleanup с userOk + prefix «Тест» / id ТестФорма — soft-delete через существующий API
- [ ] `cd desktop/mcp && pnpm test && pnpm exec tsc --noEmit` PASS
- [ ] MCP.md: Hygiene protocol
- [ ] Deploy НЕ; на проде cleanup только после явного PO «да, чисти Тест*»

known_limitation: полный вычистить весь исторический мусор вручную PO может
  после tool; агент не делает prod cleanup в closeout без команды PO.

Финализация: `tasks/_archive/YYYY-MM/TZD-44.done.md`
