═══════════════════════════════════════════════════════════════
TZD-41: MCP единый envelope + outputSchema + alias list-имён
═══════════════════════════════════════════════════════════════

> Domain preflight: зона Desktop MCP (`desktop/mcp`). Не путать Counterparty
> с Organization. Источник боли: `docs/audits/2026-08-11-mcp-full-audit.md` §5.1–5.2
> (агент не подтвердил 10 продуктов из‑за вложенного `proposal.proposalId`).

РОЛЬ АГЕНТА: Desktop MCP (Cursor zone) — TypeScript MCP host

ЗАВИСИМОСТИ: Нет (фундамент P0 после аудита 2026-08-11).
  После TZD-41 желательно TZD-42 (confirm-404) и TZD-43 (product category).

LAYER: 3 (desktop/mcp shared `tool-result` + registerTool surfaces)

CONFLICT KEYS: desktop/mcp/src/tool-result.ts; desktop/mcp/src/tools.ts; desktop/mcp/src/write-tools.ts; desktop/mcp/src/read-tools.ts; desktop/mcp/src/commercial-tools.ts; desktop/mcp/src/doc-tools.ts; desktop/mcp/src/import-task-tools.ts; desktop/mcp/src/import-todo-tools.ts; desktop/mcp/src/text-block-tools.ts; desktop/mcp/src/inbox-tools.ts; desktop/mcp/src/stock-tools.ts; desktop/docs/MCP.md; desktop/mcp/src/tool-result.test.ts

PAGES: (нет UI)
PAGE_DOCS: (нет)

═══════════════════════════════════════════════════════════════
ИСХОДНОЕ СОСТОЯНИЕ
═══════════════════════════════════════════════════════════════

Проверено:
- `desktop/mcp/src/tool-result.ts` — `toolOk(payload)` просто JSON.stringify любого payload; **нет** канона `{ok, result}` / стабильного `id`
- `kppdf_propose_product_create` → `toolOk({ ok: true, proposal: result })` (вложенный id)
- `kppdf_propose_material_create` → тоже `{ ok: true, proposal: result }`, но backend/другие тулы отдают `result._id` vs `id`
- Имена list: `kppdf_list_materials` vs `kppdf_doc_types_list` / `kppdf_import_task_list` / `kppdf_text_block_categories_list`
- MCP `registerTool` сейчас без `outputSchema` — агент не знает форму ответа до вызова
- Аудит: `reports/mcp-audit/AUDIT-REPORT.md` + `docs/audits/2026-08-11-mcp-full-audit.md`

Проблемы:
1. Агент спотыкается о расположение `proposalId` / entity id → пропуск confirm
2. Разнобой имён list-тулов → лишние retries
3. Нет машиночитаемой схемы ответа

═══════════════════════════════════════════════════════════════
ЧТО ДЕЛАТЬ
═══════════════════════════════════════════════════════════════

ШАГ 1: Канон envelope в `tool-result.ts`

  Под-шаг 1.1: Ввести тип/хелперы, например:
    - success: `{ ok: true, result: T, id?: string, proposalId?: string }`
    - для propose: **всегда** top-level `proposalId` (строка) + `result` = полный ответ journal
    - для create SoT (commercial): **всегда** top-level `id` (= `_id` если бэкенд отдал `_id`)
  Под-шаг 1.2: `toolFail` оставить совместимым; success-path только через новый helper
  Под-шаг 1.3: unit-тесты на нормализацию `_id` → `id` и extract `proposalId`

ШАГ 2: Прогнать write/commercial/doc/import/inbox/stock через helper

  Не менять бизнес-логику REST. Только форма ответа агенту.
  Backward-compat: можно дублировать старые поля **один релиз** (`proposal.proposalId` + top-level),
  но AC требуют, что агент читает **только** top-level `proposalId`/`id`.

ШАГ 3: Naming aliases для list

  Под-шаг 3.1: Канон = `kppdf_list_<noun>` (materials, products, doc_types, import_tasks, …)
  Под-шаг 3.2: Зарегистрировать **alias** старых имён (`kppdf_doc_types_list` → тот же handler)
    или переименовать + оставить deprecated alias на 1 волну — выбрать одно и зафиксировать в MCP.md
  Под-шаг 3.3: `TOOL_NAMES` / healthz `toolCount` обновить; тесты registry

ШАГ 4: outputSchema

  Под-шаг 4.1: Для всех write + propose/confirm + ключевых list/get добавить `outputSchema`
    (zod → JSON Schema, как поддерживает `@modelcontextprotocol/sdk` в этой версии)
  Под-шаг 4.2: Минимум: propose_*, confirm_*, list_materials/products, counterparty_create
  Под-шаг 4.3: Документ в `desktop/docs/MCP.md` — раздел «Response envelope (TZD-41)»

ШАГ 5: Gates + smoke

  `cd desktop/mcp && pnpm test && pnpm exec tsc --noEmit`
  Live (если Desktop MCP up): propose material → увидеть top-level proposalId → confirm

═══════════════════════════════════════════════════════════════
ИЗМЕНЯТЬ / НЕ ИЗМЕНЯТЬ
═══════════════════════════════════════════════════════════════

ИЗМЕНЯТЬ: файлы CONFLICT KEYS выше; checklist `docs/agent-checklists/TZD-41.md`

НЕ ИЗМЕНЯТЬ:
- Nest mutation-journal / product DTOs (это TZD-42/43)
- frontend/**
- Production/procurement tools (TZD-45)
- Не удалять старые tool names без alias в том же PR

═══════════════════════════════════════════════════════════════
КРИТЕРИИ ПРИЁМКИ
═══════════════════════════════════════════════════════════════

- [ ] Любой `kppdf_propose_*` success JSON содержит **top-level** `proposalId: string`
- [ ] Любой SoT-create success JSON содержит **top-level** `id: string` (не только `_id`)
- [ ] Alias или rename: агент может вызвать list doc-types / import-tasks / text-block-categories
      через канон `kppdf_list_*` без угадывания
- [ ] У ключевых тулов есть `outputSchema` в tools/list (проверить скриптом или snapshot-тестом)
- [ ] `cd desktop/mcp && pnpm test` PASS; `pnpm exec tsc --noEmit` PASS
- [ ] MCP.md обновлён; progress + archive по GEMINI.md
- [ ] known_limitation: полный sweep всех 70+ tools outputSchema может быть successor, если
      AC покрыл write+propose+confirm+core list

known_limitation:
- Не чинит confirm-404 (TZD-42)
- Не добавляет categoryId в product propose (TZD-43)

Финализация: `tasks/_archive/YYYY-MM/TZD-41.done.md` + checklist + lock; Deploy НЕ
