═══════════════════════════════════════════════════════════════
TZD-41: MCP единый envelope + outputSchema + alias list-имён
═══════════════════════════════════════════════════════════════

> Источник: tasks/_backlog/desktop/TZD-41-mcp-envelope-output-schema.md
> Аудит: docs/audits/2026-08-11-mcp-full-audit.md §5.1–5.2
> (агент не подтвердил 10 продуктов из-за вложенного proposal.proposalId)

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-11T23:10:00Z
closed_by: Buffy
verification:
  - acceptance criteria: PASS
  - typecheck: PASS
  - tests: PASS (113/113)
  - lint: N/A (desktop/mcp не имеет lint-скрипта)
  - checklist: ADDED (docs/agent-checklists/TZD-41.md)
  - progress.md: UPDATED
  - status synchronization: PASS

═══════════════════════════════════════════════════════════════
ЧТО СДЕЛАНО
═══════════════════════════════════════════════════════════════

ШАГ 1 — Канон envelope в `desktop/mcp/src/tool-result.ts`
- `toolOkStructured(payload)` — success с `structuredContent` (SDK валидирует
  при объявленном outputSchema; текст сохранён для text-клиентов).
- `extractProposalId` / `extractEntityId` — нормализация `proposal.proposalId`,
  `result._id` → top-level `proposalId` / `id`.
- `proposeEnvelope(result)` — propose-тулы: top-level `proposalId` + `result` +
  `proposal` (backward-compat dup на 1 волну, deprecated).
- `createEnvelope(result)` — SoT-create: top-level `id` (из `_id`).
- `mutationEnvelope(result)` — confirm/cancel/undo: top-level `id`/`proposalId`.
- outputSchema zod-шейпы: propose/create/mutation/read/batch/draft/plain.
- `toolFail` не менялся (isError освобождён от output-валидации SDK).

ШАГ 2 — Прогон write/commercial/read/stock через helper
- write-tools: все 15 тулов — envelope + outputSchema; batch — `{ ok, result,
  proposalIds[]/applied/cancelled, errors }` (top-level сохранены).
- commercial: counterparty_create/site_create/quotation_create_draft/
  order_create_draft → top-level `id`; гейтинг (userOk) и листы → structured +
  outputSchema; 0 изменений бизнес-логики REST.
- read-tools: list/get (materials, products, modules, graph, storage,
  warehouses) → structured + outputSchema `{ ok, path, result }`.
- stock: create → top-level `id`; list → structured + outputSchema.
- doc/import-task/import-todo/text-block/inbox: create-ответы → top-level
  `id`; остальные ответы → structured (без outputSchema — successor).

ШАГ 3 — Naming canon `kppdf_list_*` + deprecated aliases (1 волна)
- Канон: `kppdf_list_doc_types`, `kppdf_list_doc_template_categories`,
  `kppdf_list_doc_templates`, `kppdf_list_import_tasks`,
  `kppdf_list_import_todos`, `kppdf_list_text_block_categories`,
  `kppdf_list_text_blocks`, `kppdf_list_inbox`.
- Старые `*_list` имена зарегистрированы как deprecated aliases (тот же
  handler); toolCount 51 → 82 (реальный рост +8; 51 было устаревшим).

ШАГ 4 — outputSchema
- 61 тул объявляет outputSchema в `tools/list` (propose/confirm/batch/cancel/
  undo, list/get каталога, все commercial+stock, doc/import/text-block листы).
- Полный sweep оставшихся domain/inbox/audit-тулов — documented successor.

ШАГ 5 — Gates
- `cd desktop/mcp && pnpm test` → 113/113 PASS
- `cd desktop/mcp && pnpm exec tsc --noEmit` → PASS
- Интеграционные тесты с mock fetch подтверждают AC: propose → top-level
  proposalId, counterparty_create → top-level id из `_id`.

═══ CRITICAL NOTE для TZD-42 (confirm-404) ═══
Причина «агент не подтвердил 10 продуктов» закрыта на уровне envelope:
`proposeEnvelope` всегда отдаёт top-level `proposalId`. TZD-42 должен
проверять именно гонку/ownership в журнале, а не парсинг id.

КРИТЕРИИ ПРИЁМКИ
- [x] Любой `kppdf_propose_*` success JSON содержит top-level `proposalId`
- [x] Любой SoT-create success JSON содержит top-level `id` (не только `_id`)
- [x] Агент может вызвать list doc-types / import-tasks / text-block-categories
      через канон `kppdf_list_*` без угадывания
- [x] У ключевых тулов есть `outputSchema` в tools/list (тест registry)
- [x] `pnpm test` PASS (113); `tsc --noEmit` PASS
- [x] MCP.md обновлён («Response envelope (TZD-41)» + naming canon + toolCount 82)
- [x] progress + checklist + archive по GEMINI.md

known_limitation:
- Полный sweep outputSchema на domain/inbox/audit-тулы — successor.
- Live replay на проде не выполнялся (работа в worktree; live MCP крутит
  старую версию кода). Покрыто mock-fetch интеграционными тестами.
- Deploy НЕ.
