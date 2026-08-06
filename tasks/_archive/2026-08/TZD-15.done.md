═══════════════════════════════════════════════════════════════
TZD-15: Agent inbox workspace (drop folder → audit → propose fills) — DONE
═══════════════════════════════════════════════════════════════

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-06
closed_by: Buffy (deepseek-v4-flash, desktop/MCP executor, session №3)
acceptance_status: PASS
verification:
  - Configurable inbox directory (app-data default + user pick): PASS
    (config.ts v3 inbox.dir; карточка «Выбрать папку…» + «По умолчанию»)
  - Watch/detect new xlsx|csv|txt; parse via existing importers: PASS
    (poll 4s + «Сканировать»; excel/csv importers + txt реализован; xlsx smoke)
  - Audit report + propose batch (in-app и MCP kppdf_inbox_*), NO silent SoT write: PASS
    (propose → POST /api/mutation-journal/proposals material.create; confirm/cancel — журнал)
  - After confirm (TZD-13 journal path): move to processed/ или failed/ + log: PASS
  - MCP: kppdf_inbox_list, kppdf_inbox_propose_file (+ MCP.md docs): PASS
  - Feature Integration Checklist §E обновлён: PASS
  - desktop pnpm typecheck: PASS
  - desktop svelte-check: 0 errors
  - desktop pnpm build: PASS
  - desktop/mcp typecheck + tests 17/17 (9 новых inbox-тестов): PASS
  - src-tauri cargo check: PASS (временные иконки сгенерированы и удалены — pre-existing gap)
  - MCP live smoke: tools/list содержит оба inbox-тола; kppdf_inbox_list вернул файлы из inbox dir; wrong key → 401
checklist: docs/agent-checklists/TZD-15.md
lock: .mimocode/locks/TZD-15-agent-inbox-workspace.lock
source: tasks/_backlog/desktop/TZD-15-agent-inbox-workspace.md

---

## Summary

- `desktop/src/core/inbox.ts` (NEW): scan/audit/map/propose/confirm/cancel/move/log.
  Поток: drop → scan → audit (parse через существующие импортёры) → propose
  (только proposal material.create через journal, НЕ запись в SoT) →
  confirm/cancel → файл в processed/ или failed/ + inbox.log. Маппинг колонок
  RU+EN (наименование/name/текст, ед. изм./unit, артикул/article, sku/код,
  категория/categoryId); строки без наименования — skipped (счётчик в audit).
- `desktop/mcp/src/inbox.ts` (NEW): Node-fs зеркало — listInboxFiles,
  parseInboxBytes (xlsx/csv/tsv/txt), mapRowToMaterial, readInboxFile с
  защитой от path-traversal (basename-проверка).
- `desktop/mcp/src/inbox-tools.ts` (NEW): `kppdf_inbox_list` (файлы inbox,
  без processed/failed), `kppdf_inbox_propose_file` (parse → proposal per row,
  propose-only). Регистрация в tools.ts. Зависимости mcp: +xlsx, +papaparse.
- `desktop/src/App.svelte`: карточка «Inbox — файлы для агента» — путь + выбор
  папки/сброс, poll-сканирование 4s, список файлов со статусами
  (Новый/Разобран/Предложен/Применён/Ошибка), кнопки Разобрать → Предложить
  строки → Подтвердить/Отменить → Убрать в failed, предпросмотр строк,
  журнал inbox. Busy-guard на всех кнопках (без double-propose).
- `desktop/src/core/config.ts`: CONFIG_VERSION 2→3, блок `inbox { dir }`,
  migrateInbox нормализует старые конфиги.
- `desktop/src/core/mcpHost.ts`: опция inboxDir → env KPPDF_INBOX_DIR дочернего
  host-процесса; App.svelte передаёт resolveInboxDir(cfg) при каждом startMcp.
- `desktop/src/importers/text.ts`: реализован txt (строки → { текст }), раньше TODO.
- Docs: `desktop/docs/MCP.md` (раздел Tools — inbox + env KPPDF_INBOX_DIR),
  `docs/FEATURE-INTEGRATION-CHECKLIST.md` §E отмечен, `desktop/README.md` v0.5.

Conflict disclosure: только desktop/** + docs/FEATURE-INTEGRATION-CHECKLIST.md §E
(CONFLICT KEYS TZ). frontend catalog/admin/web не тронуты.

Known limits:
- Watch реализован poll'ом (4s), а не нативным fs-watch — зато работает для
  произвольного пользовательского каталога и не требует новой capability.
- Backend-batch propose нет: по строке — отдельный POST (последовательно).
- kppdf_inbox_propose_file требует, чтобы десктоп передал KPPDF_INBOX_DIR при
  спавне host (передаётся при autostart/manual/restart).
- MCP-рантайм не бандлится в MSI (pre-existing, см. TZD-14).

Next: TZD-15 done — следующий десктопный TZ по очереди (TZD-15 был последним
в backlog README; дальше — по PO).
