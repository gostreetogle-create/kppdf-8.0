═══════════════════════════════════════════════════════════════
TZD-44: MCP гигиена данных — поиск дублей + мягкая очистка теста
═══════════════════════════════════════════════════════════════

> Источник: tasks/_backlog/desktop/TZD-44-mcp-data-hygiene.md
> Аудит: docs/audits/2026-08-11-mcp-full-audit.md §5.5
> (fbdb / fhfbgf / 6565 / Тест ·… / ООО «ТестФорма»)

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-12T01:20:00Z
closed_by: Buffy
verification:
  - acceptance criteria: PASS
  - typecheck: PASS
  - tests: PASS (desktop/mcp 132/132)
  - lint: N/A (нет lint-скрипта в desktop/mcp)
  - checklist: ADDED (docs/agent-checklists/TZD-44.md)
  - progress.md: UPDATED
  - status synchronization: PASS

═══════════════════════════════════════════════════════════════
ЧТО СДЕЛАНО
═══════════════════════════════════════════════════════════════

ШАГ 1 — Read tools: `kppdf_find_duplicates`
- entity ∈ material|product|module|counterparty; criteria name (нормализация:
  trim + lowercase + схлопывание пробелов) / sku / inn; default per entity
  (material/product → name+sku; module → name; counterparty → name+inn).
- Выкачивает все активные items (page/limit=100; soft-deleted исключаются по
  deletedAt), возвращает группы count ≥ 2: { criterion, key, count, ids, items }.

ШАГ 2 — Soft cleanup (gated): `kppdf_cleanup_test_data`
- Гейты до запросов: userOk !== true → toolFail; нет фильтра (namePrefix |
  nameRegex | ids[] ≤100) → toolFail. 0 DELETE в обоих случаях.
- dryRun:true → кандидаты + truncated, 0 мутаций.
- Иначе — мягкое удаление через СУЩЕСТВУЮЩИЕ DELETE endpoints
  (materials/products/modules/counterparties; backend ставит deletedAt /
  status=archived). Возврат deletedCount / failed[] (id+error).
- max кандидатов (default 200, cap 500).

ШАГ 3 — Инфраструктура
- backend.ts: `backendDeleteJson` (DELETE + 204 → null).
- tools.ts: HYGIENE_TOOL_NAMES + registerHygieneTools; toolCount 82 → 84.

ШАГ 4 — Тесты (hygiene-tools.test.ts, 13 новых)
- findDuplicateGroups: фикстура 2 одинаковых имени → группа (name-group);
  sku/inn-дубли; одиночные — не дубли; soft-deleted игнорируются.
- selectCleanupCandidates: namePrefix / nameRegex / ids / max+truncated.
- Handler (mock fetch): без userOk → 0 DELETE; без фильтра → 0 DELETE;
  dryRun → кандидаты 0 DELETE; userOk+prefix → DELETE каждого кандидата;
  userOk+ids → только указанные; find_duplicates через handler.

ШАГ 5 — MCP.md
- «Tools — data hygiene (TZD-44)» + Hygiene protocol (dryRun → показать
  человеку → userOk) + запреты; toolCount 84.

КРИТЕРИИ ПРИЁМКИ
- [x] find_duplicates находит ≥1 группу на фикстуре с двумя одинаковыми именами
- [x] cleanup без userOk → 0 DELETE/PATCH
- [x] cleanup dryRun → список, 0 мутаций
- [x] cleanup с userOk + prefix «Тест» / id ТестФорма — soft-delete через существующий API
- [x] `cd desktop/mcp && pnpm test` PASS (132) && `pnpm exec tsc --noEmit` PASS
- [x] MCP.md: Hygiene protocol
- [x] Deploy НЕ; прод-cleanup НЕ запускался (ждёт явного PO «да, чисти Тест*»)

known_limitation:
- Полная ручная вычистка исторического мусора PO может сделать после тула;
  агент НЕ делает prod cleanup в closeout без команды PO.
- Live smoke на проде не выполнялся (worktree; live MCP — старый код).
